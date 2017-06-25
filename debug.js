const path = require('path');
const modelPath = path.join(path.resolve(), 'lib', 'model', 'Fixture.js');

let Fixture;
let fix1;
let fix2;
let fix3;
let fix4;

function reload() {
  for (const cachedModule of Object.keys(require.cache)) {
    delete require.cache[cachedModule];
  }
  Fixture = require(modelPath);

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