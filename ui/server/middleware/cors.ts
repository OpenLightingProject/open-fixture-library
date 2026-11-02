/**
 * Same CORS policy as master's Express API (`ui/api/index.js`), applied to
 * every `/api/v1` response, including the routes that do not go through the
 * OpenAPI catch-all. This is the single CORS implementation for the site.
 */
const corsWhitelist = [
  /[./]open-fixture-library\.org(?::\d+|)$/,
  /\/localhost(?::\d+|)$/,
];

const corsMethods = 'GET,HEAD,PUT,PATCH,POST,DELETE';

/**
 * Gets the Access-Control-Allow-Origin value for a request.
 *
 * @param {string | undefined} origin - The request's Origin header, if any.
 * @returns {string | undefined} The allowed origin, or `undefined` when the
 * request has no Origin header (the Express `cors` middleware then omits
 * `Access-Control-Allow-Origin`).
 */
export function getAllowedOrigin(origin: string | undefined): string | undefined {
  if (!origin) {
    return undefined;
  }

  const isCorsAllowed = process.env.NODE_ENV !== 'production'
    || corsWhitelist.some((regex) => regex.test(origin));

  return isCorsAllowed ? origin : 'https://open-fixture-library.org';
}

export default defineEventHandler((event) => {
  const pathname = getRequestURL(event).pathname;
  if (pathname !== '/api/v1' && !pathname.startsWith('/api/v1/')) {
    return;
  }

  const origin = getRequestHeader(event, 'origin');

  if (event.method !== 'OPTIONS') {
    // Express's cors middleware always adds `Vary: Origin`.
    appendResponseHeader(event, 'Vary', 'Origin');

    const allowedOrigin = getAllowedOrigin(origin);
    if (allowedOrigin) {
      setResponseHeader(event, 'Access-Control-Allow-Origin', allowedOrigin);
    }

    return;
  }

  // Preflight requests were answered by the same middleware with status 200
  // (optionsSuccessStatus), the default Express method list, and a combined
  // Vary header.
  setResponseHeader(event, 'Vary', 'Origin, Access-Control-Request-Headers');

  const allowedOrigin = getAllowedOrigin(origin);
  if (allowedOrigin) {
    setResponseHeader(event, 'Access-Control-Allow-Origin', allowedOrigin);
  }

  setResponseHeader(event, 'Access-Control-Allow-Methods', corsMethods);

  const requestedHeaders = getRequestHeader(event, 'access-control-request-headers');
  if (requestedHeaders) {
    setResponseHeader(event, 'Access-Control-Allow-Headers', requestedHeaders);
  }

  setResponseStatus(event, 200);
  // Returning '' stops the request pipeline with an empty preflight body;
  // other paths fall through to the route handler.
  // eslint-disable-next-line consistent-return
  return '';
});
