#!/usr/bin/env node

// see https://github.com/standard-things/esm#getting-started
require = require(`esm`)(module); // eslint-disable-line no-global-assign

const express = require(`express`);
const compression = require(`compression`);
const { loadNuxt, build } = require(`nuxt`);

// setup environment variables
require(`./lib/load-env-file.js`);
process.env.PORT = process.env.PORT || 5000;
process.env.WEBSITE_URL = process.env.WEBSITE_URL || `http://localhost:${process.env.PORT}/`;

const app = express();

// support JSON encoded bodies
app.use(express.json({ limit: `50mb` }));

// enable compression
app.use(compression({
  threshold: `500B`,
}));


// instantiate nuxt.js with the options
const isDevelopment = process.argv[2] === `--dev`;
loadNuxt(isDevelopment ? `dev` : `start`).then(async nuxt => {
  // render every remaining route with Nuxt.js
  app.use(nuxt.render);

  if (isDevelopment) {
    console.log(`Starting dev server with hot reloading...`);
    await build(nuxt);
  }

  console.log(`Nuxt.js is ready.`);
}).catch(error => {
  console.error(error);
  process.exit(1);
});

app.listen(process.env.PORT, () => {
  console.log(`Node app is running on port`, process.env.PORT);
});
