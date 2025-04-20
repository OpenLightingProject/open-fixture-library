import { fileURLToPath } from 'url';
import express from 'express';
import JSZip from 'jszip';

import importJson from '../../lib/import-json.js';
import Fixture from '../../lib/model/Fixture.js';
import Manufacturer from '../../lib/model/Manufacturer.js';
import { embedResourcesIntoFixtureJson, fixtureFromRepository } from '../../lib/model.js';
import { sendAttachment, sendJson } from '../../lib/server-response-helpers.js';
/** @typedef {import('http').ServerResponse} ServerResponse */

const pluginsPromise = importJson(`../../plugins/plugins.json`, import.meta.url);
const registerPromise = importJson(`../../fixtures/register.json`, import.meta.url);

/**
 * Instruct Express to initiate a download of one / multiple exported fixture files.
 * @param {ServerResponse} response The Node ServerResponse object.
 * @param {string} pluginKey Key of the export plugin to use.
 * @param {Fixture[]} fixtures Array of fixtures to export.
 * @param {string} zipName Name of the zip file (if multiple files should be downloaded).
 * @param {string} errorDesc String describing what fixture(s) should have been downloaded.
 * @returns {Promise} A Promise that is resolved when the response is sent.
 */
async function downloadFixtures(response, pluginKey, fixtures, zipName, errorDesc) {
  const plugin = await import(`../../plugins/${pluginKey}/export.js`);

  try {
    const files = await plugin.exportFixtures(fixtures, {
      baseDirectory: fileURLToPath(new URL(`../../`, import.meta.url)),
      date: new Date(),
    });

    if (files.length === 1) {
      response.statusCode = 200;
      sendAttachment(response, files[0]);
      return;
    }

    // else zip all together
    const archive = new JSZip();
    for (const file of files) {
      archive.file(file.name, file.content);
    }

    const zipBuffer = await archive.generateAsync({
      type: `nodebuffer`,
      compression: `DEFLATE`,
    });
    response.statusCode = 200;
    sendAttachment(response, {
      name: `ofl_export_${zipName}.zip`,
      mimetype: `application/zip`,
      content: zipBuffer,
    });
  }
  catch (error) {
    response.statusCode = 500;
    response.write(`Exporting ${errorDesc} with ${pluginKey} failed: ${error.toString()}`);
    response.end();
  }
}


const router = express.Router();

// support JSON encoded bodies
router.use(express.json({ limit: `50mb` }));

router.get(`/download.:format([a-z0-9_.-]+)`, async (request, response, next) => {
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

router.post(`/download-editor.:format([a-z0-9_.-]+)`, async (request, response) => {
  const { format } = request.params;

  const plugins = await pluginsPromise;
  if (!plugins.exportPlugins.includes(format)) {
    response.statusCode = 500;
    response.write(`Exporting fixture with ${format} failed: Plugin is not supported.`);
    response.end();

    return;
  }

  const outObject = request.body;
  const fixtures = await Promise.all(Object.entries(outObject.fixtures).map(async ([key, jsonObject]) => {
    const [manufacturerKey, fixtureKey] = key.split(`/`);

    const manufacturer = new Manufacturer(manufacturerKey, outObject.manufacturers[manufacturerKey]);
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

router.get(`/:manufacturerKey/:fixtureKey.:format([a-z0-9_.-]+)`, async (request, response, next) => {
  const { manufacturerKey, fixtureKey, format } = request.params;

  const register = await registerPromise;
  if (!(`${manufacturerKey}/${fixtureKey}` in register.filesystem)) {
    next();
    return;
  }

  if (format === `json`) {
    try {
      const json = await importJson(`../../fixtures/${manufacturerKey}/${fixtureKey}.json`, import.meta.url);
      await embedResourcesIntoFixtureJson(json);
      sendJson(response, json);
    }
    catch (error) {
      response.statusCode = 500;
      response.write(`Fetching ${manufacturerKey}/${fixtureKey}.json failed: ${error.toString()}`);
      response.end();
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

export default router;
