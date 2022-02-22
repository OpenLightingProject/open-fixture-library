// needed for VS Code to import typedefs from this file
export default null;

/**
 * @typedef {object} FixtureCreateResult
 * @property {Record<string, object>} manufacturers Manufacturer keys pointing to manufacturer JSON objects.
 * @property {Record<string, object>} fixtures 'manufacturerKey/fixtureKey' combinations pointing to fixture JSON objects.
 * @property {Record<string, string[]>} warnings 'manufacturerKey/fixtureKey' combinations pointing to fixture's warnings.
 * @property {Record<string, string[]>} errors 'manufacturerKey/fixtureKey' combinations pointing to fixture's errors.
 */
