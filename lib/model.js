const path = require(`path`);
const fs = require(`fs`);

// see https://github.com/standard-things/esm#getting-started
require = require(`esm`)(module); // eslint-disable-line no-global-assign

const AbstractChannel = require(`./model/AbstractChannel.js`).default;
const Capability = require(`./model/Capability.js`).default;
const CoarseChannel = require(`./model/CoarseChannel.js`).default;
const FineChannel = require(`./model/FineChannel.js`).default;
const Fixture = require(`./model/Fixture.js`).default;
const Manufacturer = require(`./model/Manufacturer.js`).default;
const Matrix = require(`./model/Matrix.js`).default;
const Meta = require(`./model/Meta.js`).default;
const Mode = require(`./model/Mode.js`).default;
const NullChannel = require(`./model/NullChannel.js`).default;
const Physical = require(`./model/Physical.js`).default;
const Range = require(`./model/Range.js`).default;
const SwitchingChannel = require(`./model/SwitchingChannel.js`).default;
const TemplateChannel = require(`./model/TemplateChannel.js`).default;
const Wheel = require(`./model/Wheel.js`).default;
const WheelSlot = require(`./model/WheelSlot.js`).default;

/**
 * Look up the fixture definition in the directory structure and create a Fixture instance.
 * @param {String} absolutePath The fixture file absolute path, including filename.
 * @returns {Fixture} The created Fixture instance, null if not found.
 * @throws {Error} A `MODULE_NOT_FOUND` error when the given fixture file does not exist.
 */
function fixtureFromFile(absolutePath) {
  let manufacturerKey = path.basename(path.dirname(absolutePath));
  let fixtureKey = path.basename(absolutePath, path.extname(absolutePath));
  let fixJson = require(absolutePath);

  if (fixJson.$schema.endsWith(`/fixture-redirect.json`)) {
    [manufacturerKey, fixtureKey] = fixJson.redirectTo.split(`/`);
    absolutePath = path.join(path.dirname(absolutePath), `../${manufacturerKey}/${fixtureKey}.json`);
    fixJson = require(absolutePath);
  }

  embedResourcesIntoFixtureJson(fixJson);

  return new Fixture(manufacturerKey, fixtureKey, fixJson);
}

/**
 * Look up the fixture definition in the directory structure and create a Fixture instance.
 * @param {String} manufacturerKey The manufacturer's key (directory name)
 * @param {String} fixtureKey The fixture's key (filename without .json)
 * @returns {Fixture} The created Fixture instance, null if not found.
 * @throws {Error} A `MODULE_NOT_FOUND` error when the given fixture file does not exist.
 */
function fixtureFromRepository(manufacturerKey, fixtureKey) {
  let fixPath = `../fixtures/${manufacturerKey}/${fixtureKey}.json`;
  let fixJson = require(fixPath);

  if (fixJson.$schema.endsWith(`/fixture-redirect.json`)) {
    fixPath = `../fixtures/${fixJson.redirectTo}.json`;
    fixJson = Object.assign({}, require(fixPath), { name: fixJson.name });
  }

  embedResourcesIntoFixtureJson(fixJson);

  return new Fixture(manufacturerKey, fixtureKey, fixJson);
}

/**
 * @param {String} fixJson The fixture JSON to embed resoures into.
 */
function embedResourcesIntoFixtureJson(fixJson) {
  if (`wheels` in fixJson) {
    Object.values(fixJson.wheels).forEach(wheel => {
      wheel.slots.forEach(slot => {
        if (typeof slot.resource === `string`) {
          slot.resource = getResourceFromString(slot.resource);
        }
      });
    });
  }
}

/**
 * @param {String} resourceName The resource name, as specified in a fixture.
 * @returns {Object} The resource object to be embedded into the fixture.
 */
function getResourceFromString(resourceName) {
  const { type, key, alias } = resolveResourceName(resourceName);

  const resourceBasePath = path.join(__dirname, `../resources/${type}`);
  const resourcePath = `${resourceBasePath}/${key}.json`;

  let resourceData;

  try {
    const resourceJsonStr = fs.readFileSync(resourcePath, `utf8`);
    resourceData = JSON.parse(resourceJsonStr);
  }
  catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Resource file '${resourcePath}' could not be parsed as JSON.`);
    }
    else {
      throw new Error(`Resource '${resourceName}' not found.`);
    }
  }

  resourceData.key = key;
  resourceData.type = type;
  resourceData.alias = alias;
  resourceData.image = getImageForResource(type, resourceBasePath, key);

  delete resourceData.$schema;

  return resourceData;
}

/**
 * @typedef {Object} ResolvedResourceName
 * @property {String} type The resource type, i.e. name of the directory inside the resources directory.
 * @property {String} key The resource key.
 * @property {String|null} alias The original resource name if it's an alias, null otherwise.
 */

/**
 * @param {String} resourceName The resource name, as specified in a fixture.
 * @returns {ResolvedResourceName} The resolved resource name object.
 */
function resolveResourceName(resourceName) {
  const [type, ...remainingParts] = resourceName.split(`/`);

  if (remainingParts[0] === `aliases`) {
    const aliasFileName = remainingParts[1];
    const aliasKey = remainingParts.slice(2).join(`/`);
    const aliasesFilePath = `resources/${type}/aliases/${aliasFileName}.json`;

    let aliases;
    try {
      aliases = require(`../${aliasesFilePath}`);
    }
    catch (error) {
      throw new Error(`Resource aliases file '${aliasesFilePath}' not found.`);
    }

    if (!(aliasKey in aliases)) {
      throw new Error(`Resource alias '${aliasKey}' not defined in file '${aliasesFilePath}'.`);
    }

    return {
      type,
      key: aliases[aliasKey],
      alias: `${aliasFileName}/${aliasKey}`
    };
  }

  return {
    type,
    key: remainingParts.join(`/`),
    alias: null
  };
}

/**
 * @typedef {Object} ResourceImage
 * @property {String} dataUrl The data URL of the image.
 * @property {String} extension The extension of the image file.
 */

const mimeTypes = {
  svg: `image/svg+xml;charset=utf8`,
  png: `image/png`
};

/**
 * @param {String} type The resource type, i.e. name of the directory inside the resources directory.
 * @param {String} basePath The path of the resource directory.
 * @param {String} key The resource key.
 * @returns {ResourceImage|undefined} The resource image, or undefined if none could be found.
 */
function getImageForResource(type, basePath, key) {
  const extensions = Object.keys(mimeTypes);

  for (const extension of extensions) {
    try {
      const encoding = (extension === `svg` ? `utf8` : `base64`);
      let data = fs.readFileSync(`${basePath}/${key}.${extension}`, encoding);
      const mimeType = mimeTypes[extension];

      if (encoding === `utf8`) {
        // see https://cloudfour.com/thinks/simple-svg-placeholder/#how-it-works

        data = data
          .replace(/[\t\n\r]/gim, ``) // Strip newlines and tabs
          .replace(/\s\s+/g, ` `) // Condense multiple spaces
          .replace(/'/gim, `\\i`) // Normalize quotes
          .replace(/<!--(.*(?=-->))-->/gmi, ``); // Strip comments
      }

      return { mimeType, extension, data, encoding };
    }
    catch (ex) {
      // image does not exist
    }
  }

  if (type === `gobos`) {
    throw new Error(`Expected gobo image for resource '${basePath}/${key}' not found (supported file extensions: ${extensions.join(`, `)}).`);
  }

  return undefined;
}

module.exports = {
  AbstractChannel,
  Capability,
  CoarseChannel,
  FineChannel,
  Fixture,
  Manufacturer,
  Matrix,
  Meta,
  Mode,
  NullChannel,
  Physical,
  Range,
  SwitchingChannel,
  TemplateChannel,
  Wheel,
  WheelSlot,

  fixtureFromFile,
  fixtureFromRepository,
  embedResourcesIntoFixtureJson,
  getResourceFromString
};
