#!/usr/bin/node

const path = require('path');

const pullRequest = require('./pull-request.js');

pullRequest.init()
.then(prData => pullRequest.fetchChangedComponents())
.then(changedComponents => {
  if (changedComponents.added.schema ||
      changedComponents.modified.schema ||
      changedComponents.removed.schema) {
    return [`With every change on the schema, its version should be incremented and tagged. See the [Fixture README](https://github.com/FloEdelmann/open-fixture-library/blob/${process.env.TRAVIS_COMMIT}/fixtures/README.md#schema) for further information.`];
  }
  return [];
})
.then(message => pullRequest.updateComment({
  filename: path.relative(path.join(__dirname, '../../'), __filename),
  name: 'Schema has changed',
  lines: message
}))
.catch(error => {
  console.error(error);
  process.exit(1);
});