const path = require(`path`);

// see https://github.com/standard-things/esm#getting-started
require = require(`@std/esm`)(module); // eslint-disable-line no-global-assign

const AbstractChannel = require(`./model/AbstractChannel.mjs`).default;
const Capability = require(`./model/Capability.mjs`).default;
const Channel = require(`./model/Channel.mjs`).default;
const FineChannel = require(`./model/FineChannel.mjs`).default;
const Fixture = require(`./model/Fixture.mjs`).default;
const Manufacturer = require(`./model/Manufacturer.mjs`).default;
const Matrix = require(`./model/Matrix.mjs`).default;
const MatrixChannelReference = require(`./model/MatrixChannelReference.mjs`).default;
const Meta = require(`./model/Meta.mjs`).default;
const Mode = require(`./model/Mode.mjs`).default;
const NullChannel = require(`./model/NullChannel.mjs`).default;
const Physical = require(`./model/Physical.mjs`).default;
const Range = require(`./model/Range.mjs`).default;
const SwitchingChannel = require(`./model/SwitchingChannel.mjs`).default;
const TemplateChannel = require(`./model/TemplateChannel.mjs`).default;

/**
 * Look up the fixture definition in the directory structure and create a Fixture instance.
 * @param {!string} absolutePath The fixture file abolute path, including filename.
 * @throws When the given fixture file does not exist.
 * @returns {!Fixture} The created Fixture instance, null if not found.
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
 * @param {!string} manufacturerKey The manufacturer's key (directory name)
 * @param {!string} fixtureKey The fixture's key (filename without .json)
 * @throws When the given fixture does not exist in the repository.
 * @returns {!Fixture} The created Fixture instance, null if not found.
 */
function fixtureFromRepository(manufacturerKey, fixtureKey) {
  let fixPath = `../fixtures/${manufacturerKey}/${fixtureKey}.json`;
  let fixJson = require(fixPath);

  if (fixJson.$schema.endsWith(`/fixture-redirect.json`)) {
    [manufacturerKey, fixtureKey] = fixJson.redirectTo.split(`/`);
    fixPath = `../fixtures/${manufacturerKey}/${fixtureKey}.json`;
    fixJson = require(fixPath);
  }

  return new Fixture(manufacturerKey, fixtureKey, fixJson);
}

module.exports = {
  AbstractChannel,
  Capability,
  Channel,
  FineChannel,
  Fixture,
  Manufacturer,
  Matrix,
  MatrixChannelReference,
  Meta,
  Mode,
  NullChannel,
  Physical,
  Range,
  SwitchingChannel,
  TemplateChannel,

  fixtureFromFile,
  fixtureFromRepository
};
