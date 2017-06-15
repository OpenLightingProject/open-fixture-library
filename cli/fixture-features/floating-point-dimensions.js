module.exports.name = 'Floating point dimensions ([#133](https://github.com/FloEdelmann/open-fixture-library/issues/133))';
module.exports.descriptions = 'In fixture physical or in a mode\'s physical override';
module.exports.order = 95;

module.exports.hasFeature = function(fixture, fineChannels) {
  if (inPhysical(fixture.physical)) {
    return true;
  }
  for (const mode of fixture.modes) {
    if ('physical' in mode && inPhysical(mode.physical)) {
      return true;
    }
  }
  return false;
};

function inPhysical(physical) {
  return 'dimensions' in physical && (
    physical.dimensions[0] % 1 !== 0 ||
    physical.dimensions[1] % 1 !== 0 ||
    physical.dimensions[2] % 1 !== 0
  );
}