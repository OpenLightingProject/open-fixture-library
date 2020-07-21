/* Based on the ofl export plugin */

const fixtureJsonStringify = require(`../../lib/fixture-json-stringify.js`);
const namedColors = require(`color-name-list`);
const fs = require(`fs`);
const path = require(`path`);

/** @typedef {import('../../lib/model/Fixture.js').default} Fixture */

const manufacturers = require(`../../fixtures/manufacturers.json`);
const units = [`K`, `deg`, `%`, `ms`, `Hz`, `m^3/min`, `rpm`];
const excludeKeys = [`comment`, `name`, `helpWanted`, `type`, `effectName`, `effectPreset`, `shutterEffect`, `wheel`, `isShaking`, `fogType`, `menuClick`];

module.exports.version = `1.0.0`;

/**
 * @param {Array.<Fixture>} fixtures An array of Fixture objects.
 * @param {Object} options Global options, including:
 * @param {String} options.baseDir Absolute path to OFL's root directory.
 * @param {Date} options.date The current time.
 * @param {String|undefined} options.displayedPluginVersion Replacement for module.exports.version if the plugin version is used in export.
 * @returns {Promise.<Array.<Object>, Error>} The generated files.
 */
module.exports.export = async function exportAGLight(fixtures, options) {
  const displayedPluginVersion = options.displayedPluginVersion || module.exports.version;

  const library = {
    version: displayedPluginVersion,
    fixtures: fixtures.map(fixture => {
      const jsonData = JSON.parse(JSON.stringify(fixture.jsonObject));
      jsonData.fixtureKey = fixture.key;
      jsonData.manufacturer = manufacturers[fixture.manufacturer.key];
      jsonData.oflURL = `https://open-fixture-library.org/${fixture.manufacturer.key}/${fixture.key}`;

      transformSingleCapabilityToArray(jsonData);
      transformNonNumericValues(jsonData);

      return jsonData;
    }),
    resources: {
      gobos: getGobos(),
    },
  };
  return [{
    name: `aglight_fixture_library.json`,
    content: fixtureJsonStringify(library),
    mimetype: `application/aglight-fixture-library`,
    fixtures,
  }];
};

/**
 * @param {Object} content The fixture data
 */
function transformSingleCapabilityToArray(content) {
  if (content.availableChannels) {
    for (const channel of Object.values(content.availableChannels)) {
      if (channel.capability) {
        channel.capabilities = [channel.capability];
        channel.singleCapability = true;
        delete channel.capability;
      }
    }
  }
}

/**
 * @param {Object} content The fixture data
 */
function transformNonNumericValues(content) {
  if (content.availableChannels) {
    for (const k of Object.keys(content.availableChannels)) {
      for (const capability of content.availableChannels[k].capabilities) {
        processCapability(capability, excludeKeys);
      }
    }
  }
}

/**
 * @param {Object} capability The capability
 */
function processCapability(capability) {
  for (const k2 of Object.keys(capability)) {
    if ((typeof capability[k2] === `string`) && (!excludeKeys.includes(k2))) {
      processUnit(capability, k2);
      if ((typeof capability[k2] === `string`) && capability[k2].endsWith(`s`)) {
        capability[k2].replace(`s`, ``);
        capability[k2] = parseInt(capability[k2], 10) * 1000;
      }
      else if (parseInt(capability[k2], 10)) {
        capability[k2] = parseInt(capability[k2], 10);
      }
      processColor(capability, k2);
    }
  }
}

/**
 * @param {Object} capability The capability
 * @param {String} k2 The key
 */
function processColor(capability, k2) {
  if (k2 === `color`) {
    const c = namedColors.find(color => color.name === capability[k2]);
    if (c && c.hex) {
      capability[k2] = c.hex;
    }
    else {
      console.log(`#### color not found`, capability[k2]);
    }
  }
}

/**
 * @param {Object} capability The capability
 * @param {String} k2 The key
 */
function processUnit(capability, k2) {
  for (const u of units) {
    if ((typeof capability[k2] === `string`) && capability[k2].endsWith(u)) {
      capability[k2].replace(u, ``);
      capability[k2] = parseInt(capability[k2], 10);
    }
  }
}

/**
 * @returns {Object} The gobos
 */
function getGobos() {
  const gobos = {};
  const extensions = [`svg`, `png`];
  const basePath = path.join(__dirname, `../../resources/gobos`);
  const files = fs.readdirSync(basePath);
  console.log(files);
  for (const file of files) {
    if (file.endsWith(`.json`)) {
      for (const ext of extensions) {
        const resourceFile = path.join(basePath, file.replace(`.json`, `.${ext}`));
        console.log(resourceFile);
        if (fs.existsSync(resourceFile)) {
          const goboName = file.split(`/`).pop().split(`.`)[0];
          gobos[goboName] = `data:image/${ext === `svg` ? `svg+xml` : ext};base64,${Buffer.from(fs.readFileSync(resourceFile)).toString(`base64`)}`;
        }
      }
    }
  }
  return gobos;
}
