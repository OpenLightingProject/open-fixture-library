module.exports = class Meta {
  constructor(jsonObject) {
    this.jsonObject = jsonObject; // calls the setter
  }

  set jsonObject(jsonObject) {
    this._jsonObject = jsonObject;
  }

  get authors() {
    return this._jsonObject.authors; // required
  }

  get createDate() {
    return new Date(this._jsonObject.createDate); // required
  }

  get lastModifyDate() {
    return new Date(this._jsonObject.lastModifyDate); // required
  }

  get importPlugin() {
    return 'importPlugin' in this._jsonObject ? this._jsonObject.importPlugin.plugin : null;
  }

  get importDate() {
    return 'importPlugin' in this._jsonObject ? new Date(this._jsonObject.importPlugin.date) : null;
  }

  get importComment() {
    return 'importPlugin' in this._jsonObject ? this._jsonObject.importPlugin.comment || '' : null;
  }

  get hasImportComment() {
    return this.importPlugin !== null && 'comment' in this._jsonObject.importPlugin;
  }
}