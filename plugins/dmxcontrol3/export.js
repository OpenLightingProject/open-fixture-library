const xmlbuilder = require('xmlbuilder');
const sanitize = require('sanitize-filename');

const Fixture = require('../../lib/model/Fixture.js');
const Mode = require('../../lib/model/Mode.js');

module.exports.name = 'DMXControl 3 (DDF3)';
module.exports.version = '0.1.0';

/**
 * @param {!Array.<Fixture>} fixtures The fixtures to convert into DMXControl device definitions
 * @param {!options} options Some global options
 * @returns {!Array.<object>} All generated files
 */
module.exports.export = function exportDMXControl3(fixtures, options) {
  const deviceDefinitions = [];

  for (const fixture of fixtures) {
    // add device for each mode
    for (const mode of fixture.modes) {
      const xml = xmlbuilder.begin()
        .declaration('1.0', 'utf-8')
        .element({
          device: {
            '@type': 'DMXDevice',
            '@dmxaddresscount': mode.channelKeys.length,
            '@dmxcversion': 3,
            '@ddfversion': fixture.meta.lastModifyDate.toISOString().split('T')[0]
          }
        });

      addInformation(xml, mode);
      addFunctions(xml, mode);

      deviceDefinitions.push({
        name: sanitize(`${fixture.manufacturer.key}-${fixture.key}-${(mode.shortName)}.xml`).replace(/\s+/g, '-'),
        content: xml.end({
          pretty: true,
          indent: '  '
        }),
        mimetype: 'application/xml'
      });
    }
  }

  return deviceDefinitions;
};

/**
 * Adds the information block to the specified xml file.
 * @param {!XMLDocument} xml The device definition to add the information to
 * @param {!Mode} mode The definition's mode
 */
function addInformation(xml, mode) {
  const xmlInfo = xml.element('information');
  xmlInfo.element('model').text(mode.fixture.name);
  xmlInfo.element('vendor').text(mode.fixture.manufacturer.name);
  xmlInfo.element('author').text(mode.fixture.meta.authors.join(', '));
  xmlInfo.element('mode').text(mode.name);

  if (mode.fixture.hasComment) {
    xmlInfo.element('comment').text(mode.fixture.comment);
  }
}

/**
 * Adds the dmx channels as functions to the specified xml file.
 * @param {!XMLDocument} xml The device definition to add the functions to
 * @param {!Mode} mode The definition's mode
 */
function addFunctions(xml, mode) {
  const xmlFunctions = xml.element('functions');
}