#!/usr/bin/env node

import childProcess from 'child_process';
import { fileURLToPath } from 'url';
import { styleText } from 'util';

const projectDirectory = fileURLToPath(new URL('../', import.meta.url));

try {
  childProcess.execSync('npm run build', {
    cwd: projectDirectory,
  });
}
catch (error) {
  console.error(styleText('red', '[FAIL]'), 'Unable to run `npm run build` command:', error);
  process.exit(1);
}

// check whether there are unstaged changes (probably created by building before)
const result = childProcess.spawnSync('git diff --exit-code', {
  cwd: projectDirectory,
  shell: true,
  stdio: 'inherit',
});

// `git diff` ignores untracked files, so explicitly make sure the generated
// OpenAPI bundle was committed as well.
const bundledSpecStatus = childProcess.spawnSync('git', ['status', '--porcelain', '--', 'ui/api/openapi.bundled.json'], {
  cwd: projectDirectory,
  encoding: 'utf-8',
});
console.log('\n');

if (result.status !== 0) {
  console.error(styleText('red', '[FAIL]'), 'Built files (or other changes) are not committed. Please run `npm run build` and stage (git add) all changes.');
  process.exit(1);
}

if (bundledSpecStatus.status !== 0 || bundledSpecStatus.stdout.trim() !== '') {
  console.error(styleText('red', '[FAIL]'), 'The bundled OpenAPI document is not committed. Please run `npm run build:openapi` and stage `ui/api/openapi.bundled.json`.');
  process.exit(1);
}

console.log(styleText('green', '[PASS]'), 'Built files are committed.');
process.exit(0);
