import plugins from '~~/plugins/plugins.json' with { type: 'json' };
import register from '~~/fixtures/register.json' with { type: 'json' };
import { fixtureFromRepository, embedResourcesIntoFixtureJson } from '~~/lib/model.js';

export default defineEventHandler(async (event) => {
  const format = getRouterParam(event, 'format');
  const manufacturerKey = getRouterParam(event, 'manufacturerKey');
  const fixtureKey = getRouterParam(event, 'fixtureKey');

  // Download all fixtures in a format
  if (!manufacturerKey && !fixtureKey) {
    if (!plugins.exportPlugins.includes(format)) {
      setResponseStatus(event, 404);
      return { error: 'Plugin not supported' };
    }

    const fixtures = await Promise.all(
      Object.keys(register.filesystem).filter(
        fixtureKey => !('redirectTo' in register.filesystem[fixtureKey]) || register.filesystem[fixtureKey].reason === 'SameAsDifferentBrand',
      ).map(fixture => {
        const [manufacturer, key] = fixture.split('/');
        return fixtureFromRepository(manufacturer, key);
      }),
    );

    return downloadFixtures(event, format, fixtures, format, 'all fixtures');
  }

  // Download specific fixture
  const fixturePath = `${manufacturerKey}/${fixtureKey}`;

  if (!(fixturePath in register.filesystem)) {
    setResponseStatus(event, 404);
    return { error: 'Fixture not found' };
  }

  if (format === 'json') {
    const fixtureJson = await import(`~~/fixtures/${manufacturerKey}/${fixtureKey}.json`, { with: { type: 'json' } });
    await embedResourcesIntoFixtureJson(fixtureJson.default);
    return fixtureJson.default;
  }

  if (!plugins.exportPlugins.includes(format)) {
    setResponseStatus(event, 404);
    return { error: 'Plugin not supported' };
  }

  const fixtures = [await fixtureFromRepository(manufacturerKey, fixtureKey)];
  return downloadFixtures(event, format, fixtures, `${manufacturerKey}_${fixtureKey}_${format}`, `fixture ${manufacturerKey}/${fixtureKey}`);
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
