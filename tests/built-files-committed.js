#!/usr/bin/env node

const path = require(`path`);
const chalk = require(`chalk`);
const childProcess = require(`child_process`);

const projectDirectory = path.join(__dirname, `..`);

try {
  childProcess.execSync(`npm run build`, {
    cwd: projectDirectory,
  });
}
catch (error) {
  console.error(chalk.red(`[FAIL]`), `Unable to run \`npm run build\` command:`, error);
  process.exit(1);
}

// check whether there are unstaged changes (probably created by building before)
const result = childProcess.spawnSync(`git diff --exit-code`, {
  cwd: projectDirectory,
  shell: true,
  stdio: `inherit`,
});
console.log(`\n`);


if (result.status !== 0) {
  console.error(chalk.red(`[FAIL]`), `Built files (or other changes) are not committed. Please run \`npm run build\` and stage (git add) all changes.`);
  process.exit(1);
}

console.log(chalk.green(`[PASS]`), `Built files are committed.`);
process.exit(0);
