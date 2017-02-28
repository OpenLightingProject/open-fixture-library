const fs = require('fs');
const path = require('path');
const colors = require('colors');
const diff = require('diff');


// generate test register
require('child_process').execFileSync(
  'node',
  [path.join(__dirname, '..', 'generate-register.js'), 'register-test.json']
);

const actualRegisterPath = path.join(__dirname, '..', 'fixtures', 'register.json');
const testRegisterPath = path.join(__dirname, '..', 'fixtures', 'register-test.json');

try {
  const actualRegister = JSON.parse(fs.readFileSync(actualRegisterPath, 'utf8'));
  const testRegister = JSON.parse(fs.readFileSync(testRegisterPath, 'utf8'));

  const diffs = diff.diffJson(actualRegister, testRegister);

  if (diffs.length > 1) {
    console.error(colors.red('[FAIL]') + ' Generated and saved registers are different (see diff below). Please add the regenerated version to the repository!\n');

    diffs.forEach(function(part) {
      if (part.added) {
        process.stdout.write(colors.green(part.value));
      }
      else if (part.removed) {
        process.stdout.write(colors.red(part.value));
      }
      else {
        process.stdout.write(colors.grey(part.value));
      }
    });

    process.exit(1);
  }
}
catch (readError) {
  console.error(colors.red('[FAIL]') + ' Could not read and parse register files.\n', readError);
  process.exit(1);
}

fs.unlinkSync(testRegisterPath);

console.log(colors.green('[PASS]') + ' Generated and saved registers are the same.');
process.exit(0);