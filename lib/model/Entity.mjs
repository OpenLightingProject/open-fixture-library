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
  'open': 100,
  'small': 1,
  'big': 100
};

const unitConversions = {
  ms: {
    baseUnit: `s`,
    factor: 1000
  },
  bpm: {
    baseUnit: `Hz`,
    factor: 1 / 60
  },
  rpm: {
    baseUnit: `Hz`,
    factor: 1 / 60
  }
};

/** A physical entity with numerical value and unit information. */
export default class Entity {
  /**
   * Creates a new Entity instance.
   * @param {!number} number The numerical value.
   * @param {!string} unit The unit symbol, e.g. 'Hz'. Must be the same as in the schema.
   * @param {?string} keyword The keyword if defined using a keyword. Optional.
   */
  constructor(number, unit, keyword = null) {
    this._number = number;
    this._unit = unit;
    this._keyword = keyword;
    this._cache = {};
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
   * @returns {!Entity} An entity of the same value, but scaled to the base unit. Returns the entity itself if it's already in the base unit.
   */
  getBaseUnitEntity() {
    if (!(`baseUnitEntity` in this._cache)) {
      if (Object.keys(unitConversions).includes(this.unit)) {
        const { baseUnit, factor } = unitConversions[this.unit];
        this._cache.baseUnitEntity = new Entity(this.number * factor, baseUnit, this.keyword);
      }
      else {
        this._cache.baseUnitEntity = this;
      }
    }

    return this._cache.baseUnitEntity;
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

  /**
   * @param {!string} entityString The string for a single entity value from the JSON data. May also be a keyword.
   * @returns {!Entity} A new entity from the given string.
   * @throws {Error} If the entity string is invalid.
   */
  static createFromEntityString(entityString) {
    if (entityString in KEYWORDS) {
      return new Entity(KEYWORDS[entityString], `%`, entityString);
    }

    try {
      const [, numberString, unitString] = /^([-0-9.]+)(.*)$/.exec(entityString);
      return new Entity(parseFloat(numberString), unitString);
    }
    catch (e) {
      throw Error(`'${entityString}' is not a valid entity string.`);
    }
  }
}
