module.exports = [
  {
    id: `infinite-pan`,
    name: `Infinite pan`,
    description: `Whether panMax is set to "infinite"`,

    /**
     * @param {!Fixture} fixture The Fixture instance
     * @returns {!boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => hasFixtureInfinitePanTilt(fixture, `Pan`)
  },
  {
    id: `infinite-tilt`,
    name: `Infinite tilt`,
    description: `Whether tiltMax is set to "infinite"`,

    /**
     * @param {!Fixture} fixture The Fixture instance
     * @returns {!boolean} true if the fixture uses the feature
     */
    hasFeature: fixture => hasFixtureInfinitePanTilt(fixture, `Tilt`)
  }
];

/**
 * @param {!Fixture} fixture The fixture to check.
 * @param {'Pan'|'Tilt'} panOrTilt Whether to check endless pan or tilt.
 * @returns {!boolean} Whether this fixture has endless pan/tilt.
 */
function hasFixtureInfinitePanTilt(fixture, panOrTilt) {
  const physicals = fixture.modes.map(mode => mode.physical).concat(fixture.physical);
  return physicals.some(physical =>
    physical && physical[`focus${panOrTilt}Max`] === Number.POSITIVE_INFINITY
  );
}
