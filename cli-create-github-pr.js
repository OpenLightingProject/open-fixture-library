#!/usr/bin/node

const GitHubApi = require('github');

const repository = 'ofl-test'; // 'open-fixture-library';

let userToken = process.env.GITHUB_USER_TOKEN;
if (userToken === undefined) {
  console.info('environment variable GITHUB_USER_TOKEN not set, trying to read it from .env file...');

  const env = require('fs').readFileSync(require('path').join(__dirname, '.env'), 'utf8');

  let match;
  if (match = /^GITHUB_USER_TOKEN=(.*?)$/.exec(env)) {
    userToken = match[1];
  }
  else {
    console.error('.env file does not contain GITHUB_USER_TOKEN variable');
    process.exit(1);
  }
}

// actually should be a parameter filled by the fixture editor
const out = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'github-test-import.json'), 'utf8'));

const github = new GitHubApi({
  debug: false,
  protocol: "https",
  host: "api.github.com",
  headers: {
    'user-agent': 'Open Fixture Library'
  },
  followRedirects: false,
  timeout: 5000
});

let manufacturersAction;
let addedFixtures = [];
let warnings = [];
let pullRequestUrl;

const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
const newBranchName = 'branch' + timestamp;

github.authenticate({
  type: "token",
  token: userToken
});


console.log('get latest commit hash ...');
github.gitdata.getReference({
  owner: 'FloEdelmann',
  repo: repository,
  ref: 'heads/master'
})
.then(result => {
  const latestCommitHash = result.data.object.sha;
  console.log(latestCommitHash);

  console.log(`create new branch '${newBranchName}' ...`);
  return github.gitdata.createReference({
    owner: 'FloEdelmann',
    repo: repository,
    ref: 'refs/heads/' + newBranchName,
    sha: latestCommitHash
  });
})
.then(() => {
  console.log('done');

  return addOrUpdateManufacturers();
})
.then(() => {
  let chain = Promise.resolve();

  for (const fixtureKey in out.fixtures) {
    chain = chain.then(() => addOrUpdateFixture(fixtureKey));
  }

  return chain;
})
.then(() => {
  console.log('create pull request ...');

  let title = `Added ${addedFixtures.length} new fixtures`;
  if (addedFixtures.length == 1) {
    title = `Added fixture '${addedFixtures[0]}'`;
  }

  if (manufacturersAction) {
    addedFixtures.unshift(manufacturersAction);
  }

  let body = addedFixtures.map(fix => '* ' + fix).join('\n');
  if (warnings.length > 0) {
    body += '\n\nWarnings:\n' + warnings.join('\n');
  }

  return github.pullRequests.create({
    owner: 'FloEdelmann',
    repo: repository,
    title: title,
    body: body,
    head: newBranchName,
    base: 'master'
  });
})
.then(result => {
  console.log('done');
  pullRequestUrl = result.data.url;

  console.log('add labels to pull request ...');
  return github.issues.addLabels({
    owner: 'FloEdelmann',
    repo: repository,
    number: result.data.number,
    labels: ['new-fixture', 'via-editor']
  });
})
.then(() => {
  console.log('done');
  console.log('View the pull request at ' + pullRequestUrl);
})
.catch(error => {
  console.error('Error: ' + error.message);
});


function addOrUpdateManufacturers() {
  if (Object.keys(out.manufacturers).length == 0) {
    return Promise.resolve();
  }

  console.log('does manufacturers.json exist?');
  return github.repos.getContent({
    owner: 'FloEdelmann',
    repo: repository,
    path: 'fixtures/manufacturers.json'
  })
  .then(result => {
    console.log('yes -> update it ...');

    const oldManufacturersStr = Buffer.from(result.data.content, result.data.encoding).toString('utf8');
    const newManufacturersStr = prettyStringify(Object.assign({}, JSON.parse(oldManufacturersStr), out.manufacturers));

    if (oldManufacturersStr == newManufacturersStr) {
      console.log('no need to update, files are the same');
      return;
    }

    return github.repos.updateFile({
      owner: 'FloEdelmann',
      repo: repository,
      path: 'fixtures/manufacturers.json',
      message: 'Update manufacturers.json via editor',
      content: encodeBase64(newManufacturersStr),
      sha: result.data.sha,
      branch: newBranchName
    })
    .then(() => {
      console.log('done');
      manufacturersAction = 'updated manufacturers.json';
    })
    .catch(error => addWarning(error, 'manufacturers'));
  })
  .catch(error => {
    console.log('no -> create it ...');
    return github.repos.createFile({
      owner: 'FloEdelmann',
      repo: repository,
      path: 'fixtures/manufacturers.json',
      message: 'Add manufacturers.json via editor',
      content: encodeBase64(prettyStringify(out.manufacturers)),
      branch: newBranchName
    })
    .then(() => {
      console.log('done');
      manufacturersAction = 'added manufacturers.json';
    })
    .catch(error => addWarning(error, 'manufacturers'));
  });
}

function addOrUpdateFixture(fixtureKey) {
  console.log(`does fixture '${fixtureKey}' exist?`);
  const filename = `fixtures/${fixtureKey}.json`;
  return github.repos.getContent({
    owner: 'FloEdelmann',
    repo: repository,
    path: filename
  })
  .then(result => {
    console.log('yes -> update it ...');

    const oldFixtureStr = Buffer.from(result.data.content, result.data.encoding).toString('utf8');
    const newFixtureStr = prettyStringify(out.fixtures[fixtureKey]);

    if (oldFixtureStr == newFixtureStr) {
      console.log('no need to update, files are the same');
      return;
    }

    return github.repos.updateFile({
      owner: 'FloEdelmann',
      repo: repository,
      path: filename,
      message: `Update fixture '${fixtureKey}' via editor`,
      content: encodeBase64(newFixtureStr),
      sha: result.data.sha,
      branch: newBranchName
    })
    .then(() => addFixtureSuccess(fixtureKey))
    .catch(error => addWarning(error, fixtureKey));
  })
  .catch(error => {
    console.log('no -> create it ...');
    return github.repos.createFile({
      owner: 'FloEdelmann',
      repo: repository,
      path: filename,
      message: `Add fixture '${fixtureKey}' via editor`,
      content: encodeBase64(prettyStringify(out.fixtures[fixtureKey])),
      branch: newBranchName
    })
    .then(() => addFixtureSuccess(fixtureKey))
    .catch(error => addWarning(error, fixtureKey));
  });
}


function encodeBase64(string) {
  return Buffer.from(string).toString('base64');
}

function prettyStringify(obj) {
  let str = JSON.stringify(obj, null, 2);

  // make number arrays fit in one line
  str = str.replace(/^( +)"(range|dimensions|degreesMinMax)": (\[\n(?:.|\n)*?^\1\])/mg, (match, spaces, key, values) => {
    return `${spaces}"${key}": [` + JSON.parse(values).join(', ') + ']';
  });

  // make string arrays fit in one line
  str = str.replace(/^( +)"(categories|authors)": (\[\n(?:.|\n)*?^\1\])/mg, (match, spaces, key, values) => {
    return `${spaces}"${key}": [` + JSON.parse(values).map(val => `"${val}"`).join(', ') + ']';
  });

  // make multiByteChannel arrays fit in one line
  str = str.replace(/^( +)"multiByteChannels": (\[\n(?:.|\n)*?^\1\])/mg, (match, spaces, values) => {
    const channelLists = JSON.parse(values).map(channelList => {
      return spaces + '  [' + channelList.map(val => `"${val}"`).join(', ') + ']';
    });
    return `${spaces}"multiByteChannels": [\n` + channelLists.join(',\n') + `\n${spaces}]`;
  });
  return str;
}


function addFixtureSuccess(fixtureKey) {
  console.log('done');
  addedFixtures.push(fixtureKey);
}

function addWarning(error, context) {
  console.error('Error: ' + error.message);
  warnings.push(`* '${context}': \`${error.message}\``);
}