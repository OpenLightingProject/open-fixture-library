const GitHubApi = require('github');
const fs = require('fs');
const path = require('path');
const env = require('node-env-file');

const repository = process.env.NODE_ENV === 'production' ? 'open-fixture-library' : 'ofl-test';

const github = new GitHubApi({
  debug: false,
  protocol: 'https',
  host: 'api.github.com',
  headers: {
    'user-agent': 'Open Fixture Library'
  },
  followRedirects: false,
  timeout: 5000
});

let branchName;
let warnings;
let changedFiles;

/**
 * out parameter is an object like returned from the import plugins:
 *   {
 *     manufacturers: {
 *       // like in manufacturers.json
 *     },
 *     fixtures: {
 *       'manufacturerKey/fixtureKey': {
 *         // like in fixture JSON files
 *       }
 *     },
 *     submitter: 'name / github username' // optional
 *   }
 *
 *  callback = function(errorObj, pullRequestUrl)
 */
module.exports = function createPullRequest(out, callback) {
  const envFile = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envFile)) {
    env(envFile);
  }

  let userToken = process.env.GITHUB_USER_TOKEN;
  if (userToken === undefined) {
    console.error('.env file does not contain GITHUB_USER_TOKEN variable');
    callback('GitHub user token was not set', null);
    return;
  }

  let pullRequestUrl;

  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  branchName = 'branch' + timestamp;

  changedFiles = [];
  warnings = [];

  github.authenticate({
    type: 'token',
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

    console.log(`create new branch '${branchName}' ...`);
    return github.gitdata.createReference({
      owner: 'FloEdelmann',
      repo: repository,
      ref: 'refs/heads/' + branchName,
      sha: latestCommitHash
    });
  })
  .then(() => {
    console.log('done');

    if (Object.keys(out.manufacturers).length === 0) {
      return Promise.resolve();
    }

    return addOrUpdateFile('fixtures/manufacturers.json', 'manufacturers.json', oldFileContent => {
      if (oldFileContent == null) {
        return prettyStringify(out.manufacturers);
      }
      out.manufacturers = Object.assign({}, JSON.parse(oldFileContent), out.manufacturers);
      return prettyStringify(out.manufacturers);
    });
  })
  .then(() => {
    let chain = Promise.resolve();

    for (const fixtureKey of Object.keys(out.fixtures)) {
      chain = chain.then(() => addOrUpdateFile(`fixtures/${fixtureKey}.json`, `fixture '${fixtureKey}'`, oldFileContent => {
        return prettyStringify(out.fixtures[fixtureKey]);
      }));
    }

    return chain;
  })
  .then(() => addOrUpdateFile('fixtures/register.json', 'register.json', oldFileContent => {
    let register = (oldFileContent !== null) ? JSON.parse(oldFileContent) : {
      filesystem: {},
      manufacturers: {},
      categories: {},
      contributors: {}
    };

    // add new fixtures to register
    for (const fixtureKey of Object.keys(out.fixtures)) {
      const [manKey, fixKey] = fixtureKey.split('/');
      const fixData = out.fixtures[fixtureKey];

      let lastAction = 'modified';
      if (fixData.meta.lastModifyDate === fixData.meta.createDate) {
        lastAction = 'created';
      }
      else if ('importPlugin' in fixData.meta && fixData.meta.lastModifyDate === fixData.meta.importPlugin) {
        lastAction = 'imported';
      }

      // add to filesystem register
      register.filesystem[fixtureKey] = {
        name: fixData.name,
        lastModifyDate: fixData.meta.lastModifyDate,
        lastAction: lastAction
      };

      // add to manufacturer register
      if (!(manKey in register.manufacturers)) {
        register.manufacturers[manKey] = [];
      }
      register.manufacturers[manKey].push(fixKey);

      // add to category register
      for (const cat of fixData.categories) {
        if (!(cat in register.categories)) {
          register.categories[cat] = [];
        }
        register.categories[cat].push(fixtureKey);
      }

      // add to contributor register
      for (const contributor of fixData.meta.authors) {
        if (!(contributor in register.contributors)) {
          register.contributors[contributor] = [];
        }
        register.contributors[contributor].push(fixtureKey);
      }
    }

    return prettyStringify(getSortedRegister(register));
  }))
  .then(() => {
    console.log('create pull request ...');

    const addedFixtures = changedFiles.filter(line => line.startsWith('add fixture'));
    let title = `add ${addedFixtures.length} new fixtures`;
    if (addedFixtures.length === 1) {
      title = addedFixtures[0];
    }

    let body = changedFiles.map(line => '* ' + line).join('\n');

    if (warnings.length > 0) {
      body += '\n\n### Warnings:\n* ' + warnings.join('\n* ');
    }

    if (Object.keys(out.warnings || {}).length > 0) {
      body += '\n\n### Fixture warnings';
      for (const fix of Object.keys(out.warnings)) {
        body += `\n* :warning: ${fix}\n  - `;
        body += out.warnings[fix].join('\n  - ');
      }
    }

    if (Object.keys(out.errors || {}).length > 0) {
      body += '\n\n### Fixture errors';
      for (const fix of Object.keys(out.errors)) {
        body += `\n* :x: ${fix}\n  - `;
        body += out.errors[fix].join('\n  - ');
      }
    }

    if ('submitter' in out) {
      body += `\n\nThank you @${out.submitter}!`;
    }

    return github.pullRequests.create({
      owner: 'FloEdelmann',
      repo: repository,
      title: title,
      body: body,
      head: branchName,
      base: 'master'
    });
  })
  .then(result => {
    console.log('done');
    pullRequestUrl = result.data.html_url;

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
    callback(null, pullRequestUrl);
  })
  .catch(error => {
    console.error('Error: ' + error.message);
    callback(error.message, null);
  });
};


function addOrUpdateFile(filename, displayName, newContentFunction) {
  console.log(`does ${displayName} exist?`);

  return github.repos.getContent({
    owner: 'FloEdelmann',
    repo: repository,
    path: filename
  })
  .then(result => {
    console.log('yes -> update it ...');

    const oldFileContent = Buffer.from(result.data.content, result.data.encoding).toString('utf8');
    const newFileContent = newContentFunction(oldFileContent);

    if (oldFileContent === newFileContent) {
      console.log('no need to update, files are the same');
      return Promise.resolve();
    }

    return github.repos.updateFile({
      owner: 'FloEdelmann',
      repo: repository,
      path: filename,
      message: `Update ${displayName} via editor`,
      content: encodeBase64(newFileContent),
      sha: result.data.sha,
      branch: branchName
    })
    .then(() => {
      console.log('done');
      changedFiles.push(`update ${displayName}`);
    })
    .catch(error => {
      console.error(`Error updating ${displayName}: ${error.message}`);
      warnings.push(`* Error updating ${displayName}: \`${error.message}\``);
    });
  })
  .catch(error => {
    console.log('no -> create it ...');
    return github.repos.createFile({
      owner: 'FloEdelmann',
      repo: repository,
      path: filename,
      message: `Add ${displayName} via editor`,
      content: encodeBase64(newContentFunction(null)),
      branch: branchName
    })
    .then(() => {
      console.log('done');
      changedFiles.push(`add ${displayName}`);
    })
    .catch(error => {
      console.error(`Error adding ${displayName}: ${error.message}`);
      warnings.push(`* Error adding ${displayName}: \`${error.message}\``);
    });
  });
}

function getSortedRegister(register) {
  let newRegister = {
    filesystem: {},
    manufacturers: {},
    categories: {},
    contributors: {}
  };

  // copy sorted filesystem into register
  for (const fixKey of Object.keys(register.filesystem).sort()) {
    newRegister.filesystem[fixKey] = register.filesystem[fixKey];
  }

  // copy sorted manufacturers into register
  for (const man of Object.keys(register.manufacturers).sort()) {
    newRegister.manufacturers[man] = register.manufacturers[man];
  }

  // copy sorted categories into register
  for (const cat of Object.keys(register.categories).sort()) {
    newRegister.categories[cat] = register.categories[cat];
  }

  // copy sorted contributors into register
  const sortedContributors = Object.keys(register.contributors).sort(
    (a, b) => register.contributors[b].length - register.contributors[a].length
  );
  for (const contributor of sortedContributors) {
    newRegister.contributors[contributor] = register.contributors[contributor];
  }

  // add fixture list sorted by lastModifyDate
  newRegister.lastUpdated = Object.keys(newRegister.filesystem).sort((a, b) => {
    const aDate = new Date(newRegister.filesystem[a].lastModifyDate);
    const bDate = new Date(newRegister.filesystem[b].lastModifyDate);
    return aDate > bDate ? -1 : aDate < bDate ? 1 : 0;
  });

  return newRegister;
}

function encodeBase64(string) {
  return Buffer.from(string).toString('base64');
}

function prettyStringify(obj) {
  let str = JSON.stringify(obj, null, 2);

  // make number arrays fit in one line
  str = str.replace(/^( +)"(range|dimensions|degreesMinMax)": (\[\n(?:.|\n)*?^\1\])/mg,
    (match, spaces, key, values) => `${spaces}"${key}": [` + JSON.parse(values).join(', ') + ']'
  );

  // make string arrays fit in one line
  str = str.replace(/^( +)"(categories|authors|fineChannelAliases)": (\[\n(?:.|\n)*?^\1\])/mg,
    (match, spaces, key, values) => `${spaces}"${key}": [` + JSON.parse(values).map(val => `"${val}"`).join(', ') + ']'
  );

  return str;
}
