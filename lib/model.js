import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import importJson from './import-json.js';

import Fixture from './model/Fixture.js';
import Manufacturer from './model/Manufacturer.js';

/**
 * Look up the fixture definition in the directory structure and create a Fixture instance.
 * @param {string} absolutePath The fixture file absolute path, including filename.
 * @returns {Promise<Fixture, Error>} A Promise that resolves to the created Fixture instance or is rejected with a `MODULE_NOT_FOUND` error if the given fixture file does not exist.
 */
export async function fixtureFromFile(absolutePath) {
  let manufacturerKey = path.basename(path.dirname(absolutePath));
  let fixtureKey = path.basename(absolutePath, path.extname(absolutePath));
  let fixtureJson = await importJson(absolutePath);

  if (fixtureJson.$schema.endsWith(`/fixture-redirect.json`)) {
    [manufacturerKey, fixtureKey] = fixtureJson.redirectTo.split(`/`);
    absolutePath = path.join(path.dirname(absolutePath), `../${manufacturerKey}/${fixtureKey}.json`);
    fixtureJson = await importJson(absolutePath);
  }

  const manufacturer = await manufacturerFromRepository(manufacturerKey);
  await embedResourcesIntoFixtureJson(fixtureJson);

  return new Fixture(manufacturer, fixtureKey, fixtureJson);
}

/**
 * Look up the fixture definition in the directory structure and create a Fixture instance.
 * @param {string} manufacturerKey The manufacturer's key (directory name)
 * @param {string} fixtureKey The fixture's key (filename without .json)
 * @returns {Promise<Fixture, Error>} A Promise that resolves to the created Fixture instance or is rejected with a `MODULE_NOT_FOUND` error if the given fixture file does not exist.
 */
export async function fixtureFromRepository(manufacturerKey, fixtureKey) {
  let fixturePath = `../fixtures/${manufacturerKey}/${fixtureKey}.json`;
  let fixtureJson = await importJson(fixturePath, import.meta.url);

  if (fixtureJson.$schema.endsWith(`/fixture-redirect.json`)) {
    fixturePath = `../fixtures/${fixtureJson.redirectTo}.json`;
    fixtureJson = {
      ...await importJson(fixturePath, import.meta.url),
      name: fixtureJson.name,
    };
  }

  const manufacturer = await manufacturerFromRepository(manufacturerKey);
  await embedResourcesIntoFixtureJson(fixtureJson);

  return new Fixture(manufacturer, fixtureKey, fixtureJson);
}

/**
 * Look up the manufacturer definition in the directory structure and create a Manufacturer instance.
 * @param {string} manufacturerKey The manufacturer's key (directory name).
 * @returns {Promise<Manufacturer>} A Promise that resolves to the created Manufacturer instance.
 */
export async function manufacturerFromRepository(manufacturerKey) {
  const manufacturers = await importJson(`../fixtures/manufacturers.json`, import.meta.url);
  return new Manufacturer(manufacturerKey, manufacturers[manufacturerKey]);
}

/**
 * @param {object} fixtureJson The fixture JSON to embed resoures into.
 */
export async function embedResourcesIntoFixtureJson(fixtureJson) {
  if (`wheels` in fixtureJson) {
    for (const wheel of Object.values(fixtureJson.wheels)) {
      for (const slot of wheel.slots) {
        if (typeof slot.resource === `string`) {
          slot.resource = await getResourceFromString(slot.resource);
        }
      }
    }
  }
}

/**
 * @param {string} resourceName The resource name, as specified in a fixture.
 * @returns {Promise<object>} A Promise that resolves to the resource object to be embedded into the fixture.
 */
export async function getResourceFromString(resourceName) {
  const { type, key, alias } = await resolveResourceName(resourceName);

  const resourceBaseUrl = new URL(`../resources/${type}/`, import.meta.url);
  const resourceUrl = new URL(`${key}.json`, resourceBaseUrl);

  let resourceData;

  try {
    resourceData = await importJson(resourceUrl);
  }
  catch (error) {
    throw error instanceof SyntaxError
      ? new Error(`Resource file '${fileURLToPath(resourceUrl)}' could not be parsed as JSON.`)
      : new Error(`Resource '${resourceName}' not found.`);
  }

  resourceData.key = key;
  resourceData.type = type;
  resourceData.alias = alias;
  resourceData.image = await getImageForResource(type, resourceBaseUrl, key);

  delete resourceData.$schema;

  return resourceData;
}

/**
 * @typedef {object} ResolvedResourceName
 * @property {string} type The resource type, i.e. name of the directory inside the resources directory.
 * @property {string} key The resource key.
 * @property {string | null} alias The original resource name if it's an alias, null otherwise.
 */

/**
 * @param {string} resourceName The resource name, as specified in a fixture.
 * @returns {Promise<ResolvedResourceName>} A Promise that resolves to the resolved resource name object.
 */
async function resolveResourceName(resourceName) {
  const [type, ...remainingParts] = resourceName.split(`/`);

  if (remainingParts[0] === `aliases`) {
    const aliasFileName = remainingParts[1];
    const aliasKey = remainingParts.slice(2).join(`/`);
    const aliasesFilePath = `resources/${type}/aliases/${aliasFileName}.json`;

    let aliases;
    try {
      aliases = await importJson(`../${aliasesFilePath}`, import.meta.url);
    }
    catch {
      throw new Error(`Resource aliases file '${aliasesFilePath}' not found.`);
    }

    if (!(aliasKey in aliases)) {
      throw new Error(`Resource alias '${aliasKey}' not defined in file '${aliasesFilePath}'.`);
    }

    return {
      type,
      key: aliases[aliasKey],
      alias: `${aliasFileName}/${aliasKey}`,
    };
  }

  return {
    type,
    key: remainingParts.join(`/`),
    alias: null,
  };
}

/**
 * @typedef {object} ResourceImage
 * @property {string} dataUrl The data URL of the image.
 * @property {string} extension The extension of the image file.
 */

const resourceFileFormats = [
  {
    extension: `svg`,
    mimeType: `image/svg+xml;charset=utf8`,
    encoding: `utf8`,
  },
  {
    extension: `png`,
    mimeType: `image/png`,
    encoding: `base64`,
  },
];

/**
 * @param {string} type The resource type, i.e. name of the directory inside the resources directory.
 * @param {URL} baseUrl The path of the resource directory.
 * @param {string} key The resource key.
 * @returns {Promise<ResourceImage | undefined>} A Promise that resolves to the resource image, or undefined if none could be found.
 */
async function getImageForResource(type, baseUrl, key) {
  for (const { extension, mimeType, encoding } of resourceFileFormats) {
    try {
      let data = await readFile(new URL(`${key}.${extension}`, baseUrl), encoding);

      if (extension === `svg`) {
        // see https://cloudfour.com/thinks/simple-svg-placeholder/#how-it-works

        data = data
          .replaceAll(/[\t\n\r]/gim, ``) // Strip newlines and tabs
          .replaceAll(/\s\s+/g, ` `) // Condense multiple spaces
          .replaceAll(/'/gim, `\\i`) // Normalize quotes
          .replaceAll(/<!--(.*(?=-->))-->/gim, ``); // Strip comments
      }

      return { mimeType, extension, data, encoding };
    }
    catch {
      // image does not exist
    }
  }

  if (type === `gobos`) {
    const fileExtensions = resourceFileFormats.map(({ extension }) => extension).join(`, `);
    throw new Error(`Expected gobo image for resource '${fileURLToPath(new URL(key, baseUrl))}' not found (supported file extensions: ${fileExtensions}).`);
  }

  return undefined;
}
