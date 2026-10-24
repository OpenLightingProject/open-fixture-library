import { api, apiReady, getCorsHeaders } from '~~/ui/server/utils/api';

export default defineEventHandler(async (event) => {
  await apiReady;

  const method = event.method;
  const headers = getRequestHeaders(event);
  let body;

  if (method !== 'GET' && method !== 'HEAD') {
    try {
      body = await readBody(event);
    }
    catch {
      // body might be empty or unreadable
    }
  }

  const result = await api.handleRequest({
    path: event.path,
    originalUrl: event.path,
    method,
    headers,
    body,
    query: getQuery(event),
  });

  const { statusCode = 200, body: responseBody } = result ?? {};

  setResponseStatus(event, statusCode);
  setResponseHeaders(event, getCorsHeaders(getRequestHeader(event, 'origin')));
  setResponseHeader(event, 'Content-Type', 'application/json');

  return responseBody;
});
