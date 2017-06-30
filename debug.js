const path = require('path');
const modelPath = path.join(path.resolve(), 'lib', 'model');

let Capability;
let Channel;
let Fixture;
let Physical;
let SwitchingChannel;
let Range;
let fix1;
let fix2;
let fix3;
let fix4;

function reload() {
  for (const cachedModule of Object.keys(require.cache)) {
    delete require.cache[cachedModule];
  }
  Capability = require(path.join(modelPath, 'Capability.js'));
  Channel = require(path.join(modelPath, 'Channel.js'));
  Fixture = require(path.join(modelPath, 'Fixture.js'));
  Physical = require(path.join(modelPath, 'Physical.js'));
  SwitchingChannel = require(path.join(modelPath, 'SwitchingChannel.js'));
  Range = require(path.join(modelPath, 'Range.js'));

  fix1 = Fixture.fromRepository('cameo', 'outdoor-par-tri-12');
  fix2 = Fixture.fromRepository('elation', 'platinum-hfx');
  fix3 = Fixture.fromRepository('eurolite', 'led-tmh-x25');
  fix4 = Fixture.fromRepository('futurelight', 'pro-slim-par-7-hcl');
}
reload();

const benchmarkIterations = 10000000;
function benchmark() {
  const t0 = process.hrtime();

  for (let i = 0; i < benchmarkIterations; i++) {
    fix1.physical;
  }

  const deltaT = process.hrtime(t0);

  console.log(deltaT);
}