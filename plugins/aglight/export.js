/* Based on the ofl export plugin */

import namedColors from 'color-name-list/dist/colornames.esm.mjs';
import fixtureJsonStringify from '../../lib/fixture-json-stringify.js';

import importJson from '../../lib/import-json.js';
import Entity from '../../lib/model/Entity.js';
import NullChannel from '../../lib/model/NullChannel.js';

/** @typedef {import('../../lib/model/Fixture.js').default} Fixture */

const units = new Set([`K`, `deg`, `%`, `ms`, `Hz`, `m^3/min`, `rpm`]);
const excludeKeys = new Set([`comment`, `name`, `helpWanted`, `type`, `effectName`, `effectPreset`, `shutterEffect`, `wheel`, `isShaking`, `fogType`, `menuClick`]);

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
  const displayedPluginVersion = options.displayedPluginVersion || version;

  const manufacturers = await importJson(`../../fixtures/manufacturers.json`, import.meta.url);

  const library = {
    version: displayedPluginVersion,
    fixtures: fixtures.map(fixture => {
      try {
        return exportFixture(fixture, manufacturers);
      }
      catch (error) {
        throw new Error(`Exporting fixture ${fixture.manufacturer.key}/${fixture.key} failed: ${error}`, {
          cause: error,
        });
      }
    }),
  };
  return [{
    name: `aglight_fixture_library.json`,
    content: fixtureJsonStringify(library),
    mimetype: `application/aglight-fixture-library`,
    fixtures,
  }];
}

/**
 * @param {Fixture} fixture The fixture to export.
 * @param {object} manufacturers The manufacturers object.
 * @returns {object} The generated fixture JSON.
 */
function exportFixture(fixture, manufacturers) {
  const jsonData = structuredClone(fixture.jsonObject);
  jsonData.fixtureKey = fixture.key;
  jsonData.manufacturer = manufacturers[fixture.manufacturer.key];
  jsonData.oflURL = fixture.url;

  if (!jsonData.availableChannels) {
    jsonData.availableChannels = {};
  }

  downgradePhysical(jsonData.physical);
  transformMatrixChannels(jsonData, fixture);
  transformSingleCapabilityToArray(jsonData);
  transformNonNumericValues(jsonData);

  for (const mode of jsonData.modes) {
    downgradePhysical(mode.physical);
  }

  return jsonData;
}

/**
 * Removes `powerConnectors` from physical.
 * @param {object|undefined} physicalJsonData The physical object to transform.
 */
function downgradePhysical(physicalJsonData) {
  if (physicalJsonData) {
    delete physicalJsonData.powerConnectors;
  }
}

/**
 * Resolves matrix channels in modes' channel lists.
 * It also adds the resolved template channels to `availableChannels` and adds a `pixelKey` property.
 * @param {object} fixtureJson The fixture JSON object where the resolved matrix channels should be saved to.
 * @param {Fixture} fixture The fixture whose template channels should be resolved.
 */
function transformMatrixChannels(fixtureJson, fixture) {
  for (const [index, mode] of fixture.modes.entries()) {
    fixtureJson.modes[index].channels = mode.channelKeys;
  }

  const availableAndMatrixChannels = fixture.coarseChannels.filter(
    channel => !(channel instanceof NullChannel),
  );

  fixtureJson.availableChannels = Object.fromEntries(
    availableAndMatrixChannels.map(channel => {
      let channelJsonObject = structuredClone(channel.jsonObject);

      if (channel.pixelKey) {
        channelJsonObject = {
          ...channelJsonObject,
          pixelKey: channel.pixelKey,
        };
      }

      return [channel.key, channelJsonObject];
    }),
  );

  delete fixtureJson.templateChannels;
}

/**
 * All channels with a single capability are converted to `capabilities: [capability]`,
 * and a `singleCapability` attribute with the value true is added.
 * @param {object} fixtureJson The fixture whose channels should be processed
 */
function transformSingleCapabilityToArray(fixtureJson) {
  for (const channel of Object.values(fixtureJson.availableChannels)) {
    if (channel.capability) {
      channel.capabilities = [channel.capability];
      channel.singleCapability = true;
      delete channel.capability;
    }
  }
}

/**
 * Replace capability properties' entity strings with unitless numbers, and
 * ColorIntensity capabilities' color property with its hex value.
 * @param {object} fixtureJson The fixture whose capabilities should be processed
 */
function transformNonNumericValues(fixtureJson) {
  for (const channel of Object.values(fixtureJson.availableChannels)) {
    for (const capability of channel.capabilities) {
      for (const [key, value] of Object.entries(capability)) {
        if (key === `color`) {
          processColor(capability);
        }
        else if (typeof value === `string` && !excludeKeys.has(key)) {
          capability[key] = getEntityNumber(value);
        }
      }
    }
  }
}


/**
 * @param {object} capability The capability where the color name in the color attribute should be replaced with its hex value
 */
function processColor(capability) {
  const namedColor = namedColors.find(color => color.name === capability.color);
  if (namedColor && namedColor.hex) {
    capability.color = namedColor.hex;
  }
  else {
    // If the color was not found, just ignore it
    // console.log(`#### color not found`, capability.color);
  }
}

/**
 * @param {string} entityString The property value where the entity number should be extracted from.
 * @returns {number | string} A unitless number, or the original property value if it can't be parsed as an entity.
 */
function getEntityNumber(entityString) {
  try {
    const entity = Entity.createFromEntityString(entityString);

    if (entity.keyword !== null) {
      return entityString;
    }

    if (entity.unit === `s`) {
      return entity.number * 1000;
    }

    if (units.has(entity.unit)) {
      return entity.number;
    }
  }
  catch {
    // string could not be parsed as an entity
  }

  return entityString;
}
