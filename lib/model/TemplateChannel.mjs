import CoarseChannel from './CoarseChannel.mjs';

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
   * @returns {array.<string>} Template keys and aliases introduced by this channel, i.e. the channel key itself and defined fine and switching channels.
   */
  get allTemplateKeys() {
    if (!(`allTemplateKeys` in this._jsonObject)) {
      this._cache.allTemplateKeys = [this.key].concat(this.fineChannelAliases, this.switchingChannelAliases);
    }

    return this._cache.allTemplateKeys;
  }

  /**
   * @returns {Map.<string, array.<string>>} All template keys pointing to the key resolved with each pixel key to a matrix channel key.
   */
  get possibleMatrixChannelKeys() {
    if (!(`possibleMatrixChannelKeys` in this._cache)) {
      const resolvedChKeys = new Map();

      for (const templateKey of this.allTemplateKeys) {
        const pixelKeys = this.fixture.matrix.pixelKeys.concat(this.fixture.matrix.pixelGroupKeys);
        resolvedChKeys.set(templateKey, pixelKeys.map(
          pixelKey => TemplateChannel.resolveTemplateString(templateKey, { pixelKey: pixelKey })
        ));
      }

      this._cache.possibleMatrixChannelKeys = resolvedChKeys;
    }

    return this._cache.possibleMatrixChannelKeys;
  }

  /**
   * Creates matrix channels from this template channel (together with its fine and switching channels if defined) and all pixel keys.
   * @returns {array.<AbstractChannel>} The generated channels associated to the given pixel key and its fine and switching channels.
   */
  createMatrixChannels() {
    const matrixChannels = [];

    const pixelKeys = this.fixture.matrix.pixelKeys.concat(this.fixture.matrix.pixelGroupKeys);
    pixelKeys.forEach(pixelKey => {
      const templateVariables = {
        pixelKey: pixelKey
      };

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
   * @param {object} obj The object which has to be modified.
   * @param {object.<string, string>} variables Each variable (without $) pointing to its value.
   * @returns {object} A copy of the object with replaced variables.
   */
  static resolveTemplateObject(obj, variables) {
    return JSON.parse(TemplateChannel.resolveTemplateString(JSON.stringify(obj), variables));
  }

  /**
   * Replaces the specified variables in the specified string.
   * @param {string} str The string which has to be modified.
   * @param {object.<string, string>} variables Each variable (without $) pointing to its value.
   * @returns {string} The modified string.
   */
  static resolveTemplateString(str, variables) {
    for (const variable of (Object.keys(variables))) {
      str = stringReplaceAll(str, `$${variable}`, variables[variable]);
    }
    return str;
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
