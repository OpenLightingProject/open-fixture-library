import plugins from '~~/plugins/plugins.json' with { type: 'json' };
import Fixture from '~~/lib/model/Fixture.js';
import Manufacturer from '~~/lib/model/Manufacturer.js';
import { embedResourcesIntoFixtureJson } from '~~/lib/model.js';

export default defineEventHandler(async (event) => {
  const format = getRouterParam(event, 'format');
  const body = await readBody(event);

  if (!plugins.exportPlugins.includes(format)) {
    setResponseStatus(event, 500);
    return { error: `Exporting fixture with ${format} failed: Plugin is not supported.` };
  }

  const outObject = body;
  const fixtures = await Promise.all(Object.entries(outObject.fixtures).map(async ([key, jsonObject]) => {
    const [manufacturerKey, fixtureKey] = key.split('/');
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

  return downloadFixtures(event, format, fixtures, zipName, errorDesc);
});

async function downloadFixtures(event, pluginKey, fixtures, zipName, errorDesc) {
  const plugin = await import(`~~/plugins/${pluginKey}/export.js`);

  try {
    const files = await plugin.exportFixtures(fixtures, {
      baseDirectory: process.cwd(),
      date: new Date(),
    });

    if (files.length === 1) {
      setHeader(event, 'Content-Type', files[0].mimetype);
      setHeader(event, 'Content-Disposition', `attachment; filename="${files[0].name}"`);
      return files[0].content;
    }

    // Zip all together
    const JSZip = (await import('jszip')).default;
    const archive = new JSZip();
    for (const file of files) {
      archive.file(file.name, file.content);
    }

    const zipBuffer = await archive.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    setHeader(event, 'Content-Type', 'application/zip');
    setHeader(event, 'Content-Disposition', `attachment; filename="ofl_export_${zipName}.zip"`);
    return zipBuffer;
  }
  catch (error) {
    setResponseStatus(event, 500);
    return { error: `Exporting ${errorDesc} with ${pluginKey} failed: ${error.toString()}` };
  }
}
