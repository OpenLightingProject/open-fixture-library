module.exports = {
  ...require(`./routes/get-search-results.js`),
  ...require(`./routes/submit-feedback.js`),
  ...require(`./routes/fixtures/from-editor.js`),
  ...require(`./routes/fixtures/import.js`),
  ...require(`./routes/fixtures/submit.js`),
  ...require(`./routes/manufacturers/index.js`),
  ...require(`./routes/manufacturers/_manufacturerKey.js`),
  ...require(`./routes/plugins/index.js`),
  ...require(`./routes/plugins/_pluginKey.js`),
};
