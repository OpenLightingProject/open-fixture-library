import plugins from '~~/plugins/plugins.json' with { type: 'json' };
import manufacturers from '~~/fixtures/manufacturers.json' with { type: 'json' };
import { checkFixture } from '~~/tests/fixture-valid.js';

defineRouteMeta({
  openAPI: {
    operationId: 'importFixtureFile',
    description: 'Imports the uploaded fixture file and responds with a FixtureCreateResult.',
    tags: ['fixtures'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              plugin: { type: 'string' },
              fileName: { type: 'string' },
              fileContentBase64: { type: 'string', format: 'base64' },
              author: { type: 'string' },
            },
            required: ['plugin', 'fileName', 'fileContentBase64', 'author'],
          },
        },
      },
    },
    responses: {
      '201': {
        description: 'Fixture successfully imported',
        content: {
          'application/json': {
            schema: { type: 'object' },
          },
        },
      },
      '400': {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { error: { type: 'string' } },
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  try {
    const { importPlugins } = plugins;

    if (!body.plugin || !importPlugins.includes(body.plugin)) {
      throw new Error(`'${body.plugin}' is not a valid import plugin.`);
    }

    const plugin = await import(`~~/plugins/${body.plugin}/import.js`);
    const { manufacturers: importedManufacturers, fixtures, warnings } = await plugin.importFixtures(
      Buffer.from(body.fileContentBase64, 'base64'),
      body.fileName,
      body.author,
    ).catch(parseError => {
      parseError.message = `Parse error (${parseError.message})`;
      throw parseError;
    });

    const result = {
      manufacturers: importedManufacturers,
      fixtures,
      warnings,
      errors: {},
    };

    for (const [key, fixture] of Object.entries(result.fixtures)) {
      const [manufacturerKey, fixtureKey] = key.split('/');

      const checkResult = await checkFixture(manufacturerKey, fixtureKey, fixture);

      if (!(manufacturerKey in result.manufacturers)) {
        result.manufacturers[manufacturerKey] = manufacturers[manufacturerKey];
      }

      result.warnings[key] = [...result.warnings[key], ...checkResult.warnings];
      result.errors[key] = checkResult.errors;
    }

    setResponseStatus(event, 201);
    return result;
  }
  catch (error) {
    setResponseStatus(event, 400);
    return { error: error.message };
  }
});
