#!/usr/bin/node

// see https://github.com/standard-things/esm#getting-started
require = require(`esm`)(module); // eslint-disable-line no-global-assign

const promisify = require(`util`).promisify;
const readFile = promisify(require(`fs`).readFile);
const path = require(`path`);
const express = require(`express`);
const compression = require(`compression`);
const { Nuxt, Builder } = require(`nuxt`);

const redirectToHttps = require(`./ui/express-middleware/redirect-to-https.js`);
const robotsTxtGenerator = require(`./ui/express-middleware/robots-txt.js`);

const packageJson = require(`./package.json`);
const plugins = require(`./plugins/plugins.json`);
const { fixtureFromRepository } = require(`./lib/model.js`);
const register = require(`./fixtures/register.json`);
const getOutObjectFromEditorData = require(`./lib/get-out-object-from-editor-data.js`);
const Fixture = require(`./lib/model/Fixture.mjs`).default;
const Manufacturer = require(`./lib/model/Manufacturer.mjs`).default;


require(`./lib/load-env-file.js`);

const app = express();

// setup port
if (!process.env.PORT) {
  process.env.PORT = 5000;
}
app.set(`port`, process.env.PORT);

// redirect to HTTPS site version if environment forces HTTPS
app.use(redirectToHttps);

// support json encoded bodies
app.use(express.json({ limit: `50mb` }));

// enable compression
app.use(compression({
  threshold: `500B`
}));


// ROUTES

app.get(`/robots.txt`, robotsTxtGenerator);

app.get(`/download.:format([a-z0-9_.-]+)`, (request, response, next) => {
  const { format } = request.params;

  if (!plugins.exportPlugins.includes(format)) {
    next();
    return;
  }

  const fixtures = Object.keys(register.filesystem).filter(
    fixKey => !(`redirectTo` in register.filesystem[fixKey]) || register.filesystem[fixKey].reason === `SameAsDifferentBrand`
  ).map(fixture => {
    const [man, key] = fixture.split(`/`);
    return fixtureFromRepository(man, key);
  });

  downloadFixtures(response, format, fixtures, format, `all fixtures`);
});

app.post(`/download-editor.:format([a-z0-9_.-]+)`, (request, response) => {
  const { format } = request.params;

  if (!plugins.exportPlugins.includes(format)) {
    response
      .status(500)
      .send(`Exporting fixture with ${format} failed: Plugin is not supported.`);

    return;
  }

  const outObject = getOutObjectFromEditorData(request.body.fixtures);
  const fixtures = Object.entries(outObject.fixtures).map(([key, jsonObject]) => {
    const [manKey, fixKey] = key.split(`/`);

    const manufacturer = manKey in outObject.manufacturers
      ? new Manufacturer(manKey, outObject.manufacturers[manKey])
      : manKey;

    return new Fixture(manufacturer, fixKey, jsonObject);
  });

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

app.get(`/:manKey/:fixKey.:format([a-z0-9_.-]+)`, async (request, response, next) => {
  const { manKey, fixKey, format } = request.params;

  if (!(`${manKey}/${fixKey}` in register.filesystem)) {
    next();
    return;
  }

  if (format === `json`) {
    try {
      const data = await readFile(`./fixtures/${manKey}/${fixKey}.json`, `utf8`);
      response.json(JSON.parse(data));
    }
    catch (error) {
      response
        .status(500)
        .send(`Fetching ${manKey}/${fixKey}.json failed: ${error.toString()}`);
    }
    return;
  }

  if (!plugins.exportPlugins.includes(format)) {
    next();
    return;
  }

  const fixtures = [fixtureFromRepository(manKey, fixKey)];
  const zipName = `${manKey}_${fixKey}_${format}`;
  const errorDesc = `fixture ${manKey}/${fixKey}`;

  downloadFixtures(response, format, fixtures, zipName, errorDesc);
});

app.get(`/about/plugins/:plugin([a-z0-9_.-]+).json`, (request, response, next) => {
  const { plugin } = request.params;

  if (!(plugin in plugins.data)) {
    next();
    return;
  }

  response.json(requireNoCacheInDev(`./plugins/${plugin}/plugin.json`));
});

app.get(`/sitemap.xml`, (request, response) => {
  const generateSitemap = requireNoCacheInDev(`./lib/generate-sitemap.js`);

  if (!app.get(`sitemap`) || process.env.NODE_ENV !== `production`) {
    app.set(`sitemap`, generateSitemap(packageJson.homepage));
  }

  response.type(`application/xml`).send(app.get(`sitemap`));
});

app.post(`/ajax/import-fixture-file`, (request, response) => {
  requireNoCacheInDev(`./ui/ajax/import-fixture-file.js`)(request, response);
});

app.post(`/ajax/get-search-results`, (request, response) => {
  requireNoCacheInDev(`./ui/ajax/get-search-results.js`)(request, response);
});

app.post(`/ajax/submit-editor`, (request, response) => {
  requireNoCacheInDev(`./ui/ajax/submit-editor.js`)(request, response);
});

app.post(`/ajax/submit-feedback`, (request, response) => {
  requireNoCacheInDev(`./ui/ajax/submit-feedback.js`)(request, response);
});



// instantiate nuxt.js with the options
const nuxtConfig = require(`./nuxt.config.js`);
nuxtConfig.dev = process.argv[2] === `--dev`;
const nuxt = new Nuxt(nuxtConfig);

// render every remaining route with Nuxt.js
app.use(nuxt.render);

let startNuxt;
if (nuxtConfig.dev) {
  console.log(`Starting dev server with hot reloading...`);
  startNuxt = new Builder(nuxt).build();
}
else {
  // build has been done already
  startNuxt = nuxt.ready();
}

startNuxt.then(listen)
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


/**
 * Listen for incoming web requests on the port specified in process.env.PORT
 */
function listen() {
  app.listen(process.env.PORT, () => {
    console.log(`Node app is running on port`, process.env.PORT);
  });
}

/**
 * Instruct Express to initiate a download of one / multiple exported fixture files.
 * @param {express.Response} response Express Response object
 * @param {string} pluginKey Key of the export plugin to use.
 * @param {array.<Fixture>} fixtures Array of fixtures to export.
 * @param {string} zipName Name of the zip file (if multiple files should be downloaded).
 * @param {string} errorDesc String describing what fixture(s) should have been downloaded.
 * @returns {Promise} A Promise that is resolved when the response is sent.
 */
async function downloadFixtures(response, pluginKey, fixtures, zipName, errorDesc) {
  const plugin = requireNoCacheInDev(path.join(__dirname, `plugins`, pluginKey, `export.js`));

  try {
    const files = await plugin.export(fixtures, {
      baseDir: __dirname,
      date: new Date()
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
      compression: `DEFLATE`
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

/**
 * Like standard require(...), but invalidates cache first (if not in production environment).
 * @param {string} target The require path, like `./register.json`.
 * @returns {*} The result of standard require(target).
 */
function requireNoCacheInDev(target) {
  if (process.env.NODE_ENV !== `production`) {
    delete require.cache[require.resolve(target)];
  }

  return require(target);
}
