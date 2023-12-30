import cacheResult from '../cache-result.js';
/** @ignore @typedef {import('./AbstractChannel.js').default} AbstractChannel */
import CoarseChannel from './CoarseChannel.js';
/** @ignore @typedef {import('./Fixture.js').default} Fixture */

/**
 * Represents a blueprint channel of which several similar channels can be generated.
 * Currently used to create matrix channels.
 */
class TemplateChannel extends CoarseChannel {
  /**
   * Creates new TemplateChannel instance. Also clears cache by setting jsonObject.
   * @param {string} key The templateChannel's key with the required variables.
   * @param {object} jsonObject The template's JSON data which looks pretty similar to a normal channel's data except that channel aliases must include variables.
   * @param {Fixture} fixture The Fixture instance.
   */
  constructor(key, jsonObject, fixture) {
    super(key, jsonObject, fixture);
  }

  /**
   * @returns {string[]} Template keys and aliases introduced by this channel, i.e. the channel key itself and defined fine and switching channels.
   */
  get allTemplateKeys() {
    return cacheResult(this, `allTemplateKeys`, [this.key, ...this.fineChannelAliases, ...this.switchingChannelAliases]);
  }

  /**
   * @returns {Map<string, string[]>} All template keys pointing to the key resolved with each pixel key to a matrix channel key.
   */
  get possibleMatrixChannelKeys() {
    const possibleMatrixChannelKeys = new Map();

    for (const templateKey of this.allTemplateKeys) {
      const pixelKeys = [...this.fixture.matrix.pixelKeys, ...this.fixture.matrix.pixelGroupKeys];
      possibleMatrixChannelKeys.set(templateKey, pixelKeys.map(
        pixelKey => TemplateChannel.resolveTemplateString(templateKey, { pixelKey }),
      ));
    }

    return cacheResult(this, `possibleMatrixChannelKeys`, possibleMatrixChannelKeys);
  }

  /**
   * Creates matrix channels from this template channel (together with its fine and switching channels if defined) and all pixel keys.
   * @returns {AbstractChannel[]} The generated channels associated to the given pixel key and its fine and switching channels.
   */
  createMatrixChannels() {
    const matrixChannels = [];

    const pixelKeys = [...this.fixture.matrix.pixelKeys, ...this.fixture.matrix.pixelGroupKeys];
    for (const pixelKey of pixelKeys) {
      const templateVariables = { pixelKey };

      // create a new CoarseChannel from the resolved channel data
      const jsonData = TemplateChannel.resolveTemplateObject(this._jsonObject, templateVariables);
      const channelKey = TemplateChannel.resolveTemplateString(this._key, templateVariables);
      const mainChannel = new CoarseChannel(channelKey, jsonData, this.fixture);

      const channels = [mainChannel, ...mainChannel.fineChannels, ...mainChannel.switchingChannels];
      for (const channel of channels) {
        channel.pixelKey = pixelKey;
      }
      matrixChannels.push(...channels);
    }

    return matrixChannels;
  }

  /**
   * Replaces the specified variables in the specified object by cloning the object.
   * @param {object} object The object which has to be modified.
   * @param {Record<string, string>} variables Each variable (without $) pointing to its value.
   * @returns {object} A copy of the object with replaced variables.
   */
  static resolveTemplateObject(object, variables) {
    return JSON.parse(TemplateChannel.resolveTemplateString(JSON.stringify(object), variables));
  }

  /**
   * Replaces the specified variables in the specified string.
   * @param {string} string The string which has to be modified.
   * @param {Record<string, string>} variables Each variable (without $) pointing to its value.
   * @returns {string} The modified string.
   */
  static resolveTemplateString(string, variables) {
    for (const variable of (Object.keys(variables))) {
      string = stringReplaceAll(string, `$${variable}`, variables[variable]);
    }
    return string;
  }
}

export default TemplateChannel;

/**
 * @ignore
 * @param {string} string The string to operate on.
 * @param {string} search A string that is to be replaced by replacement. It is treated as a verbatim string and is not interpreted as a regular expression.
 * @param {string} replacement The string that replaces the substring specified by the specified search parameter.
 * @returns {string} The string with all matches of the search pattern replaced by the replacement.
 */
function stringReplaceAll(string, search, replacement) {
  return string.split(search).join(replacement);
}
