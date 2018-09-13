import manufacturers from '../../fixtures/manufacturers.json';

/**
 * A company or brand that produces fixtures. A fixture is associated to exactly one manufacturer.
 */
class Manufacturer {
  /**
   * Creates a new Manufacturer instance.
   * @param {!string} key The manufacturer key. Equals to directory name in the fixtures directory.
   */
  constructor(key) {
    this.key = key;
  }

  /**
   * @returns {!string} The manufacturer's display name. Often used as prefix of fixture names, e.g. "cameo" + "Hydrabeam 100".
   */
  get name() {
    return manufacturers[this.key].name;
  }

  /**
   * @returns {!string} An additional description or explanation, if the name doesn't give enough information. Defaults to an empty string.
   */
  get comment() {
    return manufacturers[this.key].comment || ``;
  }

  /**
   * @returns {!string} Whether this manufacturer has a comment.
   */
  get hasComment() {
    return `comment` in manufacturers[this.key];
  }

  /**
   * @returns {?string} An URL pointing to the manufacturer's website (with fixture product pages).
   */
  get website() {
    return manufacturers[this.key].website || null;
  }

  /**
   * @returns {?number} The id associated to this manufacturer in the RDM protocol.
   */
  get rdmId() {
    return manufacturers[this.key].rdmId || null;
  }
}

export default Manufacturer;
