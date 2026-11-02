import path from 'path';
import importJson from '~~/lib/import-json.js';
import { embedResourcesIntoFixtureJson } from '~~/lib/model.js';

const fixturesDir = path.resolve('fixtures');

export default defineEventHandler(async (event) => {
  const { manufacturerKey, fixtureKey } = event.context.params;

  let fixtureJson;

  try {
    fixtureJson = await importJson(`${manufacturerKey}/${fixtureKey}.json`, fixturesDir);
  }
  catch {
    throw createError({ statusCode: 404, statusMessage: 'Fixture not found' });
  }

  if (fixtureJson.$schema?.endsWith('/fixture-redirect.json')) {
    const redirectTarget = await importJson(`${fixtureJson.redirectTo}.json`, fixturesDir) as Record<string, unknown>;
    fixtureJson = {
      ...redirectTarget,
      name: fixtureJson.name,
    };
  }

  await embedResourcesIntoFixtureJson(fixtureJson);

  setResponseHeader(event, 'Content-Type', 'application/json');
  return { data: fixtureJson };
});
