const express = require(`express`);

const api = express.Router();

api.route(`/import-fixture-file`)
  .post(requireNoCacheInDev(`./import-fixture-file.js`));

api.route(`/get-search-results`)
  .post(requireNoCacheInDev(`./get-search-results.js`));

api.route(`/submit-editor`)
  .post(requireNoCacheInDev(`./submit-editor.js`));

api.route(`/submit-feedback`)
  .post(requireNoCacheInDev(`./submit-feedback.js`));

module.exports = api;

/**
 * Like standard require(...), but invalidates cache first (if not in production environment).
 * @param {String} target The require path, like `./register.json`.
 * @returns {*} The result of standard require(target).
 */
function requireNoCacheInDev(target) {
  if (process.env.NODE_ENV !== `production`) {
    delete require.cache[require.resolve(target)];
  }

  return require(target);
}
