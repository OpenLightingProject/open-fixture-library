const schemaProperties = require(`../../../../lib/schema-properties.js`).default;
const { checkFixture } = require(`../../../../tests/fixture-valid.js`);
const { CoarseChannel } = require(`../../../../lib/model.js`);

/** @typedef {import('openapi-backend').Context} OpenApiBackendContext */
/** @typedef {import('../../index.js').ApiResponse} ApiResponse */
/** @typedef {import('../../../../lib/types.js').FixtureCreateResult} FixtureCreateResult */

/**
 * Converts the given editor fixture data into OFL fixtures and responds with a FixtureCreateResult.
 * @param {OpenApiBackendContext} ctx Passed from OpenAPI Backend.
 * @returns {ApiResponse} The handled response.
 */
function createFixtureFromEditor({ request }) {
  try {
    const fixtureCreateResult = getFixtureCreateResult(request.requestBody);
    return {
      statusCode: 201,
      body: fixtureCreateResult,
    };
  }
  catch (error) {
    return {
      statusCode: 400,
      body: {
        error: error.message,
      },
    };
  }
}


/**
 * @param {Array.<Object>} fixtures The raw fixture data from the Fixture Editor.
 * @returns {FixtureCreateResult} The created OFL fixtures (and manufacturers) with warnings and errors.
 */
function getFixtureCreateResult(fixtures) {
  const result = {
    manufacturers: {},
    fixtures: {},
    warnings: {},
    errors: {},
  };

  // { 'uuid 1': 'new channel key 1', ... }
  const channelKeyMapping = {};

  fixtures.forEach(fixture => addFixture(fixture));

  return result;

  function addFixture(fixture) {
    const manufacturerKey = getManufacturerKey(fixture);
    const fixtureKey = getFixtureKey(fixture, manufacturerKey);
    const key = `${manufacturerKey}/${fixtureKey}`;

    result.fixtures[key] = {
      $schema: `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json`,
    };

    for (const property of Object.keys(schemaProperties.fixture)) {
      if (property === `physical`) {
        const physical = getPhysical(fixture.physical);
        if (!isEmptyObject(physical)) {
          result.fixtures[key].physical = physical;
        }
      }
      else if (property === `meta`) {
        const now = (new Date()).toISOString().replace(/T.*/, ``);

        result.fixtures[key].meta = {
          authors: [fixture.metaAuthor],
          createDate: now,
          lastModifyDate: now,
        };
      }
      else if (property === `links`) {
        addLinks(result.fixtures[key], fixture.links);
      }
      else if (property === `availableChannels`) {
        result.fixtures[key].availableChannels = {};
        for (const channelId of Object.keys(fixture.availableChannels)) {
          addAvailableChannel(key, fixture.availableChannels, channelId);
        }
      }
      else if (property === `rdm` && propertyExistsIn(`rdmModelId`, fixture)) {
        result.fixtures[key].rdm = {
          modelId: fixture.rdmModelId,
        };
        if (propertyExistsIn(`rdmSoftwareVersion`, fixture)) {
          result.fixtures[key].rdm.softwareVersion = fixture.rdmSoftwareVersion;
        }
      }
      else if (property === `modes`) {
        result.fixtures[key].modes = [];
        for (const mode of fixture.modes) {
          addMode(key, mode);
        }
      }
      else if (property === `wheels`) {
        addWheels(result.fixtures[key], fixture);
      }
      else if (propertyExistsIn(property, fixture)) {
        result.fixtures[key][property] = fixture[property];
      }
    }


    const checkResult = checkFixture(manufacturerKey, fixtureKey, result.fixtures[key]);

    result.warnings[key] = checkResult.warnings;
    result.errors[key] = checkResult.errors;
  }

  /**
   * If a new manufacturer was entered in the editor, it is also saved here.
   * @param {Object} fixture The editor fixture object.
   * @returns {String} The manufacturer key.
   */
  function getManufacturerKey(fixture) {
    if (fixture.useExistingManufacturer) {
      return fixture.manufacturerKey;
    }

    // add new manufacturer
    const manufacturerKey = slugify(fixture.newManufacturerName);

    result.manufacturers[manufacturerKey] = {
      name: fixture.newManufacturerName,
    };

    if (propertyExistsIn(`newManufacturerComment`, fixture)) {
      result.manufacturers[manufacturerKey].comment = fixture.newManufacturerComment;
    }

    if (propertyExistsIn(`newManufacturerWebsite`, fixture)) {
      result.manufacturers[manufacturerKey].website = fixture.newManufacturerWebsite;
    }

    if (propertyExistsIn(`newManufacturerRdmId`, fixture)) {
      result.manufacturers[manufacturerKey].rdmId = fixture.newManufacturerRdmId;
    }

    return manufacturerKey;
  }

  /**
   * @param {Object} fixture The editor fixture object.
   * @param {String} manufacturerKey The manufacturer key of the fixture.
   * @returns {String} The fixture key.
   */
  function getFixtureKey(fixture, manufacturerKey) {
    if (`key` in fixture && fixture.key !== `[new]`) {
      return fixture.key;
    }

    let fixtureKey = slugify(fixture.name);

    const otherFixtureKeys = new Set(Object.keys(result.fixtures).filter(
      key => key.startsWith(manufacturerKey),
    ).map(key => key.slice(manufacturerKey.length + 1)));

    while (otherFixtureKeys.has(fixtureKey)) {
      fixtureKey += `-2`;
    }

    return fixtureKey;
  }

  function getPhysical(from) {
    const physical = {};

    for (const property of Object.keys(schemaProperties.physical)) {
      if (schemaProperties.physical[property].type === `object`) {
        physical[property] = {};

        for (const subProperty of Object.keys(schemaProperties.physical[property].properties)) {
          if (propertyExistsIn(subProperty, from[property])) {
            physical[property][subProperty] = getComboboxInput(subProperty, from[property]);
          }
        }

        if (isEmptyObject(physical[property])) {
          delete physical[property];
        }
      }
      else if (propertyExistsIn(property, from)) {
        physical[property] = getComboboxInput(property, from);
      }
    }

    return physical;
  }

  /**
   * @param {Object} fixture The OFL fixture object to save the links to.
   * @param {Array.<Object>} editorLinksArray The editor link object array.
   */
  function addLinks(fixture, editorLinksArray) {
    fixture.links = {};

    const linkTypes = Object.keys(schemaProperties.links);

    for (const linkType of linkTypes) {
      const linksOfType = editorLinksArray.filter(
        linkObject => linkObject.type === linkType,
      ).map(linkObject => linkObject.url);

      if (linksOfType.length > 0) {
        fixture.links[linkType] = linksOfType;
      }
    }
  }

  /**
   * Sanitize and save wheels from the editor's channel objects, if there are any.
   * @param {Object} fixture The OFL fixture object to save the wheels to.
   * @param {Object} editorFixture The editor fixture object to get the wheels from.
   */
  function addWheels(fixture, editorFixture) {
    const editorWheelChannels = Object.values(editorFixture.availableChannels).filter(
      editorChannel => editorChannel.wheel && editorChannel.wheel.slots.length > 0 && editorChannel.wheel.slots.some(
        editorWheelSlot => editorWheelSlot !== null && editorWheelSlot.type !== ``,
      ),
    );

    if (editorWheelChannels.length === 0) {
      return;
    }

    fixture.wheels = {};

    editorWheelChannels.forEach(editorChannel => {
      const slots = editorChannel.wheel.slots.map(editorWheelSlot => {
        if (editorWheelSlot === null || editorWheelSlot.type === ``) {
          return null;
        }

        const wheelSlot = {
          type: editorWheelSlot.type,
        };

        const wheelSlotSchema = schemaProperties.wheelSlotTypes[wheelSlot.type];

        for (const slotProperty of Object.keys(wheelSlotSchema.properties)) {
          if (propertyExistsIn(slotProperty, editorWheelSlot.typeData)) {
            wheelSlot[slotProperty] = editorWheelSlot.typeData[slotProperty];
          }
        }

        return wheelSlot;
      });

      // remove trailing null slots
      while (slots[slots.length - 1] === null) {
        slots.pop();
      }

      fixture.wheels[editorChannel.name] = {
        slots,
      };
    });
  }

  function addAvailableChannel(fixtureKey, availableChannels, channelId) {
    const from = availableChannels[channelId];

    if (`coarseChannelId` in from) {
      // we already handled this fine channel with its coarse channel
      return;
    }

    const channel = {};

    for (const property of Object.keys(schemaProperties.channel)) {
      if (property === `capabilities`) {
        const capabilities = getCapabilities(from);

        if (capabilities.length === 1) {
          delete capabilities[0].dmxRange;
          channel.capability = capabilities[0];
        }
        else {
          channel.capabilities = capabilities;
        }
      }
      else if (property === `fineChannelAliases` && from.resolution > CoarseChannel.RESOLUTION_8BIT) {
        channel.fineChannelAliases = [];
      }
      else if (property === `dmxValueResolution`) {
        if (from.resolution !== from.dmxValueResolution && from.capabilities.length > 1) {
          channel.dmxValueResolution = `${from.dmxValueResolution * 8}bit`;
        }
      }
      else if (propertyExistsIn(property, from)) {
        channel[property] = getComboboxInput(property, from);
      }
    }

    const channelKey = getChannelKey(channel, fixtureKey);

    if (`fineChannelAliases` in channel) {
      // find all referencing fine channels
      for (const otherChannel of Object.values(availableChannels)) {
        if (`coarseChannelId` in otherChannel && otherChannel.coarseChannelId === channelId) {
          const alias = getFineChannelAlias(channelKey, otherChannel.resolution);
          channel.fineChannelAliases[otherChannel.resolution - 2] = alias;
          channelKeyMapping[otherChannel.uuid] = alias;
        }
      }
    }

    if (channel.name === channelKey) {
      delete channel.name;
    }

    channelKeyMapping[from.uuid] = channelKey;
    result.fixtures[fixtureKey].availableChannels[channelKey] = channel;
  }

  function getChannelKey(channel, fixtureKey) {
    let channelKey = channel.name;
    const availableChannelKeys = Object.keys(result.fixtures[fixtureKey].availableChannels);

    if (availableChannelKeys.includes(channelKey)) {
      let appendNumber = 2;
      while (availableChannelKeys.includes(`${channelKey} ${appendNumber}`)) {
        appendNumber++;
      }
      channelKey = `${channelKey} ${appendNumber}`;
    }

    return channelKey;
  }

  function getFineChannelAlias(channelKey, resolution) {
    return `${channelKey} fine${resolution > CoarseChannel.RESOLUTION_16BIT ? `^${resolution - 1}` : ``}`;
  }

  function getCapabilities(channel) {
    return channel.capabilities.map(editorCapability => {
      const capability = {};

      const capabilitySchema = schemaProperties.capabilityTypes[editorCapability.type];

      for (const capabilityProperty of Object.keys(capabilitySchema.properties)) {
        if (propertyExistsIn(capabilityProperty, editorCapability)) {
          capability[capabilityProperty] = editorCapability[capabilityProperty];
        }
        else if (propertyExistsIn(capabilityProperty, editorCapability.typeData)) {
          capability[capabilityProperty] = editorCapability.typeData[capabilityProperty];
        }
      }

      if (capability.brightnessStart === `off` && capability.brightnessEnd === `bright`) {
        delete capability.brightnessStart;
        delete capability.brightnessEnd;
      }

      return capability;
    });
  }

  function addMode(fixtureKey, from) {
    const mode = {};

    for (const property of Object.keys(schemaProperties.mode)) {
      if (property === `physical`) {
        const physical = getPhysical(from.physical);
        if (!isEmptyObject(physical)) {
          mode.physical = physical;
        }
      }
      else if (property === `channels`) {
        mode.channels = from.channels.map(uuid => channelKeyMapping[uuid]);
      }
      else if (propertyExistsIn(property, from)) {
        mode[property] = from[property];
      }
    }

    result.fixtures[fixtureKey].modes.push(mode);
  }
}


// helper functions

/**
 * @param {Object|null} object The object to check.
 * @returns {Boolean} Whether the given object literal has no own properties, i.e. that its JSON equivalent is '{}'
 */
function isEmptyObject(object) {
  return JSON.stringify(object) === `{}`;
}

/**
 * @param {*} property The property key to check.
 * @param {Object|null} object The object to check. If it's null, false is returned.
 * @returns {Boolean} Whether the given property key is present in the object and its value is non-null and non-empty.
 */
function propertyExistsIn(property, object) {
  const objectValid = object !== undefined && object !== null;
  const valueValid = objectValid && object[property] !== undefined && object[property] !== null && object[property] !== ``;
  return valueValid;
}

function getComboboxInput(property, from) {
  return (from[property] === `[add-value]` && from[`${property}New`] !== ``) ? from[`${property}New`] : from[property];
}

/**
 * @param {String} string The string to slugify.
 * @returns {String} A slugified version of the string, i.e. only containing lowercase letters, numbers and dashes.
 */
function slugify(string) {
  return string.toLowerCase().replace(/[^\da-z-]+/g, ` `).trim().replace(/\s+/g, `-`);
}

module.exports = { createFixtureFromEditor };
