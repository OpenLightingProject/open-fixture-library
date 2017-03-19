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


const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
const newBranchName = 'branch' + timestamp;
console.log(newBranchName);

github.authenticate({
  type: "token",
  token: userToken
});

// get latest commit hash
github.gitdata.getReference({
  owner: 'FloEdelmann',
  repo: repository,
  ref: 'heads/master'
}).then(result => {
  const latestCommitHash = result.data.object.sha;

  // create a new branch
  return github.gitdata.createReference({
    owner: 'FloEdelmann',
    repo: repository,
    ref: 'refs/heads/' + newBranchName,
    sha: latestCommitHash
  });
}).then(result => {
  console.log(JSON.stringify(result, null, 2));
}).catch(error => {
  console.error('Error: ' + error.message);
});