export default class MatrixChannelReference {
  /**
   * Helper class to store TemplateChannel usages
   * @param {!string} templateKey The key of the used TemplateChannel or the used alias of a TemplateChannel's fine or switching channel
   * @param {!string} pixelKey Key of the pixel to which the channel belongs
   */
  constructor(templateKey, pixelKey) {
    this._templateKey = templateKey;
    this._pixelKey = pixelKey;
  }

  /**
   * @returns {!string} The key of the used TemplateChannel or the used alias of a TemplateChannel's fine or switching channel
   */
  get templateKey() {
    return this._templateKey;
  }

  /**
   * @returns {!string} Key of the pixel to which the channel belongs
   */
  get pixelKey() {
    return this._pixelKey;
  }

  /**
   * @param {!MatrixChannelReference} another The other reference to compare
   * @returns {!boolean} Whether this reference's data equals another reference's data
   */
  equals(another) {
    return this.templateKey === another.templateKey && this.pixelKey === another.pixelKey;
  }
}
