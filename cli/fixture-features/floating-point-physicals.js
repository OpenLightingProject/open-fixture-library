module.exports = [
  {
    id: 'floating-point-dimensions',
    name: 'Floating point dimensions ([#133](https://github.com/FloEdelmann/open-fixture-library/issues/133))',
    properties: ['width', 'height', 'depth']
  },
  {
    id: 'floating-point-weight',
    name: 'Floating point weight',
    properties: ['weight']
  },
  {
    id: 'floating-point-power',
    name: 'Floating point power',
    properties: ['power']
  },
  {
    id: 'floating-point-color-temperature',
    name: 'Floating point color temperature',
    properties: ['bulbColorTemperature']
  },
  {
    id: 'floating-point-lumens',
    name: 'Floating point lumens',
    properties: ['bulbLumens']
  },
  {
    id: 'floating-point-lens-degrees',
    name: 'Floating point lens degrees',
    properties: ['lensDegreesMin', 'lensDegreesMin']
  },
  {
    id: 'floating-point-pan-tilt-max',
    name: 'Floating point pan/tilt maximum',
    properties: ['focusPanMax', 'focusTiltMax']
  }
];

let startOrder = 90 + module.exports.length;
for (const fixFeature of module.exports) {
  fixFeature.description = 'In fixture physical or in a mode\'s physical override.';
  fixFeature.order = startOrder--;
  fixFeature.hasFeature = fixture => isFloatInPhysical(fixture.physical, fixFeature.properties) || fixture.modes.some(mode => isFloatInPhysical(mode.physical, fixFeature.properties));
}

function isFloatInPhysical(physical, properties) {
  return physical !== null && properties.some(property => physical[property] !== null && physical[property] % 1 !== 0);
}