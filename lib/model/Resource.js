/** @ignore @typedef {import('./WheelSlot.js').default} WheelSlot */

/**
 * Information about a resource.
 */
class Resource {
  /**
   * Creates a new Resource instance.
   * @param {Object|null} jsonObject A embedded resource object from the fixture's JSON data.
   * @param {WheelSlot} wheelSlot The wheel slot that this resource belongs to.
   */
  constructor(jsonObject, wheelSlot) {
    this._jsonObject = jsonObject;
    this._wheelSlot = wheelSlot;
    this._cache = {};
  }


  // part of the resource JSON:

  /**
   * @returns {String} The resource's name.
   */
  get name() {
    return this._jsonObject.name;
  }

  /**
   * @returns {Array.<String>} An array of keywords belonging to this resource.
   */
  get keywords() {
    return (this._jsonObject.keywords || ``).split(` `);
  }

  /**
   * @returns {String|null} The source this resource was taken from, or null if it's not specified.
   */
  get source() {
    return this._jsonObject.source || null;
  }


  // added by embedding into the fixture:

  /**
   * @returns {String} The resource key.
   */
  get key() {
    return this._jsonObject.key;
  }

  /**
   * @returns {String} The resource name, i.e. its directory.
   */
  get type() {
    return this._jsonObject.type;
  }

  /**
   * @returns {String|null} The resource alias, as specified in the fixture, or null if the resource was referenced directly.
   */
  get alias() {
    return this._jsonObject.alias || null;
  }

  /**
   * @returns {Boolean} True if this resource has an associated image, false otherwise.
   */
  get hasImage() {
    return `image` in this._jsonObject;
  }

  /**
   * @returns {String} The resource image's file extension.
   */
  get imageExtension() {
    return this._jsonObject.image.extension;
  }

  /**
   * @returns {String} The resource image's MIME type.
   */
  get imageMimeType() {
    return this._jsonObject.image.mimeType;
  }

  /**
   * @returns {String} The resource image data (base64 or utf8 encoded).
   */
  get imageData() {
    return this._jsonObject.image.data;
  }

  /**
   * @returns {'base64'|'utf8'} The resource image's data encoding.
   */
  get imageEncoding() {
    return this._jsonObject.image.encoding;
  }

  /**
   * @returns {String} A data URL containing the resource image.
   */
  get imageDataUrl() {
    if (!(`dataUrl` in this._cache)) {
      let mimeType = this.imageMimeType;

      const imageData = encodeURIComponent(this.imageData)
        .replace(/\(/g, `%28`) // Encode brackets
        .replace(/\)/g, `%29`);

      if (this.imageEncoding === `base64`) {
        mimeType += `;base64`;
      }

      this._cache.dataUrl = `data:${mimeType},${imageData}`;
    }

    return this._cache.dataUrl;
  }
}

export default Resource;
