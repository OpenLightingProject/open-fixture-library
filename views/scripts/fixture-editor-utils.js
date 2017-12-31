var uuidV4 = require('uuid/v4.js');

module.exports.getEmptyFixture = function() {
  return {
    key: '[new]',
    useExistingManufacturer: true,
    manufacturerShortName: '',
    newManufacturerName: '',
    newManufacturerShortName: '',
    newManufacturerWebsite: '',
    newManufacturerComment: '',
    newManufacturerRdmId: '',
    name: '',
    shortName: '',
    categories: [],
    comment: '',
    manualURL: '',
    rdmModelId: '',
    rdmSoftwareVersion: '',
    physical: this.getEmptyPhysical(),
    modes: [this.getEmptyMode()],
    metaAuthor: '',
    metaGithubUsername: '',
    availableChannels: {}
  };
};

module.exports.getEmptyPhysical = function() {
  return {
    dimensionsWidth: '',
    dimensionsHeight: '',
    dimensionsDepth: '',
    weight: '',
    power: '',
    DMXconnector: '',
    DMXconnectorNew: '',
    bulb: {
      type: '',
      colorTemperature: '',
      lumens: ''
    },
    lens: {
      name: '',
      degreesMin: '',
      degreesMax: ''
    },
    focus: {
      type: '',
      typeNew: '',
      panMax: '',
      tiltMax: ''
    }
  };
};

module.exports.getEmptyMode = function() {
  return {
    uuid: uuidV4(),
    name: '',
    shortName: '',
    rdmPersonalityIndex: '',
    enablePhysicalOverride: false,
    physical: this.getEmptyPhysical(),
    channels: []
  };
};

module.exports.getEmptyChannel = function() {
  return {
    uuid: uuidV4(),
    editMode: '',
    modeId: '',
    name: '',
    type: '',
    color: '',
    fineness: 0,
    defaultValue: '',
    highlightValue: '',
    invert: '',
    constant: '',
    crossfade: '',
    precedence: '',
    capFineness: 0,
    wizard: {
      show: false,
      start: 0,
      width: 10,
      count: 3,
      templateName: 'Function #'
    },
    capabilities: [this.getEmptyCapability()]
  };
};

module.exports.getEmptyFineChannel = function(coarseChannelId, fineness) {
  return {
    uuid: uuidV4(),
    coarseChannelId: coarseChannelId,
    fineness: fineness
  };
};

module.exports.getEmptyCapability = function() {
  return {
    uuid: uuidV4(),
    start: '',
    end: '',
    name: '',
    color: '',
    color2: ''
  };
};

/**
 * @param {!object} channel The channel object that shall be sanitized.
 * @returns {!object} A clone of the channel object without properties that are just relevant for displaying it in the channel dialog.
 */
module.exports.getSanitizedChannel = function(channel) {
  var retChannel = this.clone(channel);
  delete retChannel.editMode;
  delete retChannel.modeId;
  delete retChannel.wizard;

  return retChannel;
};

/**
 * @param {!object} cap The capability object.
 * @returns {!boolean} False if the capability object is still empty / unchanged, true otherwise.
 */
module.exports.isCapabilityChanged = function(cap) {
  return Object.keys(cap).some(function(prop) {
    if (prop === 'uuid') {
      return false;
    }
    return cap[prop] !== '';
  });
};

/**
 * @param {*} obj The object / array / ... to clone. Note: only JSON-stringifiable objects / properties are cloneable, i.e. no functions.
 * @returns {*} A deep clone.
 */
module.exports.clone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};
