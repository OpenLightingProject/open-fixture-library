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
   * @param {String} key The templateChannel's key with the required variables.
   * @param {Object} jsonObject The template's JSON data which looks pretty similar to a normal channel's data except that channel aliases must include variables.
   * @param {Fixture} fixture The Fixture instance.
   */
  constructor(key, jsonObject, fixture) {
    super(key, jsonObject, fixture);
  }

  /**
   * @returns {Array.<String>} Template keys and aliases introduced by this channel, i.e. the channel key itself and defined fine and switching channels.
   */
  get allTemplateKeys() {
    if (!(`allTemplateKeys` in this._jsonObject)) {
      this._cache.allTemplateKeys = [this.key].concat(this.fineChannelAliases, this.switchingChannelAliases);
    }

    return this._cache.allTemplateKeys;
  }

  /**
   * @returns {Map.<String, Array.<String>>} All template keys pointing to the key resolved with each pixel key to a matrix channel key.
   */
  get possibleMatrixChannelKeys() {
    if (!(`possibleMatrixChannelKeys` in this._cache)) {
      const resolvedChKeys = new Map();

      for (const templateKey of this.allTemplateKeys) {
        const pixelKeys = this.fixture.matrix.pixelKeys.concat(this.fixture.matrix.pixelGroupKeys);
        resolvedChKeys.set(templateKey, pixelKeys.map(
          pixelKey => TemplateChannel.resolveTemplateString(templateKey, { pixelKey }),
        ));
      }

      this._cache.possibleMatrixChannelKeys = resolvedChKeys;
    }

    return this._cache.possibleMatrixChannelKeys;
  }

  /**
   * Creates matrix channels from this template channel (together with its fine and switching channels if defined) and all pixel keys.
   * @returns {Array.<AbstractChannel>} The generated channels associated to the given pixel key and its fine and switching channels.
   */
  createMatrixChannels() {
    const matrixChannels = [];

    const pixelKeys = this.fixture.matrix.pixelKeys.concat(this.fixture.matrix.pixelGroupKeys);
    pixelKeys.forEach(pixelKey => {
      const templateVariables = { pixelKey };

      // create a new CoarseChannel from the resolved channel data
      const jsonData = TemplateChannel.resolveTemplateObject(this._jsonObject, templateVariables);
      const chKey = TemplateChannel.resolveTemplateString(this._key, templateVariables);
      const mainChannel = new CoarseChannel(chKey, jsonData, this.fixture);

      const channels = [mainChannel].concat(mainChannel.fineChannels, mainChannel.switchingChannels);
      channels.forEach(ch => (ch.pixelKey = pixelKey));
      matrixChannels.push(...channels);
    });

    return matrixChannels;
  }

  /**
   * Replaces the specified variables in the specified object by cloning the object.
   * @param {Object} object The object which has to be modified.
   * @param {Object.<String, String>} variables Each variable (without $) pointing to its value.
   * @returns {Object} A copy of the object with replaced variables.
   */
  static resolveTemplateObject(object, variables) {
    return JSON.parse(TemplateChannel.resolveTemplateString(JSON.stringify(object), variables));
  }

  /**
   * Replaces the specified variables in the specified string.
   * @param {String} string The string which has to be modified.
   * @param {Object.<String, String>} variables Each variable (without $) pointing to its value.
   * @returns {String} The modified string.
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
 * @param {String} string The string to operate on.
 * @param {String} search A string that is to be replaced by replacement. It is treated as a verbatim string and is not interpreted as a regular expression.
 * @param {String} replacement The string that replaces the substring specified by the specified search parameter.
 * @returns {String} The string with all matches of the search pattern replaced by the replacement.
 */
function stringReplaceAll(string, search, replacement) {
  return string.split(search).join(replacement);
}
