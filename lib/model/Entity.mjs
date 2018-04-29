const KEYWORDS = {
  'fast reverse': -100,
  'slow reverse': -1,
  'stop': 0,
  'slow': 1,
  'fast': 100,
  'fast CCW': -100,
  'slow CCW': -1,
  'slow CW': 1,
  'fast CW': 100,
  'instant': 0,
  'short': 1,
  'long': 100,
  'near': 1,
  'far': 100,
  'off': 0,
  'dark': 1,
  'bright': 100,
  'warm': -100,
  'CTO': -100,
  'default': 0,
  'cold': 100,
  'CTB': 100,
  'weak': 1,
  'strong': 100,
  'closed': 0,
  'narrow': 1,
  'wide': 100,
  'low': 1,
  'high': 100,
  'out': 0,
  'in': 100,
  'open': 100
};

/** A physical entity with numerical value and unit information. */
export default class Entity {
  /**
   * Creates a new Entity instance.
   * @param {!string} entityString The string for a single entity value from the JSON data. May also be a keyword.
   */
  constructor(entityString) {
    if (entityString in KEYWORDS) {
      this._number = KEYWORDS[entityString];
      this._unit = `%`;
      this._keyword = entityString;
    }
    else {
      try {
        const [, numberString, unitString] = /^([-0-9.]+)(.*)$/.exec(entityString);
        this._number = parseFloat(numberString);
        this._unit = unitString;
      }
      catch (e) {
        throw Error(`'${entityString}' is not a valid entity string.`);
      }
    }
  }

  /**
   * @returns {!number} The numerical value of this entity.
   */
  get number() {
    return this._number;
  }

  /**
   * @returns {!string} The unit symbol, like "Hz" or "%".
   */
  get unit() {
    return this._unit;
  }

  /**
   * @returns {?string} The used keyword, or null if no keyword was used.
   */
  get keyword() {
    return this._keyword || null;
  }

  /**
   * Used to allow comparing like `entity1 < entity2`
   * @returns {!number} The numerical value of this entity.
   */
  valueOf() {
    return this.number;
  }

  /**
   * @param {!Entity} anotherEntity Another Entity instance to compare with.
   * @returns {!boolean} Whether this entity exactly equals the given one.
   */
  equals(anotherEntity) {
    return (
      this.number === anotherEntity.number &&
      this.unit === anotherEntity.unit &&
      this.keyword === anotherEntity.keyword
    );
  }
}
