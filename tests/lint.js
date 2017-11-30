#!/usr/bin/node

const eslint = require('eslint');
const path = require('path');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2), {
  boolean: ['h', 'c', 'f'],
  alias: { h: 'help', c: 'compact', f: 'fix' }
});

const helpMessage = [
  'Runs all linter tests.',
  `Usage: node ${path.relative(process.cwd(), __filename)} [-c | -f | -h]`,
  'Options:',
  '  --compact,  -c: Compact output.',
  '  --fix,      -f: Try to fix the found errors.',
  '  --help,     -h: Show this help message.'
].join('\n');

if (args.help) {
  console.log(helpMessage);
  process.exit(0);
}

try {
  const cli = new eslint.CLIEngine({
    reportUnusedDisableDirectives: true,
    cwd: path.join(__dirname, '..'),
    fix: args.fix
  });

  const files = ['**/*.js'];
  const eslintReport = cli.executeOnFiles(files);

  if (args.fix) {
    eslint.CLIEngine.outputFixes(eslintReport);
    console.log(`${eslintReport.fixableErrorCount} errors and ${eslintReport.fixableWarningCount} warnings fixed.`);
  }
  else {
    const formatter = cli.getFormatter(args.compact ? 'stylish' : 'codeframe');
    console.log(formatter(eslintReport.results));
  }
}
catch (err) {
  console.error('Error: ', err);
}
