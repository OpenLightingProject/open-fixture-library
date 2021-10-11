/** @typedef {import('../../lib/model/Fixture.js').default} Fixture */

export const version = `1.0.0`;

/**
 * @param {Fixture[]} fixtures An array of Fixture objects.
 * @param {object} options Global options, including:
 * @param {string} options.baseDirectory Absolute path to OFL's root directory.
 * @param {Date} options.date The current time.
 * @param {string | undefined} options.displayedPluginVersion Replacement for plugin version if the plugin version is used in export.
 * @returns {Promise<object[], Error>} The generated files.
 */
export async function exportFixtures(fixtures, options) {
  return fixtures.flatMap(fixture => fixture.modes.map(
    mode => ({
      name: `${fixture.manufacturer.key}_${fixture.key}_${mode.shortName}.lib`,
      content: Buffer.from(getByteArrayForFixtureMode(fixture, mode)),
      mimetype: `binary/octet-stream`,
      fixtures: [fixture],
      modes: [mode],
    }),
  ));
}

/**
 * @param {Fixture} fixture The fixture to export.
 * @param {Mode} mode  The mode to export.
 * @returns {Uint8Array} The exported file's contents.
 */
function getByteArrayForFixtureMode(fixture, mode) {
  const magicNumber = [0x08, 0x00, 0x04, 0x08, 0x00, 0x04, 0x08, 0x00, 0x04];
  const versionCode = 0x01;

  return new Uint8Array([...magicNumber, versionCode]);
}
