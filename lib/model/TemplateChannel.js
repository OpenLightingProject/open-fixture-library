const Channel = require('./Channel.js');
const MatrixChannel = require('./MatrixChannel.js');
const MatrixChannelReference = require('./MatrixChannelReference.js');

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
   * Returns which template channels should be created with which pixelKeys to create given channel key.
   * @param {!string} chKey The channel key whose original TemplateChannel shall be searched.
   * @returns {!Array.<MatrixChannelReference>} References for each templateKey/pixelKey pair. Empty if channel key can't be created by this TemplateChannel.
   */
  getMatrixChannelReferences(chKey) {
    const pixelKeys = this.fixture.matrix.pixelKeys.concat(this.fixture.matrix.pixelGroupKeys);
    for (const pixelKey of pixelKeys) {
      // is template channel referenced directly?
      const matrixChKey = TemplateChannel.resolveTemplateString(this.key, { pixelKey: pixelKey });
      if (matrixChKey === chKey) {
        return [new MatrixChannelReference(this.key, pixelKey)];
      }

      // is template fine channel alias referenced?
      for (const fineChannelAlias of this.fineChannelAliases) {
        const matrixFineChKey = TemplateChannel.resolveTemplateString(fineChannelAlias, { pixelKey: pixelKey });
        if (matrixFineChKey === chKey) {
          return [new MatrixChannelReference(fineChannelAlias, pixelKey)];
        }
      }

      // is template switching channel alias referenced?
      for (const switchingChannel of this.switchingChannels) {
        const matrixSwitchingChKey = TemplateChannel.resolveTemplateString(switchingChannel.key, { pixelKey: pixelKey });
        if (matrixSwitchingChKey === chKey) {
          return [new MatrixChannelReference(switchingChannel.key, pixelKey)].concat(
            switchingChannel.switchToChannelKeys.map(
              switchToChKey => new MatrixChannelReference(switchToChKey, pixelKey)
            )
          );
        }
      }
    }

    return [];
  }

  /**
   * @returns {!Map.<string, string>} All resolved keys/aliases created in this channel pointing to its pixelKey/pixelGroupKey.
   */
  get possibleResolvedChannelKeys() {
    if (!('possibleResolvedChannelKeys' in this._cache)) {
      const resolvedChKeys = new Map();

      const pixelKeys = this.fixture.matrix.pixelKeys.concat(this.fixture.matrix.pixelGroupKeys);
      const chKeys = [this.key].concat(this.fineChannelAliases, this.switchingChannelAliases);
      for (const pixelKey of pixelKeys) {
        for (const chKey of chKeys) {
          const matrixChKey = TemplateChannel.resolveTemplateString(chKey, { pixelKey: pixelKey });
          resolvedChKeys.set(matrixChKey, pixelKey);
        }
      }

      this._cache.possibleResolvedChannelKeys = resolvedChKeys;
    }

    return this._cache.possibleResolvedChannelKeys;
  }

  /**
   * Creates a matrix channel (together with its fine and switching channels if defined) from this template with the specified pixelKey. If availableChannels override this channel, that existing channel is returned wrapped in a matrix channel.
   * @param {!string} pixelKey The channel's pixelKey or pixelGroupKey.
   * @returns {!Array.<MatrixChannel>} MatrixChannels wrapping the generated channel and its fine and switching channels
   */
  createMatrixChannels(pixelKey) {
    const variables = {
      pixelKey: pixelKey
    };

    const chKey = TemplateChannel.resolveTemplateString(this._key, variables);

    let mainChannel;
    if (this.fixture.availableChannelKeys.includes(chKey)) {
      // use an available channel that overrides the matrix channel with the resolved key
      mainChannel = this.fixture.getAvailableChannelByKey(chKey);
    }
    else {
      // create a new Channel from the resolved channel data
      const jsonData = TemplateChannel.resolveTemplateObject(this._jsonObject, variables);
      mainChannel = new Channel(chKey, jsonData, this.fixture);
    }

    // return the (available or just created) channel along with its fine and switching channels, each wrapped into a MatrixChannel
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
  static resolveTemplateObject(obj, variables) {
    return JSON.parse(TemplateChannel.resolveTemplateString(JSON.stringify(obj), variables));
  }

  /**
   * Replaces the specified variables in the specified string.
   * @param {!string} str The string which has to be modified.
   * @param {!object.<string, string>} variables Each variable (without $) pointing to its value.
   * @returns {!string} The modified string.
   */
  static resolveTemplateString(str, variables) {
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
