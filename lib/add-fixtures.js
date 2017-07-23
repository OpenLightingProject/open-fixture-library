const createPullRequest = require('./create-github-pr.js');
var properties = require('../fixtures/schema.js').properties;

/**
 * Takes the input from the fixture editor client side script and creates a pull request with the new fixture.
 */
module.exports = function addFixtures(request, response) {
  createPullRequest(getOutObjectFromEditorData(request.body.fixtures), (error, pullRequestUrl) => {
    response
      .status(201)
      .type('application/json')
      .send(Buffer.from(
        JSON.stringify({
          pullRequestUrl: pullRequestUrl,
          error: error
        })
      ));
    });
  //console.log(JSON.stringify(getOutObjectFromEditorData(request.body.fixtures), null, 2));
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
    const manKey = getManufacturerKey(fixture);
    const fixKey = getFixtureKey(fixture, manKey);
    const key = manKey + '/' + fixKey;

    out.fixtures[key] = {};

    for (const prop of Object.keys(properties.fixture)) {
      if (prop === 'physical') {
        const physical = getPhysical(fixture.physical);
        if (!isEmptyObject(physical)) {
          out.fixtures[key].physical = physical;
        }
      }
      else if (prop === 'meta') {
        const now = (new Date()).toISOString().replace(/T.*/, '');

        out.fixtures[key].meta = {
          authors: [fixture.metaAuthor],
          createDate: now,
          lastModifyDate: now
        };
      }
      else if (prop === 'availableChannels') {
        out.fixtures[key].availableChannels = {};
        for (const chKey of Object.keys(fixture.availableChannels)) {
          addAvailableChannel(key, fixture.availableChannels[chKey]);
        }
      }
      else if (prop === 'modes') {
        out.fixtures[key].modes = [];
        for (const mode of fixture.modes) {
          addMode(key, mode);
        }
      }
      else if (propExistsIn(prop, fixture)) {
        out.fixtures[key][prop] = fixture[prop];
      }
    }

    if (propExistsIn('metaGithubUsername', fixture)) {
      out.submitter = fixture.metaGithubUsername;
    }
  }

  return out;
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

  if (propExistsIn('newManufacturerComment', fixture)) {
    out.manufacturers[manKey].comment = fixture.newManufacturerComment;
  }

  if (propExistsIn('newManufacturerWebsite', fixture)) {
    out.manufacturers[manKey].website = fixture.newManufacturerWebsite;
  }

  return manKey;
}

function getFixtureKey(fixture, manKey) {
  if ('key' in fixture && fixture.key !== '[new]') {
    return fixture.key;
  }

  let fixKey = fixture.name.toLowerCase().replace(/[^a-z0-9\-]+/g, '-');

  const otherFixtureKeys = Object.keys(out.fixtures).filter(
    key => key.startsWith(manKey)
  ).map(key => key.slice(manKey.length + 1));

  while (otherFixtureKeys.includes(fixKey)) {
    fixKey += '-2';
  }

  return fixKey;
}

function getPhysical(from) {
  let physical = {};

  for (const prop of Object.keys(properties.physical)) {
    if (prop === 'dimensions' && propExistsIn('dimensionsWidth', from)) {
      physical.dimensions = [
        from.dimensionsWidth,
        from.dimensionsHeight,
        from.dimensionsDepth
      ];
    }
    else if (properties.physical[prop].type === 'object') {
      physical[prop] = {};

      for (const subProp of Object.keys(properties.physical[prop].properties)) {
        if (subProp === 'degreesMinMax' && from.lens && propExistsIn('degreesMin', from.lens)) {
          physical.lens.degreesMinMax = [
            from.lens.degreesMin,
            from.lens.degreesMax
          ];
        }
        else if (propExistsIn(subProp, from[prop])) {
          physical[prop][subProp] = getComboboxInput(subProp, from[prop]);
        }
      }

      if (JSON.stringify(physical[prop]) === '{}') {
        delete physical[prop];
      }
    }
    else if (propExistsIn(prop, from)) {
      physical[prop] = getComboboxInput(prop, from);
    }
  }

  return physical;
}

function addAvailableChannel(fixKey, from) {
  const channel = {};

  for (const prop of Object.keys(properties.channel)) {
    if (prop === 'capabilities') {
      channel.capabilities = getCapabilities(from);

      if (channel.capabilities.length === 0) {
        delete channel.capabilities;
      }
    }
    else if (propExistsIn(prop, from)) {
      channel[prop] = from[prop];
    }
  }

  let chKey = channel.name;
  const availableChannelKeys = Object.keys(out.fixtures[fixKey].availableChannels);

  if (availableChannelKeys.includes(chKey)) {
    let appendNumber = 2;
    while (availableChannelKeys.includes(chKey + ' ' + appendNumber)) {
      appendNumber++;
    }
    chKey = chKey + ' ' + appendNumber;
  }

  if (channel.name === chKey) {
    delete channel.name;
  }

  channelKeyMapping[from.uuid] = chKey;
  out.fixtures[fixKey].availableChannels[chKey] = channel;
}

function getCapabilities(channel) {
  return channel.capabilities.filter(
    cap => cap.start !== ''
  ).map(cap => {
    let capability = {
      range: [cap.start, cap.end]
    };

    // 'range' is not in cap, so we just add the other properties here
    for (const capProp of Object.keys(properties.capability)) {
      if (propExistsIn(capProp, cap)) {
        capability[capProp] = cap[capProp];
      }
    }

    return capability;
  });
}

function addMode(fixKey, from) {
  let mode = {};

  const uuidFromMapping = uuid => channelKeyMapping[uuid];
  
  for (const prop of Object.keys(properties.mode)) {
    if (prop === 'physical') {
      const physical = getPhysical(from.physical);
      if (!isEmptyObject(physical)) {
        mode.physical = physical;
      }
    }
    else if (prop === 'channels') {
      mode.channels = from.channels.map(uuidFromMapping);
    }
    else if (propExistsIn(prop, from)) {
      mode[prop] = from[prop];
    }
  }

  out.fixtures[fixKey].modes.push(mode);
}



// helper functions

function isEmptyObject(object) {
  return JSON.stringify(object) === '{}';
}

function propExistsIn(prop, object) {
  return object[prop] != null && object[prop] !== '';
}

function getComboboxInput(prop, from) {
  return (from[prop] === '[add-value]' && from[prop + 'New'] !== '') ? from[prop + 'New'] : from[prop];
}
