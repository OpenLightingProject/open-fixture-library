const getOutObjectFromEditorData = require(`../../../lib/get-out-object-from-editor-data.js`);

/**
 * @typedef {Array.<Object>} RequestBody Array of fixture objects used in the Fixture Editor.
 */

/**
 * Converts the given editor fixture data into OFL fixtures and responds with a FixtureCreateResult.
 * @param {Object} request Passed from Express.
 * @param {RequestBody} request.body The editor's fixture objects.
 * @param {Object} response Passed from Express.
 */
module.exports = function createFixtureFromEditor(request, response) {
  try {
    const fixtureCreateResult = getOutObjectFromEditorData(request.body);
    response.status(201).json(fixtureCreateResult);
  }
  catch (error) {
    response.status(400).json({
      error: error.message
    });
  }
};
