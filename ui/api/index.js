const express = require(`express`);
const chalk = require(`chalk`);
const cors = require(`cors`);
const OpenAPIBackend = require(`openapi-backend`).default;
const getAjvErrorMessages = require(`../../lib/get-ajv-error-messages.js`);

const routeHandlers = require(`./routes.js`);

/**
 * @typedef {Object} ApiResponse
 * @property {Number} [statusCode=200] The HTTP status code set for the response.
 * @property {Object} body The response body that should be sent as JSON back to the API client.
 */

const router = express.Router();

const corsWhitelist = [
  /[./]open-fixture-library\.org(?::\d+|)$/,
  /[./]open-fixture-library-pr-\d+\.herokuapp\.com$/,
  /\/localhost(?::\d+|)$/,
];

router.use(cors({
  origin(origin, callback) {
    const corsAllowed = process.env.NODE_ENV !== `production`
      || !origin // allow non XHR/fetch requests
      || corsWhitelist.some(regex => regex.test(origin));

    callback(null, corsAllowed ? true : `https://open-fixture-library.org`);
  },
  optionsSuccessStatus: 200, // IE11 chokes on default 204
}));


// The Regex is actually not unsafe, just in a more concise form than the one
// that security/detect-unsafe-regex would not complain about.
// eslint-disable-next-line security/detect-unsafe-regex
const base64Regex = /^(?:[\d+/A-Za-z]{4})*(?:[\d+/A-Za-z]{2}==|[\d+/A-Za-z]{3}=)?$/;

const api = new OpenAPIBackend({
  definition: `${__dirname}/openapi.json`,
  strict: process.env.NODE_ENV !== `production`,
  ajvOpts: {
    formats: {
      base64: base64Regex,
    },
  },
  handlers: {
    ...routeHandlers,
    validationFail(context, request, response) {
      let error = context.validation.errors;

      if (typeof error !== `string`) {
        error = getAjvErrorMessages(Array.isArray(error) ? error : [error], `request`).join(`,\n`);
      }

      const errorDescription = `API request for ${request.originalUrl} (${context.operation.operationId}) doesn't match schema:`;

      console.error(chalk.bgRed(errorDescription));
      console.error(error);

      return response.status(400).json({
        error: `${errorDescription}\n${error}`,
      });
    },
    notFound(context, request, response) {
      return response.status(404).json({ error: `Not found` });
    },
    methodNotAllowed(context, request, response) {
      return response.status(405).json({ error: `Method not allowed` });
    },
    notImplemented(context, request, response) {
      return response.status(501).json({ error: `No handler registered for operation` });
    },
    postResponseHandler(context, request, response) {
      if (!context.response || !context.operation) {
        return null;
      }

      const { statusCode = 200, body } = /** @type {ApiResponse} */ (context.response);

      // validate API responses in development mode
      if (process.env.NODE_ENV !== `production`) {
        const valid = api.validateResponse(body, context.operation, statusCode);

        if (valid.errors) {
          let error = valid.errors;

          if (typeof error !== `string`) {
            error = getAjvErrorMessages(Array.isArray(error) ? error : [error], `response`).join(`,\n`);
          }

          const errorDescription = `API response for ${request.originalUrl} (${context.operation.operationId}, status code ${statusCode}) doesn't match schema:`;

          console.error(chalk.bgRed(errorDescription));
          console.error(error);
        }
      }

      return response.status(statusCode).json(body);
    },
  },
});

router.use((request, response) => api.handleRequest(request, request, response));

module.exports = router;
