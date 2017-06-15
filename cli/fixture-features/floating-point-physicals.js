let properties = {
  'dimensions ([#133](https://github.com/FloEdelmann/open-fixture-library/issues/133))': ['dimensions'],
  'weight': ['weight'],
  'power': ['power'],
  'color temperature': ['bulb', 'colorTemperature'],
  'lumens': ['bulb', 'lumens'],
  'lens degrees': ['lens', 'degreesMinMax'],
  'pan/tilt max': ['focus', ['panMax', 'tiltMax']]
};

module.exports = [];
let startOrder = 96;
for (const name of Object.keys(properties)) {
  const property = properties[name];

  module.exports.push({
    name: `Floating point ${name}`,
    description: 'In fixture physical or in a mode\'s physical override.',
    order: startOrder--,
    hasFeature: (fixture, fineChannels) => {
      if (isFloatInPhysical(fixture.physical, property)) {
        return true;
      }
      for (const mode of fixture.modes) {
        if ('physical' in mode && isFloatInPhysical(mode.physical, property)) {
          return true;
        }
      }
      return false;
    }
  });
}

function isFloatInPhysical(physical, propertyPath) {
  const values = getPropertyValues(physical, propertyPath);
  if (values !== undefined) {
    for (const value of values) {
      if (value !== undefined && value % 1 !== 0) {
        return true;
      }
    }
  }
  return false;
}

function getPropertyValues(object, propertyPath) {
  const property = propertyPath[0];

  if (Array.isArray(property)) {
    let endValues = [];
    for (const endProperty of property) {
      endValues.push(object[endProperty]);
    }
    return endValues;
  }

  let values = object[property];
  if (Array.isArray(values)) {
    return values;
  }
  if (values === undefined || propertyPath.length === 1) {
    return [values];
  }
  return getPropertyValues(values, propertyPath.slice(1, propertyPath.length));
}