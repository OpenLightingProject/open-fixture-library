const GitHubApi = require('github');
const fs = require('fs');
const path = require('path');
const env = require('node-env-file');

const repository = process.env.NODE_ENV === 'production' ? 'open-fixture-library' : 'ofl-test';

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
    callback('GitHub user token was not set', null);
    console.error('.env file does not contain GITHUB_USER_TOKEN variable');
    return;
  }


  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const branchName = 'branch' + timestamp;

  let changedFiles = [];
  let warnings = [];
  let newRegister = {
    filesystem: {},
    manufacturers: {},
    categories: {}
  };
  let pullRequestUrl;

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

    if (Object.keys(out.manufacturers).length == 0) {
      console.log('does manufacturers.json exist?');

      return github.repos.getContent({
        owner: 'FloEdelmann',
        repo: repository,
        path: 'fixtures/manufacturers.json'
      })
      .then(result => {
        console.log('yes -> read it ...');

        const oldFileContent = Buffer.from(result.data.content, result.data.encoding).toString('utf8');
        out.manufacturers = Object.assign({}, JSON.parse(oldFileContent), out.manufacturers);
      })
      .catch(error => {
        console.log('no -> not fatal ...');
      });
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

    for (const fixtureKey in out.fixtures) {
      const [manKey, fixKey] = fixtureKey.split('/');

      newRegister.filesystem[fixtureKey] = {
        name: out.fixtures[fixtureKey].name,
        manufacturerName: (manKey in out.manufacturers) ? out.manufacturers[manKey].name : 'INVALID'
      };

      if (!(manKey in newRegister.manufacturers)) {
        newRegister.manufacturers[manKey] = [];
      }
      newRegister.manufacturers[manKey].push(fixKey);

      for (const cat of out.fixtures[fixtureKey].categories) {
        if (!(cat in newRegister.categories)) {
          newRegister.categories[cat] = [];
        }
        newRegister.categories[cat].push(fixtureKey);
      }

      chain = chain.then(() => addOrUpdateFile(`fixtures/${fixtureKey}.json`, `fixture '${fixtureKey}'`, oldFileContent => {
        return prettyStringify(out.fixtures[fixtureKey]);
      }));
    }

    return chain;
  })
  .then(() => {
    return addOrUpdateFile('fixtures/register.json', 'register.json', oldFileContent => {
      if (oldFileContent == null) {
        return prettyStringify(newRegister);
      }

      let oldRegister = JSON.parse(oldFileContent);

      // overwrite oldRegister's filesystem entries with newRegister ones
      oldRegister.filesystem = Object.assign({}, oldRegister.filesystem, newRegister.filesystem);

      // add newRegister's manufacturers entries to oldRegister
      for (const man in newRegister.manufacturers) {
        if (man in oldRegister.manufacturers) {
          // add each fixture individually
          for (const newFix of newRegister.manufacturers[man]) {
            if (oldRegister.manufacturers[man].indexOf(newFix) == -1) {
              oldRegister.manufacturers[man].push(newFix);
            }
          }
          oldRegister.manufacturers[man] = oldRegister.manufacturers[man].sort();
        }
        else {
          // add all fixtures
          oldRegister.manufacturers[man] = newRegister.manufacturers[man].sort();
        }
      }

      // add newRegister's categories entries to oldRegister
      for (const cat in newRegister.categories) {
        if (cat in oldRegister.categories) {
          // add each fixture individually
          for (const newFix of newRegister.categories[cat]) {
            if (oldRegister.categories[cat].indexOf(newFix) == -1) {
              oldRegister.categories[cat].push(newFix);
            }
          }
          oldRegister.categories[cat] = oldRegister.categories[cat].sort();
        }
        else {
          // add all fixtures
          oldRegister.categories[cat] = newRegister.categories[cat].sort();
        }
      }

      return prettyStringify(oldRegister);
    });
  })
  .then(() => {
    console.log('create pull request ...');

    const addedFixtures = changedFiles.filter(line => line.startsWith('add fixture'));
    let title = `add ${addedFixtures.length} new fixtures`;
    if (addedFixtures.length == 1) {
      title = addedFixtures[0];
    }

    let body = changedFiles.map(line => '* ' + line).join('\n');
    if (warnings.length > 0) {
      body += '\n\nWarnings:\n' + warnings.join('\n');
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

  function addOrUpdateFile(filename, context, newContentFunction) {
    console.log(`does ${context} exist?`);

    return github.repos.getContent({
      owner: 'FloEdelmann',
      repo: repository,
      path: filename
    })
    .then(result => {
      console.log('yes -> update it ...');

      const oldFileContent = Buffer.from(result.data.content, result.data.encoding).toString('utf8');
      const newFileContent = newContentFunction(oldFileContent);

      if (oldFileContent == newFileContent) {
        console.log('no need to update, files are the same');
        return;
      }

      return github.repos.updateFile({
        owner: 'FloEdelmann',
        repo: repository,
        path: filename,
        message: `Update ${context} via editor`,
        content: encodeBase64(newFileContent),
        sha: result.data.sha,
        branch: branchName
      })
      .then(() => {
        console.log('done');
        changedFiles.push(`update ${context}`);
      })
      .catch(error => {
        console.error(`Error updating ${context}: ${error.message}`);
        warnings.push(`* Error updating ${context}: \`${error.message}\``);
      });
    })
    .catch(error => {
      console.log('no -> create it ...');
      return github.repos.createFile({
        owner: 'FloEdelmann',
        repo: repository,
        path: filename,
        message: `Add ${context} via editor`,
        content: encodeBase64(newContentFunction(null)),
        branch: branchName
      })
      .then(() => {
        console.log('done');
        changedFiles.push(`add ${context}`);
      })
      .catch(error => {
        console.error(`Error adding ${context}: ${error.message}`);
        warnings.push(`* Error adding ${context}: \`${error.message}\``);
      });
    });
  }
};


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