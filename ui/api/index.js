import { fileURLToPath } from 'url';
import chalk from 'chalk';
import cors from 'cors';
import express from 'express';
import { OpenAPIBackend } from 'openapi-backend';
import getAjvErrorMessages from '../../lib/get-ajv-error-messages.js';
import { sendJson } from '../../lib/server-response-helpers.js';

import * as routeHandlers from './routes.js';

/**
 * @typedef {object} ApiResponse
 * @property {number} [statusCode=200] The HTTP status code set for the response.
 * @property {object} body The response body that should be sent as JSON back to the API client.
 */

const app = express();

// support JSON encoded bodies
app.use(express.json({ limit: `50mb` }));

const corsWhitelist = [
  /[./]open-fixture-library\.org(?::\d+|)$/,
  /\/localhost(?::\d+|)$/,
];

app.use(cors({
  origin(origin, callback) {
    const corsAllowed = process.env.NODE_ENV !== `production`
      || !origin // allow non XHR/fetch requests
      || corsWhitelist.some(regex => regex.test(origin));

    callback(null, corsAllowed ? true : `https://open-fixture-library.org`);
  },
  optionsSuccessStatus: 200, // IE11 chokes on default 204
}));


const base64Regex = /^(?:[\d+/A-Za-z]{4})*(?:[\d+/A-Za-z]{2}==|[\d+/A-Za-z]{3}=)?$/;

const api = new OpenAPIBackend({
  definition: fileURLToPath(new URL(`openapi.json`, import.meta.url)),
  strict: process.env.NODE_ENV !== `production`,
  ajvOpts: {
    formats: {
      base64: base64Regex,
    },
  },
  handlers: {
    ...routeHandlers,
    validationFail({ validation, request, operation }) {
      let error = validation.errors;

      if (typeof error !== `string`) {
        error = getAjvErrorMessages(Array.isArray(error) ? error : [error], `request`).join(`,\n`);
      }

      const errorDescription = `API request for ${request.originalUrl} (${operation.operationId}) doesn't match schema:`;

      console.error(chalk.bgRed(errorDescription));
      console.error(error);

      return {
        statusCode: 400,
        body: { error: `${errorDescription}\n${error}` },
      };
    },
    notFound(context) {
      return {
        statusCode: 404,
        body: { error: `Not found` },
      };
    },
    methodNotAllowed(context) {
      return {
        statusCode: 405,
        body: { error: `Method not allowed` },
      };
    },
    notImplemented(context) {
      return {
        statusCode: 501,
        body: { error: `No handler registered for operation` },
      };
    },
    postResponseHandler({ request, response, operation }) {
      if (!response || !operation) {
        return null;
      }

      const { statusCode = 200, body } = /** @type {ApiResponse} */ response;

      // validate API responses in development mode
      if (process.env.NODE_ENV !== `production`) {
        const valid = api.validateResponse(body, operation, statusCode);

        if (valid.errors) {
          let error = valid.errors;

          if (typeof error !== `string`) {
            error = getAjvErrorMessages(Array.isArray(error) ? error : [error], `response`).join(`,\n`);
          }

          const errorDescription = `API response for ${request.originalUrl} (${operation.operationId}, status code ${statusCode}) doesn't match schema:`;

          console.error(chalk.bgRed(errorDescription));
          console.error(error);
        }
      }

      return response;
    },
  },
});

app.use(async (request, response) => {
  const { statusCode = 200, body } = await api.handleRequest(request);
  response.statusCode = statusCode;
  sendJson(response, body);
});

export default app;
