#!/usr/bin/node

// see https://github.com/standard-things/esm#getting-started
require = require(`esm`)(module); // eslint-disable-line no-global-assign

const promisify = require(`util`).promisify;
const readFile = promisify(require(`fs`).readFile);
const path = require(`path`);
const express = require(`express`);
const compression = require(`compression`);
const helmet = require(`helmet`);
const { loadNuxt, build } = require(`nuxt`);

const robotsTxtGenerator = require(`./ui/express-middleware/robots-txt.js`);

const packageJson = require(`./package.json`);
const plugins = require(`./plugins/plugins.json`);
const { fixtureFromRepository, embedResourcesIntoFixtureJson } = require(`./lib/model.js`);
const register = require(`./fixtures/register.json`);
const Fixture = require(`./lib/model/Fixture.js`).default;
const Manufacturer = require(`./lib/model/Manufacturer.js`).default;


require(`./lib/load-env-file.js`);

const app = express();

// setup port
if (!process.env.PORT) {
  process.env.PORT = 5000;
}
app.set(`port`, process.env.PORT);

// set various security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false, // set in Nuxt config, so inline scripts are allowed by their SHA hash
  dnsPrefetchControl: true,
  expectCt: false,
  featurePolicy: false,
  frameguard: true,
  hidePoweredBy: true,
  hsts: {
    maxAge: 2 * 365 * 24 * 60 * 60,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: {
    policy: `no-referrer`,
  },
  xssFilter: true,
}));

// support JSON encoded bodies
app.use(express.json({ limit: `50mb` }));

// enable compression
app.use(compression({
  threshold: `500B`,
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
    fixKey => !(`redirectTo` in register.filesystem[fixKey]) || register.filesystem[fixKey].reason === `SameAsDifferentBrand`,
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

  const outObject = request.body;
  const fixtures = Object.entries(outObject.fixtures).map(([key, jsonObject]) => {
    const [manKey, fixKey] = key.split(`/`);

    const manufacturer = manKey in outObject.manufacturers
      ? new Manufacturer(manKey, outObject.manufacturers[manKey])
      : manKey;

    embedResourcesIntoFixtureJson(jsonObject);

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
      const json = JSON.parse(data);
      embedResourcesIntoFixtureJson(json);
      response.json(json);
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

app.get(`/sitemap.xml`, (request, response) => {
  const generateSitemap = requireNoCacheInDev(`./lib/generate-sitemap.js`);

  response.type(`application/xml`);
  generateSitemap(packageJson.homepage).pipe(response);
});

app.use(`/api/v1`, (request, response) => {
  requireNoCacheInDev(`./ui/api/index.js`)(request, response);
});



// instantiate nuxt.js with the options
const isDev = process.argv[2] === `--dev`;
loadNuxt(isDev ? `dev` : `start`).then(async nuxt => {
  if (isDev) {
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
  const plugin = requireNoCacheInDev(path.join(__dirname, `plugins`, pluginKey, `export.js`));

  try {
    const files = await plugin.export(fixtures, {
      baseDir: __dirname,
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
