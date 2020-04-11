const express = require(`express`);

const api = express.Router();

api.route(`/get-search-results`)
  .post(requireNoCacheInDev(`./routes/get-search-results.js`));

api.route(`/submit-feedback`)
  .post(requireNoCacheInDev(`./routes/submit-feedback.js`));

api.route(`/fixtures/from-editor`)
  .post(requireNoCacheInDev(`./routes/fixtures/from-editor.js`));

api.route(`/fixtures/import`)
  .post(requireNoCacheInDev(`./routes/fixtures/import.js`));

api.route(`/fixtures/submit`)
  .post(requireNoCacheInDev(`./routes/fixtures/submit.js`));

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
