const path = require('path');
const modelPath = path.join(path.resolve(), 'model', 'Fixture.js');

let Fixture;
let fix1;
let fix2;
let fix3;
let fix4;

function reload() {  
  delete require.cache[require.resolve(modelPath)];
  Fixture = require(modelPath);

  fix1 = Fixture.fromRepository('cameo', 'outdoor-par-tri-12');
  fix2 = Fixture.fromRepository('elation', 'platinum-hfx');
  fix3 = Fixture.fromRepository('eurolite', 'led-tmh-x25');
  fix4 = Fixture.fromRepository('futurelight', 'pro-slim-par-7-hcl');
}