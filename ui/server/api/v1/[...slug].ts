import { api } from '~~/ui/api/index.js';

export default defineEventHandler(async (event) => {
  const method = event.method;
  const headers = getRequestHeaders(event);
  let body;

  if (method !== 'GET' && method !== 'HEAD') {
    try {
      body = await readBody(event);
    } catch {
      // body might be empty or unreadable
    }
  }

  const result = await api.handleRequest({
    path: event.path,
    method,
    headers,
    body,
    query: getQuery(event),
  });

  if (!result) {
    setResponseStatus(event, 500);
    return send(event, JSON.stringify({ error: 'Internal Server Error' }));
  }

  const { statusCode = 200, body: responseBody } = result;
  setResponseStatus(event, statusCode);
  setResponseHeader(event, 'Content-Type', 'application/json');
  return send(event, JSON.stringify(responseBody));
});
