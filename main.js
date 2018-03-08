#!/usr/bin/node

const express = require(`express`);
const compression = require(`compression`);
const { Nuxt, Builder } = require(`nuxt`);
const url = require(`url`);

const redirectToHttps = require(`./views/middleware/redirect-to-https.js`);

const plugins = require(`./plugins/plugins.js`);
const { fixtureFromRepository } = require(`./lib/model.js`);
const register = require(`./fixtures/register.json`);

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
app.use(express.json());

// enable compression
app.use(compression({
  threshold: `500B`
}));


// ROUTES

app.get(`/download.:format`, (request, response, next) => {
  const { format } = request.params;

  if (!(format in plugins.export)) {
    next();
    return;
  }

  const fixtures = Object.keys(register.filesystem).map(fixture => {
    const [man, key] = fixture.split(`/`);
    return fixtureFromRepository(man, key);
  });
  const outfiles = plugins.export[format].export(fixtures, {
    baseDir: __dirname
  });

  downloadFiles(response, outfiles, format);
});

app.get(`/:manKey/:fixKey.:format`, (request, response, next) => {
  const { manKey, fixKey, format } = request.params;

  if (!(`${manKey}/${fixKey}` in register.filesystem)) {
    next();
    return;
  }

  if (format === `json`) {
    response.json(require(`./fixtures/${manKey}/${fixKey}.json`));
    return;
  }

  if (!(format in plugins.export)) {
    next();
    return;
  }


  const outfiles = plugins.export[format].export([fixtureFromRepository(manKey, fixKey)], {
    baseDir: __dirname
  });

  downloadFiles(response, outfiles, `${manKey}_${fixKey}_${format}`);
});

app.get(`/sitemap.xml`, (request, response) => {
  const sitemapCreator = require(`./views/pages/sitemap.js`);
  const requestUrl = url.resolve(`${request.protocol}://${request.get(`host`)}`, request.originalUrl);

  response.type(`application/xml`).send(sitemapCreator({
    app,
    url: requestUrl
  }));
});

app.post(`/ajax/add-fixtures`, (request, response) => {
  require(`./ui/ajax/add-fixtures.js`)(request, response);
});

app.post(`/ajax/get-search-results`, (request, response) => {
  require(`./ui/ajax/get-search-results.js`)(request, response);
});



// instantiate nuxt.js with the options
const nuxtConfig = require(`./nuxt.config.js`);
const nuxt = new Nuxt(nuxtConfig);

// render every remaining route with Nuxt.js
app.use(nuxt.render);

if (process.argv[2] === `--dev`) {
  console.log(`Starting dev server with hot reloading...`);
  new Builder(nuxt).build()
    .then(listen)
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
else {
  // build has been done already
  listen();
}


/**
 * Listen for incoming web requests on the port specified in process.env.PORT
 */
function listen() {
  app.listen(process.env.PORT, () => {
    console.log(`Node app is running on port`, process.env.PORT);
  });
}

/**
 * @typedef ExportFile
 * @type object
 * @property {!string} name filename.ext
 * @property {!string} content file content
 * @property {!string} mimetype e.g. 'text/plain'
 */

/**
 * Instruct Express to initiate a download of one / multiple exported files.
 * @param {!express.Response} response Express Response object
 * @param {!Array.<!ExportFile>} files Array of exported files. If more than one is provided, the files are zipped automatically.
 * @param {!string} zipName Name of the zip file (if any).
 */
function downloadFiles(response, files, zipName) {
  if (files.length === 1) {
    response
      .status(201)
      .attachment(files[0].name)
      .type(files[0].mimetype)
      .send(Buffer.from(files[0].content));
    return;
  }

  // else zip all together
  const Zip = require(`node-zip`);
  const archive = new Zip();
  for (const file of files) {
    archive.file(file.name, file.content);
  }
  const data = archive.generate({
    base64: false,
    compression: `DEFLATE`
  });

  response
    .status(201)
    .attachment(`ofl_export_${zipName}.zip`)
    .type(`application/zip`)
    .send(Buffer.from(data, `binary`));
}
