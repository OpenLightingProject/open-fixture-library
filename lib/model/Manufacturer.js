/**
 * A company or brand that produces fixtures. A fixture is associated to exactly one manufacturer.
 */
class Manufacturer {
  /**
   * Creates a new Manufacturer instance.
   * @param {string} key The manufacturer key. Equals to directory name in the fixtures directory.
   * @param {object} jsonObject The manufacturer's JSON object.
   */
  constructor(key, jsonObject) {
    this.key = key;
    this._jsonObject = jsonObject;
  }

  /**
   * @returns {string} The manufacturer's display name. Often used as prefix of fixture names, e.g. "cameo" + "Hydrabeam 100".
   */
  get name() {
    return this._jsonObject.name;
  }

  /**
   * @returns {string} An additional description or explanation, if the name doesn't give enough information. Defaults to an empty string.
   */
  get comment() {
    return this._jsonObject.comment || ``;
  }

  /**
   * @returns {boolean} Whether this manufacturer has a comment.
   */
  get hasComment() {
    return `comment` in this._jsonObject;
  }

  /**
   * @returns {string | null} An URL pointing to the manufacturer's website (with fixture product pages).
   */
  get website() {
    return this._jsonObject.website || null;
  }

  /**
   * @returns {number | null} The id associated to this manufacturer in the RDM protocol.
   */
  get rdmId() {
    return this._jsonObject.rdmId || null;
  }
}

export default Manufacturer;
