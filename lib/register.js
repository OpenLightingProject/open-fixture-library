import ColorHash from 'color-hash';

const colorHash = new (ColorHash.default || ColorHash)({
  lightness: [0.5, 0.6],
  saturation: [0.5, 0.6, 0.7],
  hash: string => [...string].reduce((accumulator, char, index) => {
    return accumulator + ((char.codePointAt() * (index + 1)) ** 2);
  }, 0),
});


/**
 * A data store for the fixture register.
 */
export class Register {
  /**
   * Create a new register instance.
   * @param {object} manufacturers An object of all known manufacturers like specified by the manufacturer schema.
   * @param {object | null} register A register object to start with.
   */
  constructor(manufacturers, register) {
    if (register) {
      this.filesystem = register.filesystem;
      this.manufacturers = register.manufacturers;
      this.categories = register.categories;
      this.contributors = register.contributors;
      this.rdm = register.rdm;
      this.colors = register.colors;
    }
    else {
      this.filesystem = {};
      this.manufacturers = {};
      this.categories = {};
      this.contributors = {};
      this.rdm = {};
      this.colors = {};
    }

    this._manufacturerData = manufacturers;
  }

  /**
   * Add manufacturer information to the register.
   * @param {string} manufacturerKey The manufacturer key.
   * @param {object} manufacturer The manufacturer data like specified by the manufacturer schema.
   */
  addManufacturer(manufacturerKey, manufacturer) {
    if (!(manufacturerKey in this.manufacturers)) {
      this.manufacturers[manufacturerKey] = [];
      this.colors[manufacturerKey] = colorHash.hex(manufacturerKey);
    }

    const rdmId = this._manufacturerData[manufacturerKey].rdmId;
    if (rdmId && !(rdmId in this.rdm)) {
      this.rdm[rdmId] = {
        key: manufacturerKey,
        models: {},
      };
    }
  }

  /**
   * Add fixture redirect information to the register.
   * @param {string} manufacturerKey The manufacturer key.
   * @param {string} fixtureKey The fixture (redirect) key.
   * @param {object} redirectData The redirect data like specified by the fixture redirect schema.
   * @param {object} redirectToData The fixture data of the redirectTo fixture like specified by the fixture schema.
   */
  addFixtureRedirect(manufacturerKey, fixtureKey, redirectData, redirectToData) {
    this.filesystem[`${manufacturerKey}/${fixtureKey}`] = {
      name: redirectData.name,
      redirectTo: redirectData.redirectTo,
      reason: redirectData.reason,
    };

    if (redirectData.reason === `SameAsDifferentBrand`) {
      // add to manufacturer register
      this._addFixtureToManufacturer(manufacturerKey, fixtureKey);

      // add to category register
      for (const category of redirectToData.categories) {
        this._addFixtureToCategory(manufacturerKey, fixtureKey, category);
      }
    }
  }

  /**
   * Add fixture redirect information to the register.
   * @param {string} manufacturerKey The manufacturer key.
   * @param {string} fixtureKey The fixture (redirect) key.
   * @param {object} fixtureData The fixture data like specified by the fixture schema.
   */
  addFixture(manufacturerKey, fixtureKey, fixtureData) {
    const { lastAction, lastActionDate } = getFixtureLastAction(fixtureData.meta);

    // add to filesystem register
    this.filesystem[`${manufacturerKey}/${fixtureKey}`] = {
      name: fixtureData.name,
      lastActionDate,
      lastAction,
    };

    // add to manufacturer register
    this._addFixtureToManufacturer(manufacturerKey, fixtureKey);

    // add to category register
    for (const category of fixtureData.categories) {
      this._addFixtureToCategory(manufacturerKey, fixtureKey, category);
    }

    // add to contributor register
    for (const contributor of fixtureData.meta.authors) {
      this._addFixtureToContributor(manufacturerKey, fixtureKey, contributor, lastActionDate);
    }

    // add to rdm register
    if (`rdm` in fixtureData && `rdmId` in this._manufacturerData[manufacturerKey]) {
      const rdmManufacturerId = this._manufacturerData[manufacturerKey].rdmId;
      const rdmModelId = fixtureData.rdm.modelId;
      this.rdm[rdmManufacturerId].models[rdmModelId] = fixtureKey;
    }
  }

  /**
   * @private
   * @param {string} manufacturerKey The manufacturer key.
   * @param {string} fixtureKey The fixture (redirect) key.
   */
  _addFixtureToManufacturer(manufacturerKey, fixtureKey) {
    if (!(manufacturerKey in this.manufacturers)) {
      this.manufacturers[manufacturerKey] = [];
    }
    this.manufacturers[manufacturerKey].push(fixtureKey);
  }

  /**
   * @private
   * @param {string} manufacturerKey The manufacturer key.
   * @param {string} fixtureKey The fixture (redirect) key.
   * @param {string} category The category to add this fixture to.
   */
  _addFixtureToCategory(manufacturerKey, fixtureKey, category) {
    if (!(category in this.categories)) {
      this.categories[category] = [];
    }
    this.categories[category].push(`${manufacturerKey}/${fixtureKey}`);
  }

  /**
   * @private
   * @param {string} manufacturerKey The manufacturer key.
   * @param {string} fixtureKey The fixture (redirect) key.
   * @param {string} contributor The contributor to add this fixture to.
   * @param {string} lastActionDate The most recent action of the added fixture.
   */
  _addFixtureToContributor(manufacturerKey, fixtureKey, contributor, lastActionDate) {
    if (contributor in this.contributors) {
      this.contributors[contributor].fixtures.push(`${manufacturerKey}/${fixtureKey}`);

      if (lastActionDate > this.contributors[contributor].lastActionDate) {
        this.contributors[contributor].lastActionDate = lastActionDate;
      }
    }
    else {
      this.contributors[contributor] = {
        lastActionDate,
        fixtures: [`${manufacturerKey}/${fixtureKey}`],
      };
    }
  }

  /**
   * @returns {object} The sorted register.
   */
  getAsSortedObject() {
    const sortedRegister = {
      filesystem: getObjectSortedByKeys(this.filesystem),
      manufacturers: getObjectSortedByKeys(this.manufacturers, fixtures => fixtures.sort(localeSort)),
      categories: getObjectSortedByKeys(this.categories, fixtures => fixtures.sort(localeSort)),
      contributors: {},
      rdm: {},
      colors: getObjectSortedByKeys(this.colors),
      lastUpdated: [],
    };

    // copy sorted contributors into register
    const sortedContributors = Object.keys(this.contributors).sort((nameA, nameB) => {
      const lastActionA = this.contributors[nameA].lastActionDate;
      const lastActionB = this.contributors[nameB].lastActionDate;

      // people with more recent contributions should come first
      if (lastActionA !== lastActionB) {
        return lastActionA > lastActionB ? -1 : 1;
      }

      return localeSort(nameA, nameB);
    }).filter(contributor => contributor !== `Anonymous`);
    for (const contributor of sortedContributors) {
      sortedRegister.contributors[contributor] = {
        lastActionDate: this.contributors[contributor].lastActionDate,
        fixtures: this.contributors[contributor].fixtures.sort(localeSort),
      };
    }

    // if the dates are the same, the last action with higher priority
    // (which appears first in this array) is sorted before the other fixture
    const lastActionPriority = [`created`, `imported`, `modified`];

    // add fixture list sorted by lastActionDate
    sortedRegister.lastUpdated = Object.keys(this.filesystem).filter(
      fixtureKey => `lastActionDate` in this.filesystem[fixtureKey],
    ).sort((fixtureKeyA, fixtureKeyB) => {
      const fixtureA = this.filesystem[fixtureKeyA];
      const fixtureB = this.filesystem[fixtureKeyB];

      // most recently edited fixtures should come first
      const dateDelta = new Date(fixtureB.lastActionDate) - new Date(fixtureA.lastActionDate);
      if (dateDelta !== 0) {
        return dateDelta;
      }

      // if date is the same, look at what changed
      const actionDelta = lastActionPriority.indexOf(fixtureA.lastAction) - lastActionPriority.indexOf(fixtureB.lastAction);
      if (actionDelta !== 0) {
        return actionDelta;
      }

      return localeSort(fixtureKeyA, fixtureKeyB);
    });

    // copy sorted RDM data into register
    for (const manufacturerId of Object.keys(this.rdm).sort(localeSort)) {
      sortedRegister.rdm[manufacturerId] = {
        key: this.rdm[manufacturerId].key,
        models: getObjectSortedByKeys(this.rdm[manufacturerId].models),
      };
    }

    return sortedRegister;
  }
}

/**
 * @param {object} object The object to sort.
 * @param {((value: any) => any) | null} itemMapFunction A function to be invoked for every object value to process it (useful to sort array values).
 * @returns {object} A new object with the same entries, sorted by keys.
 */
export function getObjectSortedByKeys(object, itemMapFunction) {
  const sortedObject = {};
  const keys = Object.keys(object).sort(localeSort);

  for (const key of keys) {
    sortedObject[key] = itemMapFunction?.(object[key]) ?? object[key];
  }

  return sortedObject;
}

/**
 * Function to pass into Array.sort().
 * @param {string} a The first string.
 * @param {string} b The second string.
 * @returns {number} A number indicating the order of the two strings.
 */
function localeSort(a, b) {
  return a.localeCompare(b, `en`, {
    numeric: true,
  });
}


/**
 * @param {object} fixtureMeta The fixture's meta object.
 * @returns {object} The fixture's last action and last action data.
 */
function getFixtureLastAction(fixtureMeta) {
  if (`importPlugin` in fixtureMeta && new Date(fixtureMeta.lastModifyDate) <= new Date(fixtureMeta.importPlugin.date)) {
    return {
      lastAction: `imported`,
      lastActionDate: fixtureMeta.importPlugin.date,
    };
  }

  return {
    lastAction: fixtureMeta.lastModifyDate === fixtureMeta.createDate ? `created` : `modified`,
    lastActionDate: fixtureMeta.lastModifyDate,
  };
}
