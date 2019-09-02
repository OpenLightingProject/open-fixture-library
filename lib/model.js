const path = require(`path`);

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
 * @param {string} absolutePath The fixture file absolute path, including filename.
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

  return new Fixture(manufacturerKey, fixtureKey, fixJson);
}

/**
 * Look up the fixture definition in the directory structure and create a Fixture instance.
 * @param {string} manufacturerKey The manufacturer's key (directory name)
 * @param {string} fixtureKey The fixture's key (filename without .json)
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

  return new Fixture(manufacturerKey, fixtureKey, fixJson);
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
  fixtureFromRepository
};
