// see https://github.com/standard-things/esm#getting-started
require = require(`@std/esm`)(module); // eslint-disable-line no-global-assign

const AbstractChannel = require(`./model/AbstractChannel.mjs`).default;
const Capability = require(`./model/Capability.mjs`).default;
const Channel = require(`./model/Channel.mjs`).default;
const FineChannel = require(`./model/FineChannel.mjs`).default;
const Fixture = require(`./model/Fixture.mjs`).default;
const Manufacturer = require(`./model/Manufacturer.mjs`).default;
const Matrix = require(`./model/Matrix.mjs`).default;
const MatrixChannel = require(`./model/MatrixChannel.mjs`).default;
const MatrixChannelReference = require(`./model/MatrixChannelReference.mjs`).default;
const Meta = require(`./model/Meta.mjs`).default;
const Mode = require(`./model/Mode.mjs`).default;
const NullChannel = require(`./model/NullChannel.mjs`).default;
const Physical = require(`./model/Physical.mjs`).default;
const Range = require(`./model/Range.mjs`).default;
const SwitchingChannel = require(`./model/SwitchingChannel.mjs`).default;
const TemplateChannel = require(`./model/TemplateChannel.mjs`).default;

/**
 * Looks up the fixture definition in the directory structure and creates a Fixture instance.
 * @param {!string} manufacturerKey The manufacturer's key (directory name)
 * @param {!string} fixtureKey The fixture's key (filename without .json)
 * @returns {?Fixture} The created Fixture instance, null if not found.
 */
function fixtureFromRepository(manufacturerKey, fixtureKey) {
  const fixPath = `../fixtures/${manufacturerKey}/${fixtureKey}.json`;
  return new Fixture(manufacturerKey, fixtureKey, require(fixPath));
}

module.exports = {
  AbstractChannel,
  Capability,
  Channel,
  FineChannel,
  Fixture,
  Manufacturer,
  Matrix,
  MatrixChannel,
  MatrixChannelReference,
  Meta,
  Mode,
  NullChannel,
  Physical,
  Range,
  SwitchingChannel,
  TemplateChannel,

  fixtureFromRepository
};
