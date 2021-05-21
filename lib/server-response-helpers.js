/** @typedef {import('http').ServerResponse} ServerResponse */


/**
 * @param {ServerResponse} response The Node ServerResponse object.
 * @param {Object} jsonObject The JSON object to send.
 */
export function sendJson(response, jsonObject) {
  response.setHeader(`Content-Type`, `application/json`);
  response.end(JSON.stringify(jsonObject));
}

/**
 * @param {ServerResponse} response The Node ServerResponse object.
 * @param {Object} file The file attachment.
 * @param {String} file.name The name of the file attachment. Use ASCII characters only to avoid incompabilities.
 * @param {String} file.mimetype The MIME type to set.
 * @param {String|Buffer} file.content The content of the file attachment.
 */
export function sendAttachment(response, { name, mimetype, content }) {
  response.setHeader(`Content-Type`, mimetype);
  response.setHeader(`Content-Disposition`, `attachment; filename="${name}"`);
  response.end(content);
}
