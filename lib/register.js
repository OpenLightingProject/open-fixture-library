/**
 * A data store for the fixture register.
 */
class Register {
  /**
   * Create a new register instance.
   * @param {object} manufacturers An object of all known manufacturers like specified by the manufacturer schema.
   * @param {object|null} register A register object to start with.
   */
  constructor(manufacturers, register) {
    if (register) {
      this.filesystem = register.filesystem;
      this.manufacturers = register.manufacturers;
      this.categories = register.categories;
      this.contributors = register.contributors;
      this.rdm = register.rdm;
    }
    else {
      this.filesystem = {};
      this.manufacturers = {};
      this.categories = {};
      this.contributors = {};
      this.rdm = {};
    }

    this._manufacturerData = manufacturers;
  }

  /**
   * Add manufacturer information to the register.
   * @param {string} manKey The manufacturer key.
   * @param {object} manufacturer The manufacturer data like specified by the manufacturer schema.
   */
  addManufacturer(manKey, manufacturer) {
    if (!(manKey in this.manufacturers)) {
      this.manufacturers[manKey] = [];
    }

    const rdmId = this._manufacturerData[manKey].rdmId;
    if (rdmId && !(rdmId in this.rdm)) {
      this.rdm[rdmId] = {
        key: manKey,
        models: {}
      };
    }
  }

  /**
   * Add fixture redirect information to the register.
   * @param {string} manKey The manufacturer key.
   * @param {string} fixKey The fixture (redirect) key.
   * @param {object} redirectData The redirect data like specified by the fixture redirect schema.
   * @param {object} redirectToData The fixture data of the redirectTo fixture like specified by the fixture schema.
   */
  addFixtureRedirect(manKey, fixKey, redirectData, redirectToData) {
    this.filesystem[`${manKey}/${fixKey}`] = {
      name: redirectData.name,
      redirectTo: redirectData.redirectTo,
      reason: redirectData.reason
    };

    if (redirectData.reason === `SameAsDifferentBrand`) {
      // add to manufacturer register
      this._addFixtureToManufacturer(manKey, fixKey);

      // add to category register
      redirectToData.categories.forEach(category => {
        this._addFixtureToCategory(manKey, fixKey, category);
      });
    }
  }

  /**
   * Add fixture redirect information to the register.
   * @param {string} manKey The manufacturer key.
   * @param {string} fixKey The fixture (redirect) key.
   * @param {object} fixData The fixture data like specified by the fixture schema.
   */
  addFixture(manKey, fixKey, fixData) {
    let lastAction = `modified`;
    let lastActionDate = fixData.meta.lastModifyDate;
    if (fixData.meta.lastModifyDate === fixData.meta.createDate) {
      lastAction = `created`;
    }
    else if (`importPlugin` in fixData.meta && new Date(fixData.meta.lastModifyDate) <= new Date(fixData.meta.importPlugin.date)) {
      lastAction = `imported`;
      lastActionDate = fixData.meta.importPlugin.date;
    }

    // add to filesystem register
    this.filesystem[`${manKey}/${fixKey}`] = {
      name: fixData.name,
      lastActionDate,
      lastAction
    };

    // add to manufacturer register
    this._addFixtureToManufacturer(manKey, fixKey);

    // add to category register
    fixData.categories.forEach(category => {
      this._addFixtureToCategory(manKey, fixKey, category);
    });

    // add to contributor register
    fixData.meta.authors.forEach(contributor => {
      this._addFixtureToContributor(manKey, fixKey, contributor);
    });

    // add to rdm register
    if (`rdm` in fixData && `rdmId` in this._manufacturerData[manKey]) {
      const rdmManufacturerId = this._manufacturerData[manKey].rdmId;
      const rdmModelId = fixData.rdm.modelId;
      this.rdm[rdmManufacturerId].models[rdmModelId] = fixKey;
    }
  }

  /**
   * @private
   * @param {string} manKey The manufacturer key.
   * @param {string} fixKey The fixture (redirect) key.
   */
  _addFixtureToManufacturer(manKey, fixKey) {
    if (!(manKey in this.manufacturers)) {
      this.manufacturers[manKey] = [];
    }
    this.manufacturers[manKey].push(fixKey);
  }

  /**
   * @private
   * @param {string} manKey The manufacturer key.
   * @param {string} fixKey The fixture (redirect) key.
   * @param {string} category The category to add this fixture to.
   */
  _addFixtureToCategory(manKey, fixKey, category) {
    if (!(category in this.categories)) {
      this.categories[category] = [];
    }
    this.categories[category].push(`${manKey}/${fixKey}`);
  }

  /**
   * @private
   * @param {string} manKey The manufacturer key.
   * @param {string} fixKey The fixture (redirect) key.
   * @param {string} contributor The contributor to add this fixture to.
   */
  _addFixtureToContributor(manKey, fixKey, contributor) {
    if (!(contributor in this.contributors)) {
      this.contributors[contributor] = [];
    }
    this.contributors[contributor].push(`${manKey}/${fixKey}`);
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
      lastUpdated: []
    };

    // copy sorted contributors into register
    const sortedContributors = Object.keys(this.contributors).sort((nameA, nameB) => {
      const fixturesA = this.contributors[nameA];
      const fixturesB = this.contributors[nameB];

      // people with more contributions should come first
      const fixturesDelta = fixturesB.length - fixturesA.length;
      if (fixturesDelta !== 0) {
        return fixturesDelta;
      }

      return localeSort(nameA, nameB);
    });
    sortedContributors.forEach(contributor => {
      sortedRegister.contributors[contributor] = this.contributors[contributor].sort(localeSort);
    });

    // if the dates are the same, the last action with higher priority
    // (which appears first in this array) is sorted before the other fixture
    const lastActionPriority = [`created`, `imported`, `modified`];

    // add fixture list sorted by lastActionDate
    sortedRegister.lastUpdated = Object.keys(this.filesystem).filter(
      fixKey => `lastActionDate` in this.filesystem[fixKey]
    ).sort((fixKeyA, fixKeyB) => {
      const fixA = this.filesystem[fixKeyA];
      const fixB = this.filesystem[fixKeyB];

      // most recently edited fixtures should come first
      const dateDelta = new Date(fixB.lastActionDate) - new Date(fixA.lastActionDate);
      if (dateDelta !== 0) {
        return dateDelta;
      }

      // if date is the same, look at what changed
      const actionDelta = lastActionPriority.indexOf(fixA.lastAction) - lastActionPriority.indexOf(fixB.lastAction);
      if (actionDelta !== 0) {
        return actionDelta;
      }

      return localeSort(fixKeyA, fixKeyB);
    });

    // copy sorted RDM data into register
    for (const manId of Object.keys(this.rdm).sort(localeSort)) {
      sortedRegister.rdm[manId] = {
        key: this.rdm[manId].key,
        models: getObjectSortedByKeys(this.rdm[manId].models)
      };
    }

    return sortedRegister;
  }
}

/**
 * @callback ItemMapFunction
 * @param {*} value
 * @returns {*}
 */

/**
 * @param {object} obj The object to sort.
 * @param {ItemMapFunction|null} itemMapFunction A function to be invoked for every object value to process it (useful to sort array values).
 * @returns {object} A new object with the same entries, sorted by keys.
 */
function getObjectSortedByKeys(obj, itemMapFunction) {
  const sortedObj = {};
  const keys = Object.keys(obj).sort(localeSort);

  for (const key of keys) {
    if (itemMapFunction) {
      sortedObj[key] = itemMapFunction(obj[key]);
    }
    else {
      sortedObj[key] = obj[key];
    }
  }

  return sortedObj;
}

/**
 * Function to pass into Array.sort().
 * @param {string} a The first string.
 * @param {string} b The second string.
 * @returns {number} A number indicating the order of the two strings.
 */
function localeSort(a, b) {
  return a.localeCompare(b, `en`, {
    numeric: true
  });
}

module.exports = {
  Register,
  getObjectSortedByKeys
};
