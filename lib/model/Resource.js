import cacheResult from '../cache-result.js';

/**
 * Information about a resource.
 */
class Resource {
  /**
   * Creates a new Resource instance.
   * @param {Object} jsonObject An embedded resource object from the fixture's JSON data.
   */
  constructor(jsonObject) {
    this._jsonObject = jsonObject;
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
   * @returns {String|null} The resource image's file extension, or null if there is no image.
   */
  get imageExtension() {
    return this.hasImage ? this._jsonObject.image.extension : null;
  }

  /**
   * @returns {String|null} The resource image's MIME type, or null if there is no image.
   */
  get imageMimeType() {
    return this.hasImage ? this._jsonObject.image.mimeType : null;
  }

  /**
   * @returns {String|null} The resource image data (base64 or utf8 encoded), or null if there is no image.
   */
  get imageData() {
    return this.hasImage ? this._jsonObject.image.data : null;
  }

  /**
   * @returns {'base64'|'utf8'|null} The resource image's data encoding, or null if there is no image.
   */
  get imageEncoding() {
    return this.hasImage ? this._jsonObject.image.encoding : null;
  }

  /**
   * @returns {String|null} A data URL containing the resource image, or null if there is no image.
   */
  get imageDataUrl() {
    if (!this.hasImage) {
      return cacheResult(this, `imageDataUrl`, null);
    }

    let mimeType = this.imageMimeType;

    const imageData = encodeURIComponent(this.imageData)
      .replace(/\(/g, `%28`) // Encode brackets
      .replace(/\)/g, `%29`);

    if (this.imageEncoding === `base64`) {
      mimeType += `;base64`;
    }

    return cacheResult(this, `imageDataUrl`, `data:${mimeType},${imageData}`);
  }
}

export default Resource;
