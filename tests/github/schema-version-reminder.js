#!/usr/bin/node

const path = require('path');

const pullRequest = require('./pull-request.js');

require('../../lib/load-env-file.js');

pullRequest.checkEnv()
  .catch(error => {
    console.error(error);
    process.exit(0); // if the environment is not correct, just exit without failing
  })
  .then(() => pullRequest.init())
  .then(prData => pullRequest.fetchChangedComponents())
  .then(changedComponents => {
    const lines = [];

    if (changedComponents.added.schema ||
      changedComponents.modified.schema ||
      changedComponents.removed.schema) {
      lines.push(`With every change on the schema, its version should be incremented and tagged. See the [Fixture README](https://github.com/FloEdelmann/open-fixture-library/blob/${process.env.TRAVIS_PULL_REQUEST_BRANCH}/fixtures/README.md#schema) for further information.`);
    }

    return pullRequest.updateComment({
      filename: path.relative(path.join(__dirname, '../../'), __filename),
      name: 'Schema has changed',
      lines: lines
    });
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
