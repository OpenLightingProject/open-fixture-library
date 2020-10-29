// needed for VS Code to import typedefs from this file
module.exports = null;

/**
 * @typedef {Object} FixtureCreateResult
 * @property {Object.<String, Object>} manufacturers Manufacturer keys pointing to manufacturer JSON objects.
 * @property {Object.<String, Object>} fixtures 'manufacturerKey/fixKey' combinations pointing to fixture JSON objects.
 * @property {Object.<String, Array.<String>>} warnings 'manufacturerKey/fixKey' combinations pointing to fixture's warnings.
 * @property {Object.<String, Array.<String>>} errors 'manufacturerKey/fixKey' combinations pointing to fixture's errors.
 */
