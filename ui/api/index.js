import { fileURLToPath } from 'url';
import { styleText } from 'util';
import addFormats from 'ajv-formats';
import cors from 'cors';
import express from 'express';
import { OpenAPIBackend } from 'openapi-backend';
import getAjvErrorMessages from '../../lib/get-ajv-error-messages.js';
import { sendJson } from '../../lib/server-response-helpers.js';
import * as routeHandlers from './routes.js';

const apiDocumentationUrl = 'https://github.com/OpenLightingProject/open-fixture-library/blob/master/docs/rest-api.md';

/**
 * @typedef {object} ApiResponse
 * @property {number} [statusCode=200] The HTTP status code set for the response.
 * @property {object} body The response body that should be sent as JSON back to the API client.
 */

const app = express();
app.disable('x-powered-by');

app.use((request, response, next) => {
  if (request.url === '/' || request.url === '/v1' || request.url === '/v1/') {
    response.redirect(apiDocumentationUrl);
    return;
  }

  if (request.url.startsWith('/v1/')) {
    request.url = request.url.slice(3);
  }

  next();
});

// support JSON encoded bodies
app.use(express.json({ limit: '50mb' }));

const corsWhitelist = [
  /[./]open-fixture-library\.org(?::\d+|)$/,
  /\/localhost(?::\d+|)$/,
];

app.use(cors({
  origin(origin, callback) {
    const isCorsAllowed = process.env.NODE_ENV !== 'production'
      || !origin // allow non XHR/fetch requests
      || corsWhitelist.some((regex) => regex.test(origin));

    callback(null, isCorsAllowed || 'https://open-fixture-library.org');
  },
  optionsSuccessStatus: 200, // IE11 chokes on default 204
}));

const base64Regex = /^(?:[\d+/A-Za-z]{4})*(?:[\d+/A-Za-z]{2}==|[\d+/A-Za-z]{3}=)?$/;

/**
 * @param {string | object | object[] | null} validationErrors - Errors returned by an OpenAPI validator.
 * @param {string} errorDescription - Description of the response that failed validation.
 * @param {string} rootName - Root object name used in formatted validation messages.
 */
function logResponseValidationErrors(validationErrors, errorDescription, rootName) {
  if (!validationErrors) {
    return;
  }

  let error;
  if (typeof validationErrors === 'string') {
    error = validationErrors;
  }
  else {
    const errors = Array.isArray(validationErrors) ? validationErrors : [validationErrors];
    error = getAjvErrorMessages(errors, rootName).join(',\n');
  }

  console.error(styleText('bgRed', errorDescription));
  console.error(error);
}

const api = new OpenAPIBackend({
  definition: fileURLToPath(new URL('openapi.json', import.meta.url)),
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
    ...routeHandlers,
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
    notFound(context) {
      return {
        statusCode: 404,
        body: { error: 'Not found' },
      };
    },
    methodNotAllowed(context) {
      return {
        statusCode: 405,
        body: { error: 'Method not allowed' },
      };
    },
    notImplemented(context) {
      return {
        statusCode: 501,
        body: { error: 'No handler registered for operation' },
      };
    },
    postResponseHandler({ request, response, operation }, httpResponse) {
      if (!response || !operation) {
        return null;
      }

      const { statusCode = 200, body } = /** @type {ApiResponse} */ response;

      // validate API responses in development mode
      if (process.env.NODE_ENV !== 'production') {
        const requestIdentifier = `${request.originalUrl} (${operation.operationId}, status code ${statusCode})`;

        const valid = api.validateResponse(body, operation, statusCode);
        logResponseValidationErrors(
          valid.errors,
          `API response for ${requestIdentifier} doesn't match schema:`,
          'response',
        );

        const headersValidation = api.validateResponseHeaders(httpResponse.getHeaders(), operation, {
          statusCode,
          setMatchType: 'superset',
        });
        logResponseValidationErrors(
          headersValidation.errors,
          `API response headers for ${requestIdentifier} don't match schema:`,
          'response headers',
        );
      }

      return response;
    },
  },
});

app.use(async (request, response) => {
  response.setHeader('Content-Type', 'application/json');
  const { statusCode = 200, body } = await api.handleRequest(request, response);
  response.statusCode = statusCode;
  sendJson(response, body);
});

export default app;
