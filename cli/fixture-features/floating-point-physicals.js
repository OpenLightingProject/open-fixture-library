let properties = [
  ['dimensions ([#133](https://github.com/FloEdelmann/open-fixture-library/issues/133))', 'dimensions'],
  ['weight', 'weight'],
  ['power', 'power'],
  ['color temperature', 'bulb', 'colorTemperature'],
  ['lumens', 'bulb', 'lumens'],
  ['lens degrees', 'lens', 'degreesMinMax'],
  ['pan/tilt max', 'focus', ['panMax', 'tiltMax']]
];

module.exports = [];
let startOrder = 89 + properties.length;
for (const property of properties) {
  module.exports.push({
    name: `Floating point ${property[0]}`,
    description: 'In fixture physical or in a mode\'s physical override.',
    order: startOrder--,
    hasFeature: (fixture, fineChannels) => {
      let propertyPath = property.slice(1, property.length);
      if (inPhysical(fixture.physical, propertyPath)) {
        return true;
      }
      for (const mode of fixture.modes) {
        if ('physical' in mode && inPhysical(mode.physical, propertyPath)) {
          return true;
        }
      }
      return false;
    }
  });
}

function inPhysical(physical, propertyPath) {
  let values = physical;
  for (const property of propertyPath) {
    if (Array.isArray(property)) {
      let endValues = [];
      for (const endProperty of property) {
        if (endProperty in values) {
          endValues.push(values[endProperty]);
        }
      }
      values = endValues;
      break;
    }
    else if (property in values) {
      values = values[property];
    }
    else {
      return false;
    }
  }
  if (!Array.isArray(values)) {
    values = [values];
  }
  for (const value of values) {
    if (value % 1 !== 0) {
      return true;
    }
  }
  return false;
}