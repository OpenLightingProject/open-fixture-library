import manufacturers from '../../fixtures/manufacturers.json';

/**
 * A company or brand that produces fixtures. A fixture is associated to exactly one manufacturer.
 */
class Manufacturer {
  /**
   * Creates a new Manufacturer instance.
   * @param {String} key The manufacturer key. Equals to directory name in the fixtures directory.
   * @param {Object|null} jsonObject The manufacturer's JSON object. If omitted, the one from `manufacturers.json` will be used.
   */
  constructor(key, jsonObject) {
    this.key = key;
    this._jsonObject = jsonObject ? jsonObject : manufacturers[key];
  }

  /**
   * @returns {String} The manufacturer's display name. Often used as prefix of fixture names, e.g. "cameo" + "Hydrabeam 100".
   */
  get name() {
    return this._jsonObject.name;
  }

  /**
   * @returns {String} An additional description or explanation, if the name doesn't give enough information. Defaults to an empty string.
   */
  get comment() {
    return this._jsonObject.comment || ``;
  }

  /**
   * @returns {Boolean} Whether this manufacturer has a comment.
   */
  get hasComment() {
    return `comment` in this._jsonObject;
  }

  /**
   * @returns {String|null} An URL pointing to the manufacturer's website (with fixture product pages).
   */
  get website() {
    return this._jsonObject.website || null;
  }

  /**
   * @returns {Number|null} The id associated to this manufacturer in the RDM protocol.
   */
  get rdmId() {
    return this._jsonObject.rdmId || null;
  }
}

export default Manufacturer;
