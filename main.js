#!/usr/bin/node

// see https://github.com/standard-things/esm#getting-started
require = require(`esm`)(module); // eslint-disable-line no-global-assign

const path = require(`path`);
const express = require(`express`);
const compression = require(`compression`);
const helmet = require(`helmet`);
const { loadNuxt, build } = require(`nuxt`);

const { fixtureFromRepository, embedResourcesIntoFixtureJson } = require(`./lib/model.js`);
const importJson = require(`./lib/import-json.js`);
const Fixture = require(`./lib/model/Fixture.js`).default;
const Manufacturer = require(`./lib/model/Manufacturer.js`).default;

const pluginsPromise = importJson(`./plugins/plugins.json`, __dirname);
const registerPromise = importJson(`./fixtures/register.json`, __dirname);

// setup environment variables
require(`./lib/load-env-file.js`);
process.env.PORT = process.env.PORT || 5000;
process.env.WEBSITE_URL = process.env.WEBSITE_URL || `http://localhost:${process.env.PORT}/`;

const app = express();

// set various security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false, // set in Nuxt config, so inline scripts are allowed by their SHA hash
  expectCt: false,
  hsts: {
    maxAge: 2 * 365 * 24 * 60 * 60,
    preload: true,
  },
}));

// support JSON encoded bodies
app.use(express.json({ limit: `50mb` }));

// enable compression
app.use(compression({
  threshold: `500B`,
}));


// ROUTES

app.get(`/download.:format([a-z0-9_.-]+)`, async (request, response, next) => {
  const { format } = request.params;

  const plugins = await pluginsPromise;
  if (!plugins.exportPlugins.includes(format)) {
    next();
    return;
  }

  const register = await registerPromise;
  const fixtures = await Promise.all(
    Object.keys(register.filesystem).filter(
      fixtureKey => !(`redirectTo` in register.filesystem[fixtureKey]) || register.filesystem[fixtureKey].reason === `SameAsDifferentBrand`,
    ).map(fixture => {
      const [manufacturer, key] = fixture.split(`/`);
      return fixtureFromRepository(manufacturer, key);
    }),
  );

  downloadFixtures(response, format, fixtures, format, `all fixtures`);
});

app.post(`/download-editor.:format([a-z0-9_.-]+)`, async (request, response) => {
  const { format } = request.params;

  const plugins = await pluginsPromise;
  if (!plugins.exportPlugins.includes(format)) {
    response
      .status(500)
      .send(`Exporting fixture with ${format} failed: Plugin is not supported.`);

    return;
  }

  const outObject = request.body;
  const fixtures = await Promise.all(Object.entries(outObject.fixtures).map(async ([key, jsonObject]) => {
    const [manufacturerKey, fixtureKey] = key.split(`/`);

    const manufacturer = manufacturerKey in outObject.manufacturers
      ? new Manufacturer(manufacturerKey, outObject.manufacturers[manufacturerKey])
      : manufacturerKey;

    await embedResourcesIntoFixtureJson(jsonObject);

    return new Fixture(manufacturer, fixtureKey, jsonObject);
  }));

  let zipName;
  let errorDesc;
  if (fixtures.length === 1) {
    zipName = `${fixtures[0].manufacturer.key}_${fixtures[0].key}_${format}`;
    errorDesc = `fixture ${fixtures[0].manufacturer.key}/${fixtures[0].key}`;
  }
  else {
    zipName = format;
    errorDesc = `${fixtures.length} fixtures`;
  }

  downloadFixtures(response, format, fixtures, zipName, errorDesc);
});

app.get(`/:manufacturerKey/:fixtureKey.:format([a-z0-9_.-]+)`, async (request, response, next) => {
  const { manufacturerKey, fixtureKey, format } = request.params;

  const register = await registerPromise;
  if (!(`${manufacturerKey}/${fixtureKey}` in register.filesystem)) {
    next();
    return;
  }

  if (format === `json`) {
    try {
      const json = await importJson(`./fixtures/${manufacturerKey}/${fixtureKey}.json`, __dirname);
      await embedResourcesIntoFixtureJson(json);
      response.json(json);
    }
    catch (error) {
      response
        .status(500)
        .send(`Fetching ${manufacturerKey}/${fixtureKey}.json failed: ${error.toString()}`);
    }
    return;
  }

  const plugins = await pluginsPromise;
  if (!plugins.exportPlugins.includes(format)) {
    next();
    return;
  }

  const fixtures = [await fixtureFromRepository(manufacturerKey, fixtureKey)];
  const zipName = `${manufacturerKey}_${fixtureKey}_${format}`;
  const errorDesc = `fixture ${manufacturerKey}/${fixtureKey}`;

  downloadFixtures(response, format, fixtures, zipName, errorDesc);
});

app.use(`/api/v1`, (request, response) => {
  require(`./ui/api/index.js`)(request, response);
});



// instantiate nuxt.js with the options
const isDevelopment = process.argv[2] === `--dev`;
loadNuxt(isDevelopment ? `dev` : `start`).then(async nuxt => {
  if (isDevelopment) {
    console.log(`Starting dev server with hot reloading...`);
    await build(nuxt);
  }

  // render every remaining route with Nuxt.js
  app.use(nuxt.render);

  console.log(`Nuxt.js is ready.`);
}).catch(error => {
  console.error(error);
  process.exit(1);
});

app.listen(process.env.PORT, () => {
  console.log(`Node app is running on port`, process.env.PORT);
});

/**
 * Instruct Express to initiate a download of one / multiple exported fixture files.
 * @param {express.Response} response Express Response object
 * @param {String} pluginKey Key of the export plugin to use.
 * @param {Array.<Fixture>} fixtures Array of fixtures to export.
 * @param {String} zipName Name of the zip file (if multiple files should be downloaded).
 * @param {String} errorDesc String describing what fixture(s) should have been downloaded.
 * @returns {Promise} A Promise that is resolved when the response is sent.
 */
async function downloadFixtures(response, pluginKey, fixtures, zipName, errorDesc) {
  const plugin = require(path.join(__dirname, `plugins`, pluginKey, `export.js`));

  try {
    const files = await plugin.exportFixtures(fixtures, {
      baseDirectory: __dirname,
      date: new Date(),
    });

    if (files.length === 1) {
      response
        .status(200)
        .attachment(files[0].name)
        .type(files[0].mimetype)
        .send(Buffer.from(files[0].content));
      return;
    }

    // else zip all together
    const JSZip = require(`jszip`);
    const archive = new JSZip();
    for (const file of files) {
      archive.file(file.name, file.content);
    }

    const zipBuffer = await archive.generateAsync({
      type: `nodebuffer`,
      compression: `DEFLATE`,
    });
    response.status(200)
      .attachment(`ofl_export_${zipName}.zip`)
      .type(`application/zip`)
      .send(zipBuffer);
  }
  catch (error) {
    response
      .status(500)
      .send(`Exporting ${errorDesc} with ${pluginKey} failed: ${error.toString()}`);
  }
}
