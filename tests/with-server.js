import '../lib/load-env-file.js';

import startServerAndTest from 'start-server-and-test';

const [testCommand] = process.argv.slice(2);

if (!testCommand) {
  throw new Error('A test command is required.');
}

await startServerAndTest.startAndTest({
  services: [{
    start: 'npm run start',
    url: `http://localhost:${process.env.PORT || 3000}`,
  }],
  test: testCommand,
  namedArguments: { expect: 200 },
});
