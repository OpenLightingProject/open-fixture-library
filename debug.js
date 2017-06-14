const path = require('path');
const modelPath = path.join(path.resolve(), 'model', 'Fixture.js');

let Fixture;
let myFix;

function reload() {  
  delete require.cache[require.resolve(modelPath)]
  Fixture = require(modelPath);

  myFix = Fixture.fromRepository('cameo', 'outdoor-par-tri-12')
}