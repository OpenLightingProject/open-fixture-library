#!/usr/bin/env node

import '../../lib/load-env-file.js';

import * as pullRequest from './pull-request.js';

try {
  await pullRequest.checkEnv();
  await pullRequest.init();
  const changedComponents = await pullRequest.fetchChangedComponents();

  const lines = [];

  if (changedComponents.added.schema ||
    changedComponents.modified.schema ||
    changedComponents.removed.schema) {
    lines.push(`With every change on the schema, its version should be incremented and tagged. See the [Fixture README](https://github.com/OpenLightingProject/open-fixture-library/blob/${process.env.GITHUB_PR_HEAD_REF}/docs/fixture-format.md#schema) for further information.`);
  }

  await pullRequest.updateComment({
    fileUrl: new URL(import.meta.url),
    name: `Schema has changed`,
    lines,
  });
}
catch (error) {
  console.error(error);
  process.exit(1);
}
