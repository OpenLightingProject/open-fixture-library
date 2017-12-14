const Channel = require('./Channel.js');
const MatrixChannel = require('./MatrixChannel.js');

module.exports = class TemplateChannel extends Channel {
  /**
   * Creates new TemplateChannel instance. Also clears cache by setting jsonObject.
   * @param {!string} key The templateChannel's key with the required variables.
   * @param {!object} jsonObject The template's JSON data which looks pretty similar to a normal channel's data except that channel aliases can include variables.
   * @param {!Fixture} fixture The Fixture instance.
   */
  constructor(key, jsonObject, fixture) {
    super(key, jsonObject, fixture);
  }

  /**
   * @returns {!Array.<string>} Template keys and aliases used in this channel, i.e. the channel key itself, defined fine and switching channels, and keys of switched channels.
   */
  get allTemplateKeys() {
    if (!('allTemplateKeys' in this._jsonObject)) {
      this._cache.allTemplateKeys = [this.key].concat(this.fineChannelAliases, this.switchingChannelAliases, this.switchToChannelKeys);
    }

    return this._cache.allTemplateKeys;
  }

  /**
   * @returns {!Map.<string, string>} All resolved keys/aliases created in this channel pointing to its pixelKey/pixelGroupKey.
   */
  get matrixChannelKeys() {
    if (!('matrixChannelKeys' in this._cache)) {
      const matrixChKeys = new Map();

      const pixelKeys = this.fixture.matrix.pixelKeys.concat(this.fixture.matrix.pixelGroupKeys);
      const chKeys = [this.key].concat(this.fineChannelAliases, this.switchingChannelAliases);
      for (const pixelKey of pixelKeys) {
        for (const chKey of chKeys) {
          const matrixChKey = TemplateChannel.parseTemplateString(chKey, { pixelKey: pixelKey });
          matrixChKeys.set(matrixChKey, pixelKey);
        }
      }

      this._cache.matrixChannelKeys = matrixChKeys;
    }

    return this._cache.matrixChannelKeys;
  }

  /**
   * Creates a channel from this template with the specified pixelKey.
   * If availableChannels override this channel, just wrap that existing channel.
   * @param {!string} pixelKey The channel's pixelKey or pixelGroupKey.
   * @returns {!Array.<MatrixChannel>} MatrixChannels wrapping the generated channel and its fine and switching channels
   */
  createMatrixChannels(pixelKey) {
    const variables = {
      pixelKey: pixelKey
    };

    const chKey = TemplateChannel.parseTemplateString(this._key, variables);
    let mainChannel;

    if (this.fixture.availableChannelKeys.includes(chKey)) {
      mainChannel = this.fixture.getAvailableChannelByKey(chKey);
    }
    else {
      const jsonData = TemplateChannel.parseTemplateObject(this._jsonObject, variables);
      mainChannel = new Channel(chKey, jsonData, this.fixture);
    }

    return [mainChannel].concat(mainChannel.fineChannels, mainChannel.switchingChannels).map(
      channel => new MatrixChannel(channel, pixelKey)
    );
  }

  /**
   * Replaces the specified variables in the specified object by cloning the object.
   * @param {!object} obj The object which has to be modified.
   * @param {!object.<string, string>} variables Each variable (without $) pointing to its value.
   * @returns {!object} A copy of the object with replaced variables.
   */
  static parseTemplateObject(obj, variables) {
    return JSON.parse(this.parseTemplateString(JSON.stringify(obj), variables));
  }

  /**
   * Replaces the specified variables in the specified string.
   * @param {!string} str The string which has to be modified.
   * @param {!object.<string, string>} variables Each variable (without $) pointing to its value.
   * @returns {!string} The modified string.
   */
  static parseTemplateString(str, variables) {
    for (const variable of (Object.keys(variables))) {
      str = stringReplaceAll(str, `$${variable}`, variables[variable]);
    }
    return str;
  }
};

/**
 * @param {!string} string The string to operate on.
 * @param {!string} search A string that is to be replaced by replacement. It is treated as a verbatim string and is not interpreted as a regular expression.
 * @param {!string} replacement The string that replaces the substring specified by the specified search parameter.
 * @returns {string} The string with all matches of the search pattern replaced by the replacement.
 */
function stringReplaceAll(string, search, replacement) {
  return string.split(search).join(replacement);
}
