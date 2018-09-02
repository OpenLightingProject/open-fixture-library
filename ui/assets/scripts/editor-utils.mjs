import uuidV4 from 'uuid/v4.js';
import Channel from '~~/lib/model/Channel.mjs';

/**
 * @returns {!object} An empty fixture object.
 */
export function getEmptyFixture() {
  return {
    key: `[new]`,
    useExistingManufacturer: true,
    manufacturerShortName: ``,
    newManufacturerName: ``,
    newManufacturerShortName: ``,
    newManufacturerWebsite: ``,
    newManufacturerComment: ``,
    newManufacturerRdmId: null,
    name: ``,
    shortName: ``,
    categories: [],
    comment: ``,
    links: [getEmptyLink()],
    rdmModelId: null,
    rdmSoftwareVersion: ``,
    physical: getEmptyPhysical(),
    modes: [getEmptyMode()],
    metaAuthor: ``,
    metaGithubUsername: ``,
    availableChannels: {}
  };
}


/**
 * @returns {!object} An empty fixture link object.
 */
export function getEmptyLink() {
  return {
    uuid: uuidV4(),
    type: `manual`,
    url: ``
  };
}


/**
 * @returns {!object} An empty fixture's or mode's physical object.
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
      lumens: null
    },
    lens: {
      name: ``,
      degreesMinMax: null
    },
    focus: {
      type: ``,
      typeNew: ``,
      panMax: null,
      tiltMax: null
    }
  };
}


/**
 * @returns {!object} An empty mode object.
 */
export function getEmptyMode() {
  return {
    uuid: uuidV4(),
    name: ``,
    shortName: ``,
    rdmPersonalityIndex: null,
    enablePhysicalOverride: false,
    physical: getEmptyPhysical(),
    channels: []
  };
}


/**
 * @returns {!object} An empty channel object.
 */
export function getEmptyChannel() {
  return {
    uuid: uuidV4(),
    editMode: ``,
    modeId: ``,
    name: ``,
    type: ``,
    color: ``,
    resolution: Channel.RESOLUTION_8BIT,
    defaultValue: null,
    highlightValue: null,
    invert: null,
    constant: null,
    crossfade: null,
    precedence: ``,
    capResolution: Channel.RESOLUTION_8BIT,
    wizard: {
      show: false,
      start: 0,
      width: 10,
      count: 3,
      templateCapability: getEmptyCapability()
    },
    capabilities: [getEmptyCapability()]
  };
}


/**
 * @param {!string} coarseChannelId The UUID of the coarse channel.
 * @param {!number} resolution The resolution of the newly created fine channel.
 * @returns {!object} An empty fine channel object for the given coarse channel.
 */
export function getEmptyFineChannel(coarseChannelId, resolution) {
  return {
    uuid: uuidV4(),
    coarseChannelId: coarseChannelId,
    resolution: resolution
  };
}


/**
 * @returns {!object} An empty capability object.
 */
export function getEmptyCapability() {
  return {
    uuid: uuidV4(),
    open: true,
    dmxRange: null,
    type: ``,
    typeData: {}
  };
}


/**
 * @param {!object} channel The channel object.
 * @returns {!boolean} False if the channel object is still empty / unchanged, true otherwise.
 */
export function isChannelChanged(channel) {
  return Object.keys(channel).some(prop => {
    if ([`uuid`, `editMode`, `modeId`, `wizard`].includes(prop)) {
      return false;
    }

    if ([`defaultValue`, `highlightValue`, `invert`, `constant`, `crossfade`].includes(prop)) {
      return channel[prop] !== null;
    }

    if (prop === `resolution` || prop === `capResolution`) {
      return channel[prop] !== Channel.RESOLUTION_8BIT;
    }

    if (prop === `capabilities`) {
      return channel.capabilities.some(isCapabilityChanged);
    }

    return channel[prop] !== ``;
  });
}


/**
 * @param {!object} cap The capability object.
 * @returns {!boolean} False if the capability object is still empty / unchanged, true otherwise.
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
 * @param {?string} hexString A string of comma-separated hex values, or null.
 * @returns {?Array.<!string>} The hex codes as array of strings.
 */
export function colorsHexStringToArray(hexString) {
  if (typeof hexString !== `string`) {
    return null;
  }

  const hexArray = hexString.split(/\s*,\s*/).map(hex => hex.trim().toLowerCase()).filter(
    hex => hex.match(/^#[0-9a-f]{6}$/)
  );

  if (hexArray.length === 0) {
    return null;
  }

  return hexArray;
}


/**
 * @param {!object} channel The channel object that shall be sanitized.
 * @returns {!object} A clone of the channel object without properties that are just relevant for displaying it in the channel dialog.
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
