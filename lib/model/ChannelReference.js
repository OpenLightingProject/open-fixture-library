const TemplateChannel = require('./TemplateChannel.js');

/**
 * A class representing the reference from a mode's channel list to a specific channel.
 */
module.exports = class ChannelReference {
  /**
   * Creates a new ChannelReference instance.
   * @param {?string} [chKey=null] The channel's key (with resolved variables), may be null for null channels.
   * @param {?string} [templateKey=null] 
   * @param {?string} [pixelKey=null]
   */
  constructor(chKey=null, templateKey=null, pixelKey=null) {
    this.chKey = chKey;
    this.templateKey = templateKey;
    this.pixelKey = pixelKey;
  }

  /**
   * @return {!boolean} Whether this channel has a pixelKey and therefore is a matrix channel or not.
   */
  get isMatrixChannel() {
    return this.pixelKey !== null;
  }

  /**
   * Creates a ChannelReference instance out of the specified channel key. It automatically detects if this is a resolved matrix channel.
   * @param {!string} chKey The channel key from which to create a channel reference.
   * @param {!fixture} fixture The channel's fixture in order to access its template channels.
   */
  static fromChannelKey(chKey, fixture) {
    for (const templateChannel of fixture.templateChannels) {
      if (templateChannel.matrixChannelKeys.has(chKey)) {
        return new this(
          chKey,
          templateChannel.key,
          templateChannel.matrixChannelKeys.get(chKey)
        );
      }
    }
    return new this(chKey);
  }

  /**
   * Creates a ChannelReference instance for the specified matrix channel.
   * @param {!string} templateKey The template channel's key.
   * @param {!string} pixelKey The pixelKey or pixelGroupKey of this channel.
   */
  static fromMatrixReference(templateKey, pixelKey) {
    return new this(
      templateKey === null ? null : TemplateChannel.parseTemplateString(templateKey, {pixelKey: pixelKey}),
      templateKey,
      pixelKey
    )
  }

  /**
   * Resolves the given matrix channel insert.
   * @param {!object} matrixInsert The matrix channel reference specified in the mode's json channel list.
   * @param {'matrixChannels'} matrixInsert.insert Indicates that this is a matrix insert.
   * @param {'eachPixel'|'eachPixelGroup'|string[]} matrixInsert.repeatFor The pixelKeys or pixelGroupKeys for which the specified channels should be repeated.
   * @param {'perPixel'|'perChannel'} matrixInsert.channelOrder Order the channels like RGB1/RGB2/RGB3 or R123/G123/B123.
   * @param {!Array.<string, null>} matrixInsert.templateChannels The template channel keys (and aliases) or null channels to be repeated.
   * @param {!fixture} fixture The channel's fixture in order to access its matrix data.
   * @return {!ChannelReference[]} References to all created matrix channels.
   */
  static fromMatrixInsert(matrixInsert, fixture) {
    let pixelKeys = matrixInsert.repeatFor;
    if (matrixInsert.repeatFor === 'eachPixel') {
      pixelKeys = Object.keys(fixture.matrix.pixelKeyPositions);
    }
    else if (matrixInsert.repeatFor === 'eachPixelGroup') {
      pixelKeys = fixture.matrix.pixelGroupKeys;
    }

    let channels = [];
    if (matrixInsert.channelOrder === 'perPixel') {
      // for each pixel
      for (const pixelKey of pixelKeys) {
        // add chReference for each templateChannel
        channels = channels.concat(matrixInsert.templateChannels.map(
          templateChannelKey => ChannelReference.fromMatrixReference(templateChannelKey, pixelKey)
        ));
      }
    }
    else {
      // for each templateChannel
      for (const templateChannelKey of matrixInsert.templateChannels) {
        // add chReference for each pixel
        channels = channels.concat(pixelKeys.map(
          pixelKey => ChannelReference.fromMatrixReference(templateChannelKey, pixelKey)
        ));
      }
    }

    return channels;
  }
};