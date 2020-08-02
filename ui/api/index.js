const express = require(`express`);
const cors = require(`cors`);
const OpenAPIBackend = require(`openapi-backend`).default;
const getAjvErrorMessages = require(`../../lib/get-ajv-error-messages.js`);

/**
 * @typedef {Object} ApiResponse
 * @property {Number} [statusCode=200] The HTTP status code set for the response.
 * @property {Object} body The response body that should be sent as JSON back to the API client.
 */

const router = express.Router();

const corsWhitelist = [
  /[/.]open-fixture-library\.org(?::\d+|)$/,
  /[/.]open-fixture-library-pr-\d+\.herokuapp\.com$/,
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
const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

const api = new OpenAPIBackend({
  definition: `${__dirname}/openapi.json`,
  strict: process.env.NODE_ENV !== `production`,
  ajvOpts: {
    formats: {
      base64: base64Regex,
    },
  },
  handlers: Object.assign({},
    requireNoCacheInDev(`./routes/get-search-results.js`),
    requireNoCacheInDev(`./routes/submit-feedback.js`),
    requireNoCacheInDev(`./routes/fixtures/from-editor.js`),
    requireNoCacheInDev(`./routes/fixtures/import.js`),
    requireNoCacheInDev(`./routes/fixtures/submit.js`),
    requireNoCacheInDev(`./routes/manufacturers/index.js`),
    requireNoCacheInDev(`./routes/manufacturers/_manufacturerKey.js`),
    requireNoCacheInDev(`./routes/plugins/index.js`),
    requireNoCacheInDev(`./routes/plugins/_pluginKey.js`),
    {
      validationFail(ctx, request, response) {
        let error = ctx.validation.errors;

        if (typeof error !== `string`) {
          error = getAjvErrorMessages(Array.isArray(error) ? error : [error], `request`).join(`,\n`);
        }

        return response.status(400).json({ error });
      },
      notFound(ctx, request, response) {
        return response.status(404).json({ error: `Not found` });
      },
      methodNotAllowed(ctx, request, response) {
        return response.status(405).json({ error: `Method not allowed` });
      },
      notImplemented(ctx, request, response) {
        return response.status(501).json({ error: `No handler registered for operation` });
      },
      postResponseHandler(ctx, request, response) {
        if (!ctx.response || !ctx.operation) {
          return null;
        }

        const { statusCode = 200, body } = /** @type {ApiResponse} */ (ctx.response);

        return response.status(statusCode).json(body);
      },
    },
  ),
});

router.use((req, res) => api.handleRequest(req, req, res));

module.exports = router;

/**
 * Like standard require(...), but invalidates cache first (if not in production environment).
 * @param {String} target The require path, like `./register.json`.
 * @returns {*} The result of standard require(target).
 */
function requireNoCacheInDev(target) {
  if (process.env.NODE_ENV !== `production`) {
    delete require.cache[require.resolve(target)];
  }

  return require(target);
}
