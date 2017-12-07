module.exports = [{
  name: 'Multiple Focuses',
  description: 'True if multiple Pan / Tilt channels are used in some mode.',
  hasFeature: fixture => fixture.modes.some(mode => {
    const multiPan = mode.channels.filter(
      channel => channel.type === 'Pan'
    ).length > 1;

    const multiTilt = mode.channels.filter(
      channel => channel.type === 'Tilt'
    ).length > 1;

    return multiPan || multiTilt;
  })
}];
