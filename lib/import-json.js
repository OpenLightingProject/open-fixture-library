import { readFile } from 'fs/promises';
import path from 'path';

/**
 * @param {string | URL} jsonPath The JSON file path.
 * @param {string | URL | undefined} basePath A path from which the JSON path is resolved relative to.
 * @returns {Promise<any>} A Promise that resolves to the parsed JSON file content.
 */
export default async function importJson(jsonPath, basePath) {
  if (typeof basePath === `string` && !basePath.startsWith(`file:`)) {
    jsonPath = path.resolve(basePath, jsonPath);
  }
  else if (basePath) {
    jsonPath = new URL(jsonPath, basePath);
  }

  // see https://github.com/sindresorhus/eslint-plugin-unicorn/issues/1273
  const buffer = await readFile(jsonPath);
  return JSON.parse(buffer);
}
