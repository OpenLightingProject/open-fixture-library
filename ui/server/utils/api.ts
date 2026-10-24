import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { styleText } from 'node:util';
import addFormats from 'ajv-formats';
import { OpenAPIBackend } from 'openapi-backend';
import getAjvErrorMessages from '~~/lib/get-ajv-error-messages.js';
import openapi from '~~/ui/api/openapi.bundled.json';

/**
 * `import.meta.url` is rewritten to the Nitro entry chunk in bundled server
 * code, so the route handlers must be loaded from their real source location
 * at runtime. Otherwise their fixture/plugin JSON lookups would resolve
 * against `.output/` instead of the repository root.
 */
const routeHandlersPromise = import(
  pathToFileURL(resolve(process.cwd(), 'ui/api/routes.js')).href,
);

const base64Regex = /^(?:[\d+/A-Za-z]{4})*(?:[\d+/A-Za-z]{2}==|[\d+/A-Za-z]{3}=)?$/;

export const api = new OpenAPIBackend({
  definition: openapi as never,
  apiRoot: '/api/v1',
  strict: process.env.NODE_ENV !== 'production',
  ajvOpts: {
    formats: {
      base64: base64Regex,
    },
  },
  customizeAjv(ajv) {
    addFormats(ajv);
    return ajv;
  },
  handlers: {
    validationFail({ validation, request, operation }) {
      let error = validation.errors;

      if (typeof error !== 'string') {
        error = getAjvErrorMessages(Array.isArray(error) ? error : [error], 'request').join(',\n');
      }

      const errorDescription = `API request for ${request.originalUrl} (${operation.operationId}) doesn't match schema:`;

      console.error(styleText('bgRed', errorDescription));
      console.error(error);

      return {
        statusCode: 400,
        body: { error: `${errorDescription}\n${error}` },
      };
    },
    notFound: () => ({ statusCode: 404, body: { error: 'Not found' } }),
    methodNotAllowed: () => ({ statusCode: 405, body: { error: 'Method not allowed' } }),
    notImplemented: () => ({ statusCode: 501, body: { error: 'No handler registered for operation' } }),
  },
});

/**
 * Resolves once the route handlers have been registered on `api`.
 */
export const apiReady = routeHandlersPromise.then((routeHandlers) => {
  api.register(routeHandlers);
  return api;
});
