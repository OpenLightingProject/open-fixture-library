/* eslint-disable no-unused-vars */
const {
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
  TemplateChannel
} = require(`../model.js`);
/* eslint-enable no-unused-vars */

const schemaProperties = require(`../../lib/schema-properties.js`);

/** @type {Array.<string>} */
const capabilityTypes = Object.keys(schemaProperties.capabilityTypes);

module.exports = capabilityTypes.map(type => ({
  id: `capability-type-${type}`,
  name: `Capability type ${type}`,
  description: `Whether the fixture has at least one capability of type '${type}'`,

  /**
   * @param {!Fixture} fixture The Fixture instance
   * @returns {!boolean} true if the fixture has at least one capability of the current type
   */
  hasFeature: fixture => fixture.normalizedChannels.some(
    channel => channel.capabilities.some(
      cap => cap.type === type
    )
  )
}));
