import { v4 as uuidv4 } from 'uuid';

export const constants = {
  RESOLUTION_8BIT: 1,
  RESOLUTION_16BIT: 2,
  RESOLUTION_24BIT: 3,
  RESOLUTION_32BIT: 4,
};

/**
 * @returns {Object} An empty fixture object.
 */
export function getEmptyFixture() {
  return {
    key: `[new]`,
    useExistingManufacturer: true,
    manufacturerKey: ``,
    newManufacturerName: ``,
    newManufacturerWebsite: ``,
    newManufacturerComment: ``,
    newManufacturerRdmId: null,
    name: ``,
    shortName: ``,
    categories: [],
    comment: ``,
    links: [
      getEmptyLink(`manual`),
      getEmptyLink(`productPage`),
      getEmptyLink(`video`),
    ],
    rdmModelId: null,
    rdmSoftwareVersion: ``,
    physical: getEmptyPhysical(),
    modes: [getEmptyMode()],
    metaAuthor: ``,
    availableChannels: {},
  };
}


/**
 * @param {String} linkType The type of the new link.
 * @returns {Object} An empty fixture link object.
 */
export function getEmptyLink(linkType = `manual`) {
  return {
    uuid: uuidv4(),
    type: linkType,
    url: ``,
  };
}


/**
 * @returns {Object} An empty fixture's or mode's physical object.
 */
export function getEmptyPhysical() {
  return {
    dimensions: null,
    weight: null,
    power: null,
    DMXconnector: ``,
    DMXconnectorNew: ``,
    bulb: {
      type: ``,
      colorTemperature: null,
      lumens: null,
    },
    lens: {
      name: ``,
      degreesMinMax: null,
    },
  };
}


/**
 * @returns {Object} An empty mode object.
 */
export function getEmptyMode() {
  return {
    uuid: uuidv4(),
    name: ``,
    shortName: ``,
    rdmPersonalityIndex: null,
    enablePhysicalOverride: false,
    physical: getEmptyPhysical(),
    channels: [],
  };
}


/**
 * @returns {Object} An empty channel object.
 */
export function getEmptyChannel() {
  return {
    uuid: uuidv4(),
    editMode: ``,
    modeId: ``,
    name: ``,
    resolution: constants.RESOLUTION_8BIT,
    dmxValueResolution: constants.RESOLUTION_8BIT,
    defaultValue: ``,
    highlightValue: ``,
    constant: null,
    precedence: ``,
    wheel: {
      direction: ``,
      slots: [],
    },
    wizard: {
      show: false,
      start: 0,
      width: 10,
      count: 3,
      templateCapability: getEmptyCapability(),
    },
    capabilities: [getEmptyCapability()],
  };
}


/**
 * @param {String} coarseChannelId The UUID of the coarse channel.
 * @param {Number} resolution The resolution of the newly created fine channel.
 * @returns {Object} An empty fine channel object for the given coarse channel.
 */
export function getEmptyFineChannel(coarseChannelId, resolution) {
  return {
    uuid: uuidv4(),
    coarseChannelId: coarseChannelId,
    resolution: resolution,
  };
}


/**
 * @returns {Object} An empty capability object.
 */
export function getEmptyCapability() {
  return {
    uuid: uuidv4(),
    open: true,
    dmxRange: null,
    type: ``,
    typeData: {},
  };
}


/**
 * @returns {Object} An empty wheel slot object.
 */
export function getEmptyWheelSlot() {
  return {
    uuid: uuidv4(),
    type: ``,
    typeData: {},
  };
}


/**
 * @param {Object} channel The channel object.
 * @returns {Boolean} False if the channel object is still empty / unchanged, true otherwise.
 */
export function isChannelChanged(channel) {
  return Object.keys(channel).some(prop => {
    if ([`uuid`, `editMode`, `modeId`, `wizard`].includes(prop)) {
      return false;
    }

    if ([`defaultValue`, `highlightValue`, `invert`, `constant`, `crossfade`].includes(prop)) {
      return channel[prop] !== null;
    }

    if (prop === `resolution` || prop === `dmxValueResolution`) {
      return channel[prop] !== constants.RESOLUTION_8BIT;
    }

    if (prop === `capabilities`) {
      return channel.capabilities.some(isCapabilityChanged);
    }

    return channel[prop] !== ``;
  });
}


/**
 * @param {Object} cap The capability object.
 * @returns {Boolean} False if the capability object is still empty / unchanged, true otherwise.
 */
export function isCapabilityChanged(cap) {
  if (cap.dmxRange !== null) {
    return true;
  }

  if (cap.type !== ``) {
    return true;
  }

  return Object.keys(cap.typeData).some(prop => {
    return cap.typeData[prop] !== `` && cap.typeData[prop] !== null;
  });
}


/**
 * @param {String|null} hexString A string of comma-separated hex values, or null.
 * @returns {Array.<String>|null} The hex codes as array of strings.
 */
export function colorsHexStringToArray(hexString) {
  if (typeof hexString !== `string`) {
    return null;
  }

  const hexArray = hexString.split(/\s*,\s*/).map(hex => hex.trim().toLowerCase()).filter(
    hex => hex.match(/^#[0-9a-f]{6}$/),
  );

  if (hexArray.length === 0) {
    return null;
  }

  return hexArray;
}


/**
 * @param {Object} channel The channel object that shall be sanitized.
 * @returns {Object} A clone of the channel object without properties that are just relevant for displaying it in the channel dialog.
 */
export function getSanitizedChannel(channel) {
  const retChannel = clone(channel);
  delete retChannel.editMode;
  delete retChannel.modeId;
  delete retChannel.wizard;

  return retChannel;
}


/**
 * @param {*} obj The object / array / ... to clone. Note: only JSON-stringifiable objects / properties are cloneable, i.e. no functions.
 * @returns {*} A deep clone.
 */
export function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
