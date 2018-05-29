const createPullRequest = require(`../../lib/create-github-pr.js`);
const schemaProperties = require(`../../lib/schema-properties.js`);

/**
 * Takes the input from the fixture editor client side script and creates a pull request with the new fixture.
 * @param {!object} request Passed from Express.
 * @param {!object} response Passed from Express.
 */
module.exports = function addFixtures(request, response) {
  createPullRequest(getOutObjectFromEditorData(request.body.fixtures), (error, pullRequestUrl) => {
    response.status(201).json({
      pullRequestUrl: pullRequestUrl,
      error: error
    });
  });
};



let out;

// { 'uuid 1': 'new channel key 1', ... }
let channelKeyMapping;

function getOutObjectFromEditorData(fixtures) {
  out = {
    manufacturers: {},
    fixtures: {},
    submitter: null
  };
  channelKeyMapping = {};

  for (const fixture of fixtures) {
    addFixture(fixture);

    if (propExistsIn(`metaGithubUsername`, fixture)) {
      out.submitter = fixture.metaGithubUsername;
    }
  }

  return out;
}

function addFixture(fixture) {
  const manKey = getManufacturerKey(fixture);
  const fixKey = getFixtureKey(fixture, manKey);
  const key = `${manKey}/${fixKey}`;

  out.fixtures[key] = {
    $schema: `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json`
  };

  for (const prop of Object.keys(schemaProperties.fixture)) {
    if (prop === `physical`) {
      const physical = getPhysical(fixture.physical);
      if (!isEmptyObject(physical)) {
        out.fixtures[key].physical = physical;
      }
    }
    else if (prop === `meta`) {
      const now = (new Date()).toISOString().replace(/T.*/, ``);

      out.fixtures[key].meta = {
        authors: [fixture.metaAuthor],
        createDate: now,
        lastModifyDate: now
      };
    }
    else if (prop === `availableChannels`) {
      out.fixtures[key].availableChannels = {};
      for (const chId of Object.keys(fixture.availableChannels)) {
        addAvailableChannel(key, fixture.availableChannels, chId);
      }
    }
    else if (prop === `rdm` && propExistsIn(`rdmModelId`, fixture)) {
      out.fixtures[key].rdm = {
        modelId: fixture.rdmModelId
      };
      if (propExistsIn(`rdmSoftwareVersion`, fixture)) {
        out.fixtures[key].rdm.softwareVersion = fixture.rdmSoftwareVersion;
      }
    }
    else if (prop === `modes`) {
      out.fixtures[key].modes = [];
      for (const mode of fixture.modes) {
        addMode(key, mode);
      }
    }
    else if (propExistsIn(prop, fixture)) {
      out.fixtures[key][prop] = fixture[prop];
    }
  }
}

function getManufacturerKey(fixture) {
  if (fixture.useExistingManufacturer) {
    return fixture.manufacturerShortName;
  }

  // add new manufacturer
  const manKey = fixture.newManufacturerShortName;

  out.manufacturers[manKey] = {
    name: fixture.newManufacturerName
  };

  if (propExistsIn(`newManufacturerComment`, fixture)) {
    out.manufacturers[manKey].comment = fixture.newManufacturerComment;
  }

  if (propExistsIn(`newManufacturerWebsite`, fixture)) {
    out.manufacturers[manKey].website = fixture.newManufacturerWebsite;
  }

  if (propExistsIn(`newManufacturerRdmId`, fixture)) {
    out.manufacturers[manKey].rdmId = fixture.newManufacturerRdmId;
  }

  return manKey;
}

function getFixtureKey(fixture, manKey) {
  if (`key` in fixture && fixture.key !== `[new]`) {
    return fixture.key;
  }

  let fixKey = fixture.name.toLowerCase().replace(/[^a-z0-9-]+/g, `-`);

  const otherFixtureKeys = Object.keys(out.fixtures).filter(
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

function addAvailableChannel(fixKey, availableChannels, chId) {
  const from = availableChannels[chId];

  if (`coarseChannelId` in from) {
    // we already handled this fine channel with its coarse channel
    return;
  }

  const channel = {};

  for (const prop of Object.keys(schemaProperties.channel)) {
    if (prop === `capabilities`) {
      channel.capabilities = getCapabilities(from);

      if (channel.capabilities.length === 0) {
        delete channel.capabilities;
      }
    }
    else if (prop === `fineChannelAliases` && from.fineness > 0) {
      channel.fineChannelAliases = [];
    }
    else if (prop === `color`) {
      if (from.type === `Single Color`) {
        channel.color = getComboboxInput(`color`, from);
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
        const alias = getFineChannelAlias(chKey, ch.fineness);
        channel.fineChannelAliases[ch.fineness - 1] = alias;
        channelKeyMapping[ch.uuid] = alias;
      }
    }
  }

  if (channel.name === chKey) {
    delete channel.name;
  }

  channelKeyMapping[from.uuid] = chKey;
  out.fixtures[fixKey].availableChannels[chKey] = channel;
}

function getChannelKey(channel, fixKey) {
  let chKey = channel.name;
  const availableChannelKeys = Object.keys(out.fixtures[fixKey].availableChannels);

  if (availableChannelKeys.includes(chKey)) {
    let appendNumber = 2;
    while (availableChannelKeys.includes(`${chKey} ${appendNumber}`)) {
      appendNumber++;
    }
    chKey = `${chKey} ${appendNumber}`;
  }

  return chKey;
}

function getFineChannelAlias(channelKey, fineness) {
  return `${channelKey} fine${fineness > 1 ? `^${fineness}` : ``}`;
}

function getCapabilities(channel) {
  return channel.capabilities.filter(
    cap => cap.range !== null
  ).map(cap => {
    const capability = {};

    // TODO: add type-specific data

    for (const capProp of Object.keys(schemaProperties.capability)) {
      if (propExistsIn(capProp, cap)) {
        capability[capProp] = cap[capProp];
      }
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

  out.fixtures[fixKey].modes.push(mode);
}



// helper functions

/**
 * @param {?object} object The object to check.
 * @returns {!boolean} Whether the given object literal has no own properties, i.e. that its JSON equivalent is '{}'
 */
function isEmptyObject(object) {
  return JSON.stringify(object) === `{}`;
}

/**
 * @param {*} prop The property key to check.
 * @param {?object} object The object to check. If it's null, false is returned.
 * @returns {!boolean} Whether the given property key is present in the object and its value is non-null and non-empty.
 */
function propExistsIn(prop, object) {
  const objectValid = object !== undefined && object !== null;
  const valueValid = objectValid && object[prop] !== undefined && object[prop] !== null && object[prop] !== ``;
  return valueValid;
}

function getComboboxInput(prop, from) {
  return (from[prop] === `[add-value]` && from[`${prop}New`] !== ``) ? from[`${prop}New`] : from[prop];
}
