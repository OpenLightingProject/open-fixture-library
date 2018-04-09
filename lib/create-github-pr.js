const GitHubApi = require(`@octokit/rest`);

require(`./load-env-file.js`);

const github = new GitHubApi({
  debug: false,
  protocol: `https`,
  host: `api.github.com`,
  headers: {
    'user-agent': `Open Fixture Library`
  },
  timeout: 5000
});

let branchName;
let warnings;
let changedFiles;
let repository;

/**
 * @callback pullRequestCreated
 * @param {?any} errorObj If no error occured, this is null. Otherwise it can be any error object or message.
 * @param {?string} pullRequestUrl If an error occured, this is null. Otherwise it is the URL of the created pull request.
 */

/**
 * @typedef importPluginReturn
 * @type {!object}
 * @property {!object} manufacturers like in manufacturers.json
 * @property {!object} fixtures Object keys are of the form 'manufacturerKey/fixtureKey', the value is like in fixture JSON files.
 * @property {?string} submitter GitHub user name of the fixture submitter.
 */

/**
 * @param {!importPluginReturn} out The object like returned by an import plugin.
 * @param {!pullRequestCreated} callback A function to call when finished (in either error or success case).
 */
module.exports = function createPullRequest(out, callback) {
  repository = process.env.NODE_ENV === `production` ? `open-fixture-library` : `ofl-test`;

  const userToken = process.env.GITHUB_USER_TOKEN;
  if (userToken === undefined) {
    console.error(`.env file does not contain GITHUB_USER_TOKEN variable`);
    callback(`GitHub user token was not set`, null);
    return;
  }

  let pullRequestUrl;

  const timestamp = new Date().toISOString().replace(/:/g, `-`).replace(/\..+/, ``);
  branchName = `branch${timestamp}`;

  changedFiles = [];
  warnings = [];

  github.authenticate({
    type: `token`,
    token: userToken
  });


  console.log(`get latest commit hash ...`);
  github.gitdata.getReference({
    owner: `OpenLightingProject`,
    repo: repository,
    ref: `heads/master`
  })
    .then(result => {
      const latestCommitHash = result.data.object.sha;
      console.log(latestCommitHash);

      console.log(`create new branch '${branchName}' ...`);
      return github.gitdata.createReference({
        owner: `OpenLightingProject`,
        repo: repository,
        ref: `refs/heads/${branchName}`,
        sha: latestCommitHash
      });
    })
    .then(() => {
      console.log(`done`);

      return addOrUpdateFile(`fixtures/manufacturers.json`, `manufacturers.json`, oldFileContent => {
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
    .then(() => addOrUpdateFile(`fixtures/register.json`, `register.json`, oldFileContent => {
      const register = (oldFileContent !== null) ? JSON.parse(oldFileContent) : {
        filesystem: {},
        manufacturers: {},
        categories: {},
        contributors: {},
        rdm: {}
      };

      // add new manufacturer RDM IDs to register
      for (const manKey of Object.keys(out.manufacturers)) {
        if (manKey !== `$schema` && `rdmId` in out.manufacturers[manKey] && !(out.manufacturers[manKey].rdmId in register.rdm)) {
          register.rdm[out.manufacturers[manKey].rdmId] = {
            key: manKey,
            models: {}
          };
        }
      }

      // add new fixtures to register
      for (const fixtureKey of Object.keys(out.fixtures)) {
        const [manKey, fixKey] = fixtureKey.split(`/`);
        const fixData = out.fixtures[fixtureKey];

        let lastAction = `modified`;
        if (fixData.meta.lastModifyDate === fixData.meta.createDate) {
          lastAction = `created`;
        }
        else if (`importPlugin` in fixData.meta && fixData.meta.lastModifyDate === fixData.meta.importPlugin) {
          lastAction = `imported`;
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

        // add to rdm register
        if (`rdm` in fixData) {
          register.rdm[out.manufacturers[manKey].rdmId].models[fixData.rdm.modelId] = fixKey;
        }
      }

      return prettyStringify(getSortedRegister(register));
    }))
    .then(() => {
      console.log(`create pull request ...`);

      const addedFixtures = changedFiles.filter(line => line.startsWith(`add fixture`));
      let title = `add ${addedFixtures.length} new fixtures`;
      if (addedFixtures.length === 1) {
        title = addedFixtures[0];
      }

      let body = changedFiles.map(line => `* ${line}`).join(`\n`);

      if (warnings.length > 0) {
        body += `\n\n### Warnings:\n* ${warnings.join(`\n* `)}`;
      }

      if (Object.keys(out.warnings || {}).length > 0) {
        body += `\n\n### Fixture warnings`;
        for (const fix of Object.keys(out.warnings)) {
          body += `\n* :warning: ${fix}\n  - `;
          body += out.warnings[fix].join(`\n  - `);
        }
      }

      if (Object.keys(out.errors || {}).length > 0) {
        body += `\n\n### Fixture errors`;
        for (const fix of Object.keys(out.errors)) {
          body += `\n* :x: ${fix}\n  - `;
          body += out.errors[fix].join(`\n  - `);
        }
      }

      const submitterName = out.submitter ? `@${out.submitter}` : `**Anonymous**`;
      body += `\n\nThank you ${submitterName}!`;

      return github.pullRequests.create({
        owner: `OpenLightingProject`,
        repo: repository,
        title: title,
        body: body,
        head: branchName,
        base: `master`
      });
    })
    .then(result => {
      console.log(`done`);
      pullRequestUrl = result.data.html_url;

      console.log(`add labels to pull request ...`);
      return github.issues.addLabels({
        owner: `OpenLightingProject`,
        repo: repository,
        number: result.data.number,
        labels: [`new-fixture`, `via-editor`]
      });
    })
    .then(() => {
      console.log(`done`);
      console.log(`View the pull request at ${pullRequestUrl}`);
      callback(null, pullRequestUrl);
    })
    .catch(error => {
      console.error(`Error: ${error.message}`);
      callback(error.message, null);
    });
};


function addOrUpdateFile(filename, displayName, newContentFunction) {
  console.log(`does ${displayName} exist?`);

  return github.repos.getContent({
    owner: `OpenLightingProject`,
    repo: repository,
    path: filename
  })
    .then(result => {
      console.log(`yes -> update it ...`);

      const oldFileContent = Buffer.from(result.data.content, result.data.encoding).toString(`utf8`);
      const newFileContent = newContentFunction(oldFileContent);

      if (oldFileContent === newFileContent) {
        console.log(`no need to update, files are the same`);
        return Promise.resolve();
      }

      return github.repos.updateFile({
        owner: `OpenLightingProject`,
        repo: repository,
        path: filename,
        message: `Update ${displayName} via editor`,
        content: encodeBase64(newFileContent),
        sha: result.data.sha,
        branch: branchName
      })
        .then(() => {
          console.log(`done`);
          changedFiles.push(`update ${displayName}`);
        })
        .catch(error => {
          console.error(`Error updating ${displayName}: ${error.message}`);
          warnings.push(`* Error updating ${displayName}: \`${error.message}\``);
        });
    })
    .catch(error => {
      console.log(`no -> create it ...`);
      return github.repos.createFile({
        owner: `OpenLightingProject`,
        repo: repository,
        path: filename,
        message: `Add ${displayName} via editor`,
        content: encodeBase64(newContentFunction(null)),
        branch: branchName
      })
        .then(() => {
          console.log(`done`);
          changedFiles.push(`add ${displayName}`);
        })
        .catch(error => {
          console.error(`Error adding ${displayName}: ${error.message}`);
          warnings.push(`* Error adding ${displayName}: \`${error.message}\``);
        });
    });
}

function getSortedRegister(register) {
  const newRegister = {
    filesystem: {},
    manufacturers: {},
    categories: {},
    contributors: {},
    rdm: {}
  };

  // copy sorted filesystem into register
  for (const fixKey of Object.keys(register.filesystem).sort()) {
    newRegister.filesystem[fixKey] = register.filesystem[fixKey];
  }

  // copy sorted manufacturers into register
  for (const man of Object.keys(register.manufacturers).sort()) {
    newRegister.manufacturers[man] = register.manufacturers[man].sort();
  }

  // copy sorted categories into register
  for (const cat of Object.keys(register.categories).sort()) {
    newRegister.categories[cat] = register.categories[cat].sort();
  }

  // copy sorted contributors into register
  const sortedContributors = Object.keys(register.contributors).sort((a, b) => {
    const fixturesDelta = register.contributors[b].length - register.contributors[a].length;
    const nameDelta = a > b ? 1 : a < b ? -1 : 0;
    return fixturesDelta !== 0 ? fixturesDelta : nameDelta;
  });
  for (const contributor of sortedContributors) {
    newRegister.contributors[contributor] = register.contributors[contributor].sort();
  }

  // the higher the value, the higher the rank if the dates are the same
  const lastActionRankMapping = {
    'modified': 10,
    'imported': 20,
    'created': 30
  };

  // add fixture list sorted by lastModifyDate
  newRegister.lastUpdated = Object.keys(newRegister.filesystem).sort((a, b) => {
    const fixA = register.filesystem[a];
    const fixB = register.filesystem[b];
    const dateDelta = new Date(fixB.lastModifyDate) - new Date(fixA.lastModifyDate);
    const actionDelta = lastActionRankMapping[fixB.lastAction] - lastActionRankMapping[fixA.lastAction];
    const keyDelta = a > b ? 1 : a < b ? -1 : 0;
    return dateDelta !== 0 ? dateDelta : (actionDelta !== 0 ? actionDelta : keyDelta);
  });

  // copy sorted RDM data into register
  for (const manId of Object.keys(register.rdm).sort()) {
    newRegister.rdm[manId] = {
      key: register.rdm[manId].key,
      models: {}
    };

    for (const fixId of Object.keys(register.rdm[manId].models).sort()) {
      newRegister.rdm[manId].models[fixId] = register.rdm[manId].models[fixId];
    }
  }

  return newRegister;
}

function encodeBase64(string) {
  return Buffer.from(string).toString(`base64`);
}

function prettyStringify(obj) {
  let str = JSON.stringify(obj, null, 2);

  // make number arrays fit in one line
  str = str.replace(/^( +)"(range|dimensions|degreesMinMax)": (\[\n(?:.|\n)*?^\1\])/mg,
    (match, spaces, key, values) => `${spaces}"${key}": [${JSON.parse(values).join(`, `)}]`
  );

  // make string arrays fit in one line
  str = str.replace(/^( +)"(categories|authors|fineChannelAliases)": (\[\n(?:.|\n)*?^\1\])/mg,
    (match, spaces, key, values) => `${spaces}"${key}": [${JSON.parse(values).map(val => `"${val}"`).join(`, `)}]`
  );

  return `${str}\n`;
}
