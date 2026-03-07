import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

const fixturesDir = resolve(process.cwd(), 'fixtures');

export default defineEventHandler(async (event) => {
  const manufacturerKey = getRouterParam(event, 'manufacturerKey');
  const fixtureKey = getRouterParam(event, 'fixtureKey');

  if (!manufacturerKey || !fixtureKey) {
    throw createError({
      statusCode: 400,
      message: 'Manufacturer and fixture keys are required',
    });
  }

  const fixturePath = resolve(fixturesDir, manufacturerKey, `${fixtureKey}.json`);

  try {
    const content = await readFile(fixturePath, 'utf-8');
    const fixtureJson = JSON.parse(content);

    return {
      data: fixtureJson,
    };
  } catch (e) {
    throw createError({
      statusCode: 404,
      message: `Fixture '${manufacturerKey}/${fixtureKey}' not found`,
    });
  }
});
