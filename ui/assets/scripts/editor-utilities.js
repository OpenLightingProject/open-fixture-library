import { v4 as uuidv4 } from 'uuid';

export const constants = {
  RESOLUTION_8BIT: 1,
  RESOLUTION_16BIT: 2,
  RESOLUTION_24BIT: 3,
  RESOLUTION_32BIT: 4,
};

/**
 * @returns {object} An empty object to be used as a form state for `vue-form`.
 */
export function getEmptyFormState() {
  return {};
}

/**
 * @returns {object} An empty fixture object.
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
 * @param {string} linkType The type of the new link.
 * @returns {object} An empty fixture link object.
 */
export function getEmptyLink(linkType = `manual`) {
  return {
    uuid: uuidv4(),
    type: linkType,
    url: ``,
  };
}


/**
 * @returns {object} An empty fixture's or mode's physical object.
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
 * @returns {object} An empty mode object.
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
 * @returns {object} An empty channel object.
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
 * @param {string} coarseChannelId The UUID of the coarse channel.
 * @param {number} resolution The resolution of the newly created fine channel.
 * @returns {object} An empty fine channel object for the given coarse channel.
 */
export function getEmptyFineChannel(coarseChannelId, resolution) {
  return {
    uuid: uuidv4(),
    coarseChannelId,
    resolution,
  };
}


/**
 * @returns {object} An empty capability object.
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
 * @returns {object} An empty wheel slot object.
 */
export function getEmptyWheelSlot() {
  return {
    uuid: uuidv4(),
    type: ``,
    typeData: {},
  };
}


/**
 * @param {object} channel The channel object.
 * @returns {boolean} False if the channel object is still empty / unchanged, true otherwise.
 */
export function isChannelChanged(channel) {
  return Object.keys(channel).some(property => {
    if ([`uuid`, `editMode`, `modeId`, `wizard`].includes(property)) {
      return false;
    }

    if ([`defaultValue`, `highlightValue`, `invert`, `constant`, `crossfade`].includes(property)) {
      return channel[property] !== null;
    }

    if (property === `resolution` || property === `dmxValueResolution`) {
      return channel[property] !== constants.RESOLUTION_8BIT;
    }

    if (property === `capabilities`) {
      return channel.capabilities.some(
        capability => isCapabilityChanged(capability),
      );
    }

    return channel[property] !== ``;
  });
}


/**
 * @param {object} capability The capability object.
 * @returns {boolean} False if the capability object is still empty / unchanged, true otherwise.
 */
export function isCapabilityChanged(capability) {
  if (capability.dmxRange !== null) {
    return true;
  }

  if (capability.type !== ``) {
    return true;
  }

  return Object.values(capability.typeData).some(value => value !== `` && value !== null);
}


/**
 * @param {string | null} hexString A string of comma-separated hex values, or null.
 * @returns {string[] | null} The hex codes as array of strings.
 */
export function colorsHexStringToArray(hexString) {
  if (typeof hexString !== `string`) {
    return null;
  }

  const hexArray = hexString.split(/\s*,\s*/).map(hex => hex.trim().toLowerCase()).filter(
    hex => hex.match(/^#[\da-f]{6}$/),
  );

  if (hexArray.length === 0) {
    return null;
  }

  return hexArray;
}


/**
 * @param {object} channel The channel object that shall be sanitized.
 * @returns {object} A clone of the channel object without properties that are just relevant for displaying it in the channel dialog.
 */
export function getSanitizedChannel(channel) {
  const sanitizedChannel = structuredClone(channel);
  delete sanitizedChannel.editMode;
  delete sanitizedChannel.modeId;
  delete sanitizedChannel.wizard;

  return sanitizedChannel;
}
