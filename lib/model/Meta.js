/**
 * Information about a fixture's author and history.
 */
class Meta {
  /**
   * Creates a new Meta instance.
   * @param {object} jsonObject A meta object from the fixture's JSON data.
   */
  constructor(jsonObject) {
    this._jsonObject = jsonObject;
  }

  /**
   * @returns {string[]} Names of people who contributed to this fixture.
   */
  get authors() {
    return this._jsonObject.authors;
  }

  /**
   * @returns {Date} When this fixture was created. Might not refer to the creation in OFL, but in the lighting software from which this fixture was imported.
   */
  get createDate() {
    return new Date(this._jsonObject.createDate);
  }

  /**
   * @returns {Date} When this fixture was changed the last time. Might not refer to a modification in OFL, but in the lighting software from which this fixture was imported.
   */
  get lastModifyDate() {
    return new Date(this._jsonObject.lastModifyDate);
  }

  /**
   * @returns {string | null} The key of the plugin with which this fixture was imported. Null if it's not imported.
   */
  get importPlugin() {
    return `importPlugin` in this._jsonObject ? this._jsonObject.importPlugin.plugin : null;
  }

  /**
   * @returns {string | null} When this fixture was imported. Null if it's not imported.
   */
  get importDate() {
    return `importPlugin` in this._jsonObject ? new Date(this._jsonObject.importPlugin.date) : null;
  }

  /**
   * @returns {string | null} A comment further describing the import process. Null if it's not imported.
   */
  get importComment() {
    return `importPlugin` in this._jsonObject ? (this._jsonObject.importPlugin.comment || ``) : null;
  }

  /**
   * @returns {string | null} Whether there is an import comment. Always false if it's not imported.
   */
  get hasImportComment() {
    return this.importPlugin !== null && `comment` in this._jsonObject.importPlugin;
  }
}

export default Meta;
