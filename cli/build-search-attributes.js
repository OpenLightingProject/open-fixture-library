#!/usr/bin/env node

import { writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { styleText } from 'util';
import importJson from '../lib/import-json.js';
import Fixture from '../lib/model/Fixture.js';
import Manufacturer from '../lib/model/Manufacturer.js';

const fixturesPath = fileURLToPath(new URL('../fixtures/', import.meta.url));

try {
  const register = await importJson('../fixtures/register.json', import.meta.url);
  const manufacturersData = await importJson('../fixtures/manufacturers.json', import.meta.url);

  const searchAttributes = await getSearchAttributes(register, manufacturersData);

  const filename = path.join(fixturesPath, 'search-attributes.json');
  const fileContents = `${JSON.stringify(getObjectSortedByKeys(searchAttributes), null, 2)}\n`;

  await writeFile(filename, fileContents, 'utf-8');
  console.log(styleText('green', '[Success]'), 'Updated search attributes file', filename);
  process.exit(0);
}
catch (error) {
  console.error(styleText('red', '[Fail]'), 'Could not build search attributes file.', error);
  process.exit(1);
}

/**
 * Compute the searchable attributes of every fixture (and fixture redirect) in the register.
 * Fixture redirects use the attributes of the fixture they point to, so that e.g. rebadged fixtures
 * (see docs/fixture-format.md#fixture-redirects) can be found by attribute search as well.
 * @param {Readonly<object>} register - The fixture register, as built by `cli/build-register.js`.
 * @param {Readonly<object>} manufacturersData - All known manufacturers, like specified by the manufacturer schema.
 * @returns {Promise<Record<string, object>>} A Promise that resolves to an object mapping each fixture key to its search attributes.
 */
async function getSearchAttributes(register, manufacturersData) {
  const searchAttributes = {};

  // fixture data (and computed attributes) of already-visited fixtures, keyed by fixture key,
  // so that a fixture that is pointed to by multiple redirects is only read and computed once
  const attributesByTargetKey = new Map();

  for (const [fixtureKey, registerEntry] of Object.entries(register.filesystem)) {
    const targetKey = registerEntry.redirectTo || fixtureKey;

    if (!attributesByTargetKey.has(targetKey)) {
      const [manufacturerKey, key] = targetKey.split('/', 2);
      const fixtureJson = await importJson(`${targetKey}.json`, fixturesPath);
      const manufacturer = new Manufacturer(manufacturerKey, manufacturersData[manufacturerKey]);
      const fixture = new Fixture(manufacturer, key, fixtureJson);

      attributesByTargetKey.set(targetKey, computeFixtureSearchAttributes(fixture));
    }

    searchAttributes[fixtureKey] = attributesByTargetKey.get(targetKey);
  }

  return searchAttributes;
}

/**
 * @param {Readonly<Fixture>} fixture - The fixture to compute search attributes for.
 * @returns {object} The fixture's searchable attributes: DMX channel counts (one per mode), used channel types and used single colors.
 */
function computeFixtureSearchAttributes(fixture) {
  const channelCounts = [...new Set(
    fixture.modes.map((mode) => mode.channels.length),
  )].toSorted((a, b) => a - b);

  const channelTypes = new Set();
  const colors = new Set();

  for (const channel of fixture.coarseChannels) {
    if (channel.type !== 'NoFunction' && channel.type !== 'Unknown') {
      channelTypes.add(channel.type);
    }

    if (channel.color !== null) {
      colors.add(channel.color);
    }
  }

  return {
    channelCounts,
    channelTypes: [...channelTypes].toSorted((a, b) => a.localeCompare(b, 'en')),
    colors: [...colors].toSorted((a, b) => a.localeCompare(b, 'en')),
  };
}

/**
 * @param {Readonly<object>} object - The object to sort.
 * @returns {object} A new object with the same entries, sorted by keys.
 */
function getObjectSortedByKeys(object) {
  const sortedObject = {};
  const sortedKeys = Object.keys(object).toSorted((a, b) => a.localeCompare(b, 'en', { numeric: true }));

  for (const key of sortedKeys) {
    sortedObject[key] = object[key];
  }

  return sortedObject;
}
