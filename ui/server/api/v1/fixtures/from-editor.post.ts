import CoarseChannel from '~~/lib/model/CoarseChannel.js';
import {
  capabilityTypes,
  channelProperties,
  fixtureProperties,
  linksProperties,
  modeProperties,
  physicalProperties,
  wheelSlotTypes,
} from '~~/lib/schema-properties.js';
import manufacturers from '~~/fixtures/manufacturers.json' with { type: 'json' };
import { checkFixture } from '~~/tests/fixture-valid.js';

defineRouteMeta({
  openAPI: {
    operationId: 'createFixtureFromEditor',
    description: 'Converts the given editor fixture data into OFL fixtures and responds with a FixtureCreateResult.',
    tags: ['fixtures'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              description: 'Fixture object used in the Fixture Editor',
            },
          },
        },
      },
    },
    responses: {
      '201': {
        description: 'Fixture successfully imported',
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
      },
      '400': {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  try {
    const fixtureCreateResult = await getFixtureCreateResult(body);
    setResponseStatus(event, 201);
    return fixtureCreateResult;
  }
  catch (error) {
    setResponseStatus(event, 400);
    return { error: error.message };
  }
});

async function getFixtureCreateResult(fixtures) {
  const result = {
    manufacturers: {},
    fixtures: {},
    warnings: {},
    errors: {},
  };

  const channelKeyMapping = {};

  async function addFixture(fixture) {
    const manufacturerKey = getManufacturerKey(fixture);
    const fixtureKey = getFixtureKey(fixture, manufacturerKey);
    const key = `${manufacturerKey}/${fixtureKey}`;

    result.fixtures[key] = {
      $schema: `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json`,
    };

    for (const property of Object.keys(fixtureProperties)) {
      switch (property) {
        case `physical`: {
          const physical = getPhysical(fixture.physical);
          if (!isEmptyObject(physical)) {
            result.fixtures[key].physical = physical;
          }
          break;
        }
        case `meta`: {
          const now = new Date().toISOString().replace(/T.*/, ``);

          result.fixtures[key].meta = {
            authors: [fixture.metaAuthor],
            createDate: now,
            lastModifyDate: now,
          };
          break;
        }
        case `links`: {
          addLinks(result.fixtures[key], fixture.links);
          break;
        }
        case `availableChannels`: {
          result.fixtures[key].availableChannels = {};
          for (const channelId of Object.keys(fixture.availableChannels)) {
            addAvailableChannel(key, fixture.availableChannels, channelId);
          }
          break;
        }
        default: {
          if (property === `rdm` && propertyExistsIn(`rdmModelId`, fixture)) {
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
      }
    }

    const checkResult = await checkFixture(manufacturerKey, fixtureKey, result.fixtures[key]);

    result.warnings[key] = checkResult.warnings;
    result.errors[key] = checkResult.errors;
  }

  await Promise.all(fixtures.map(fixture => addFixture(fixture)));

  return result;

  function getManufacturerKey(fixture) {
    if (fixture.useExistingManufacturer) {
      result.manufacturers[fixture.manufacturerKey] = manufacturers[fixture.manufacturerKey];
      return fixture.manufacturerKey;
    }

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

    for (const property of Object.keys(physicalProperties)) {
      if (physicalProperties[property].type === `object`) {
        physical[property] = {};

        for (const subProperty of Object.keys(physicalProperties[property].properties)) {
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

  function addLinks(fixture, editorLinksArray) {
    fixture.links = {};

    const resolveShortenedYouTubeUrl = url => {
      if (url.startsWith(`https://youtu.be/`)) {
        const urlObject = new URL(url);

        const videoId = urlObject.pathname.slice(1);
        const queryParameters = [...urlObject.searchParams];
        queryParameters.unshift([`v`, videoId]);
        const queryParameterString = new URLSearchParams(Object.fromEntries(queryParameters));

        urlObject.host = `www.youtube.com`;
        urlObject.pathname = `watch`;
        urlObject.search = `?${queryParameterString}`;

        return urlObject.toString();
      }

      return url;
    };

    const linkTypes = Object.keys(linksProperties);

    for (const linkType of linkTypes) {
      const linksOfType = editorLinksArray
        .filter(({ type }) => type === linkType)
        .map(({ url }) => resolveShortenedYouTubeUrl(url));

      if (linksOfType.length > 0) {
        fixture.links[linkType] = linksOfType;
      }
    }
  }

  function addWheels(fixture, editorFixture) {
    const editorWheelChannels = Object.values(editorFixture.availableChannels).filter(
      editorChannel => editorChannel.wheel && editorChannel.wheel.slots.some(
        editorWheelSlot => editorWheelSlot !== null && editorWheelSlot.type !== ``,
      ),
    );

    if (editorWheelChannels.length === 0) {
      return;
    }

    fixture.wheels = {};

    for (const editorChannel of editorWheelChannels) {
      const slots = editorChannel.wheel.slots.map(editorWheelSlot => {
        if (editorWheelSlot === null || editorWheelSlot.type === ``) {
          return null;
        }

        const wheelSlot = {
          type: editorWheelSlot.type,
        };

        const wheelSlotSchema = wheelSlotTypes[wheelSlot.type];

        for (const slotProperty of Object.keys(wheelSlotSchema.properties)) {
          if (propertyExistsIn(slotProperty, editorWheelSlot.typeData)) {
            wheelSlot[slotProperty] = editorWheelSlot.typeData[slotProperty];
          }
        }

        return wheelSlot;
      });

      while (slots.at(-1) === null) {
        slots.pop();
      }

      fixture.wheels[editorChannel.name] = {
        slots,
      };
    }
  }

  function addAvailableChannel(fixtureKey, availableChannels, channelId) {
    const from = availableChannels[channelId];

    if (`coarseChannelId` in from) {
      return;
    }

    const channel = {};

    for (const property of Object.keys(channelProperties)) {
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
    const suffix = resolution > CoarseChannel.RESOLUTION_16BIT ? `^${resolution - 1}` : ``;
    return `${channelKey} fine${suffix}`;
  }

  function getCapabilities(channel) {
    return channel.capabilities.map(editorCapability => {
      const capability = {};

      const capabilitySchema = capabilityTypes[editorCapability.type];

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

    for (const property of Object.keys(modeProperties)) {
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

function isEmptyObject(object) {
  return JSON.stringify(object) === `{}`;
}

function propertyExistsIn(property, object) {
  const objectValid = object !== undefined && object !== null;
  return objectValid && object[property] !== undefined && object[property] !== null && object[property] !== ``;
}

function getComboboxInput(property, from) {
  return (from[property] === `[add-value]` && from[`${property}New`] !== ``) ? from[`${property}New`] : from[property];
}

function slugify(string) {
  return string.toLowerCase().replaceAll(/[^\da-z-]+/g, ` `).trim().replaceAll(/\s+/g, `-`);
}
