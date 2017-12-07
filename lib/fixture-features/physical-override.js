module.exports = [{
  name: 'Physical override',
  description: 'Whether at least one mode uses the \'physical\' property',
  hasFeature: fixture => fixture.modes.some(mode => mode.physicalOverride !== null)
}];