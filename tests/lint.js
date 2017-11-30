#!/usr/bin/node

const eslint = require('eslint');
const path = require('path');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2), {
  boolean: ['h', 'c', 'f', 'e'],
  alias: { h: 'help', c: 'compact', f: 'fix', e: 'errors-only' }
});

const helpMessage = [
  'Runs all linter tests.',
  `Usage: node ${path.relative(process.cwd(), __filename)} [ [-c] [-e] | -f | -h ]`,
  'Options:',
  '  --compact,     -c: Compact output.',
  '  --errors-only, -e: Output only errors.',
  '  --fix,         -f: Try to fix the found errors.',
  '  --help,        -h: Show this help message.'
].join('\n');

if (args.help) {
  console.log(helpMessage);
  process.exit(0);
}

let exitcode = 0;

try {
  const cli = new eslint.CLIEngine({
    reportUnusedDisableDirectives: true,
    cwd: path.join(__dirname, '..')
  });

  const files = ['**/*.js'];
  const eslintReport = cli.executeOnFiles(files);

  if (args.fix) {
    const fixCli = new eslint.CLIEngine({
      cwd: path.join(__dirname, '..'),
      fix: true
    });
    const eslintFixReport = fixCli.executeOnFiles(files);
    eslint.CLIEngine.outputFixes(eslintFixReport);

    // for output, use old eslintReport, since fixable errors / warnings are skipped when fix: true is set
    console.log(`${eslintReport.fixableErrorCount} errors and ${eslintReport.fixableWarningCount} warnings fixed.`);
  }
  else {
    if (args['errors-only']) {
      eslintReport.results = eslint.CLIEngine.getErrorResults(eslintReport.results);
    }

    const formatter = cli.getFormatter(args.compact ? 'stylish' : 'codeframe');
    console.log(formatter(eslintReport.results));

    if (eslintReport.errorCount > 0) {
      exitcode = 1;
    }
  }
}
catch (err) {
  console.error('Error: ', err);
}

process.exit(exitcode);
