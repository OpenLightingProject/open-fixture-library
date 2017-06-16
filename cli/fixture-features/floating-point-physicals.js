module.exports = [
  {
    id: 'floating-point-dimensions',
    name: 'Floating point dimensions ([#133](https://github.com/FloEdelmann/open-fixture-library/issues/133))',
    propertyPath: ['dimensions', [0, 1, 2]]
  },
  {
    id: 'floating-point-weight',
    name: 'Floating point weight',
    propertyPath: ['weight']
  },
  {
    id: 'floating-point-power',
    name: 'Floating point power',
    propertyPath: ['power']
  },
  {
    id: 'floating-point-color-temperature',
    name: 'Floating point color temperature',
    propertyPath: ['bulb', 'colorTemperature']
  },
  {
    id: 'floating-point-lumens',
    name: 'Floating point lumens',
    propertyPath: ['bulb', 'lumens']
  },
  {
    id: 'floating-point-lens-degrees',
    name: 'Floating point lens degrees',
    propertyPath: ['lens', 'degreesMinMax', [0, 1]]
  },
  {
    id: 'floating-point-pan-tilt-max',
    name: 'Floating point pan/tilt max',
    propertyPath: ['focus', ['panMax', 'tiltMax']]
  },
];

let startOrder = 96;
for (const fixFeature of module.exports) {
  fixFeature.description = 'In fixture physical or in a mode\'s physical override.';
  fixFeature.order = startOrder--;
  fixFeature.hasFeature = (fixture, fineChannels) => {
    if (isFloatInPhysical(fixture.physical, fixFeature.propertyPath)) {
      return true;
    }
    for (const mode of fixture.modes) {
      if ('physical' in mode && isFloatInPhysical(mode.physical, fixFeature.propertyPath)) {
        return true;
      }
    }
    return false;
  };
}

function isFloatInPhysical(object, propertyPath) {
  const property = propertyPath[0];

  // propertyPath defines multiple end values (only one floating point is sufficient)
  if (Array.isArray(property)) {
    return property.some(endProperty => {
      // check for each possible end value if it is exist and is a floating point value
      return object[endProperty] !== undefined && object[endProperty] % 1 !== 0
    });
  }

  const value = object[property];
  if (value === undefined) {
    return false;
  }
  // end of property path: check if value is float
  else if (propertyPath.length === 1) {
    return value % 1 !== 0
  }

  // next item in property path
  return isFloatInPhysical(value, propertyPath.slice(1, propertyPath.length));
}