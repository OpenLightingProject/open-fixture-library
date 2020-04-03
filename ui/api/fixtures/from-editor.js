const schemaProperties = require(`../../../lib/schema-properties.js`).default;
const { checkFixture } = require(`../../../tests/fixture-valid.js`);
const { CoarseChannel } = require(`../../../lib/model.js`);

/** @typedef {import('./types.js').FixtureCreateResult} FixtureCreateResult */

/**
 * @typedef {Array.<Object>} RequestBody Array of fixture objects used in the Fixture Editor.
 */

/**
 * Converts the given editor fixture data into OFL fixtures and responds with a FixtureCreateResult.
 * @param {Object} request Passed from Express.
 * @param {RequestBody} request.body The editor's fixture objects.
 * @param {Object} response Passed from Express.
 */
module.exports = function createFixtureFromEditor(request, response) {
  try {
    const fixtureCreateResult = getFixtureCreateResult(request.body);
    response.status(201).json(fixtureCreateResult);
  }
  catch (error) {
    response.status(400).json({
      error: error.message
    });
  }
};


/**
 * @param {Array.<Object>} fixtures The raw fixture data from the Fixture Editor.
 * @returns {FixtureCreateResult} The created OFL fixtures (and manufacturers) with warnings and errors.
 */
function getFixtureCreateResult(fixtures) {
  const result = {
    manufacturers: {},
    fixtures: {},
    warnings: {},
    errors: {}
  };

  // { 'uuid 1': 'new channel key 1', ... }
  const channelKeyMapping = {};

  fixtures.forEach(addFixture);

  return result;

  function addFixture(fixture) {
    const manKey = getManufacturerKey(fixture);
    const fixKey = getFixtureKey(fixture, manKey);
    const key = `${manKey}/${fixKey}`;

    result.fixtures[key] = {
      $schema: `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json`
    };

    for (const prop of Object.keys(schemaProperties.fixture)) {
      if (prop === `physical`) {
        const physical = getPhysical(fixture.physical);
        if (!isEmptyObject(physical)) {
          result.fixtures[key].physical = physical;
        }
      }
      else if (prop === `meta`) {
        const now = (new Date()).toISOString().replace(/T.*/, ``);

        result.fixtures[key].meta = {
          authors: [fixture.metaAuthor],
          createDate: now,
          lastModifyDate: now
        };
      }
      else if (prop === `links`) {
        addLinks(result.fixtures[key], fixture.links);
      }
      else if (prop === `availableChannels`) {
        result.fixtures[key].availableChannels = {};
        for (const chId of Object.keys(fixture.availableChannels)) {
          addAvailableChannel(key, fixture.availableChannels, chId);
        }
      }
      else if (prop === `rdm` && propExistsIn(`rdmModelId`, fixture)) {
        result.fixtures[key].rdm = {
          modelId: fixture.rdmModelId
        };
        if (propExistsIn(`rdmSoftwareVersion`, fixture)) {
          result.fixtures[key].rdm.softwareVersion = fixture.rdmSoftwareVersion;
        }
      }
      else if (prop === `modes`) {
        result.fixtures[key].modes = [];
        for (const mode of fixture.modes) {
          addMode(key, mode);
        }
      }
      else if (prop === `wheels`) {
        addWheels(result.fixtures[key], fixture);
      }
      else if (propExistsIn(prop, fixture)) {
        result.fixtures[key][prop] = fixture[prop];
      }
    }


    const checkResult = checkFixture(manKey, fixKey, result.fixtures[key]);

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
    const manKey = slugify(fixture.newManufacturerName);

    result.manufacturers[manKey] = {
      name: fixture.newManufacturerName
    };

    if (propExistsIn(`newManufacturerComment`, fixture)) {
      result.manufacturers[manKey].comment = fixture.newManufacturerComment;
    }

    if (propExistsIn(`newManufacturerWebsite`, fixture)) {
      result.manufacturers[manKey].website = fixture.newManufacturerWebsite;
    }

    if (propExistsIn(`newManufacturerRdmId`, fixture)) {
      result.manufacturers[manKey].rdmId = fixture.newManufacturerRdmId;
    }

    return manKey;
  }

  /**
   * @param {Object} fixture The editor fixture object.
   * @param {String} manKey The manufacturer key of the fixture.
   * @returns {String} The fixture key.
   */
  function getFixtureKey(fixture, manKey) {
    if (`key` in fixture && fixture.key !== `[new]`) {
      return fixture.key;
    }

    let fixKey = slugify(fixture.name);

    const otherFixtureKeys = Object.keys(result.fixtures).filter(
      key => key.startsWith(manKey)
    ).map(key => key.slice(manKey.length + 1));

    while (otherFixtureKeys.includes(fixKey)) {
      fixKey += `-2`;
    }

    return fixKey;
  }

  function getPhysical(from) {
    const physical = {};

    for (const prop of Object.keys(schemaProperties.physical)) {
      if (schemaProperties.physical[prop].type === `object`) {
        physical[prop] = {};

        for (const subProp of Object.keys(schemaProperties.physical[prop].properties)) {
          if (propExistsIn(subProp, from[prop])) {
            physical[prop][subProp] = getComboboxInput(subProp, from[prop]);
          }
        }

        if (isEmptyObject(physical[prop])) {
          delete physical[prop];
        }
      }
      else if (propExistsIn(prop, from)) {
        physical[prop] = getComboboxInput(prop, from);
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
        linkObj => linkObj.type === linkType
      ).map(linkObj => linkObj.url);

      if (linksOfType.length) {
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
        editorWheelSlot => editorWheelSlot !== null && editorWheelSlot.type !== ``
      )
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
          type: editorWheelSlot.type
        };

        const wheelSlotSchema = schemaProperties.wheelSlotTypes[wheelSlot.type];

        for (const slotProp of Object.keys(wheelSlotSchema.properties)) {
          if (propExistsIn(slotProp, editorWheelSlot.typeData)) {
            wheelSlot[slotProp] = editorWheelSlot.typeData[slotProp];
          }
        }

        return wheelSlot;
      });

      // remove trailing null slots
      while (slots[slots.length - 1] === null) {
        slots.pop();
      }

      fixture.wheels[editorChannel.name] = {
        slots
      };
    });
  }

  function addAvailableChannel(fixKey, availableChannels, chId) {
    const from = availableChannels[chId];

    if (`coarseChannelId` in from) {
      // we already handled this fine channel with its coarse channel
      return;
    }

    const channel = {};

    for (const prop of Object.keys(schemaProperties.channel)) {
      if (prop === `capabilities`) {
        const capabilities = getCapabilities(from);

        if (capabilities.length === 1) {
          delete capabilities[0].dmxRange;
          channel.capability = capabilities[0];
        }
        else {
          channel.capabilities = capabilities;
        }
      }
      else if (prop === `fineChannelAliases` && from.resolution > CoarseChannel.RESOLUTION_8BIT) {
        channel.fineChannelAliases = [];
      }
      else if (prop === `dmxValueResolution`) {
        if (from.resolution !== from.dmxValueResolution && from.capabilities.length > 1) {
          channel.dmxValueResolution = `${from.dmxValueResolution * 8}bit`;
        }
      }
      else if (propExistsIn(prop, from)) {
        channel[prop] = getComboboxInput(prop, from);
      }
    }

    const chKey = getChannelKey(channel, fixKey);

    if (`fineChannelAliases` in channel) {
      // find all referencing fine channels
      for (const uuid of Object.keys(availableChannels)) {
        const ch = availableChannels[uuid];

        if (`coarseChannelId` in ch && ch.coarseChannelId === chId) {
          const alias = getFineChannelAlias(chKey, ch.resolution);
          channel.fineChannelAliases[ch.resolution - 2] = alias;
          channelKeyMapping[ch.uuid] = alias;
        }
      }
    }

    if (channel.name === chKey) {
      delete channel.name;
    }

    channelKeyMapping[from.uuid] = chKey;
    result.fixtures[fixKey].availableChannels[chKey] = channel;
  }

  function getChannelKey(channel, fixKey) {
    let chKey = channel.name;
    const availableChannelKeys = Object.keys(result.fixtures[fixKey].availableChannels);

    if (availableChannelKeys.includes(chKey)) {
      let appendNumber = 2;
      while (availableChannelKeys.includes(`${chKey} ${appendNumber}`)) {
        appendNumber++;
      }
      chKey = `${chKey} ${appendNumber}`;
    }

    return chKey;
  }

  function getFineChannelAlias(channelKey, resolution) {
    return `${channelKey} fine${resolution > CoarseChannel.RESOLUTION_16BIT ? `^${resolution - 1}` : ``}`;
  }

  function getCapabilities(channel) {
    return channel.capabilities.map(cap => {
      const capability = {};

      const capabilitySchema = schemaProperties.capabilityTypes[cap.type];

      for (const capProp of Object.keys(capabilitySchema.properties)) {
        if (propExistsIn(capProp, cap)) {
          capability[capProp] = cap[capProp];
        }
        else if (propExistsIn(capProp, cap.typeData)) {
          capability[capProp] = cap.typeData[capProp];
        }
      }

      if (capability.brightnessStart === `off` && capability.brightnessEnd === `bright`) {
        delete capability.brightnessStart;
        delete capability.brightnessEnd;
      }

      return capability;
    });
  }

  function addMode(fixKey, from) {
    const mode = {};

    const uuidFromMapping = uuid => channelKeyMapping[uuid];

    for (const prop of Object.keys(schemaProperties.mode)) {
      if (prop === `physical`) {
        const physical = getPhysical(from.physical);
        if (!isEmptyObject(physical)) {
          mode.physical = physical;
        }
      }
      else if (prop === `channels`) {
        mode.channels = from.channels.map(uuidFromMapping);
      }
      else if (propExistsIn(prop, from)) {
        mode[prop] = from[prop];
      }
    }

    result.fixtures[fixKey].modes.push(mode);
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
 * @param {*} prop The property key to check.
 * @param {Object|null} object The object to check. If it's null, false is returned.
 * @returns {Boolean} Whether the given property key is present in the object and its value is non-null and non-empty.
 */
function propExistsIn(prop, object) {
  const objectValid = object !== undefined && object !== null;
  const valueValid = objectValid && object[prop] !== undefined && object[prop] !== null && object[prop] !== ``;
  return valueValid;
}

function getComboboxInput(prop, from) {
  return (from[prop] === `[add-value]` && from[`${prop}New`] !== ``) ? from[`${prop}New`] : from[prop];
}

/**
 * @param {String} str The string to slugify.
 * @returns {String} A slugified version of the string, i.e. only containing lowercase letters, numbers and dashes.
 */
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9-]+/g, ` `).trim().replace(/\s+/g, `-`);
}
