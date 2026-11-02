/**
 * Extracts the filename from a `Content-Disposition` response header.
 *
 * The editor download endpoints answer with `attachment; filename="…"`, so the
 * filename is needed to save the generated fixture definition under the right
 * name instead of a random blob name.
 * @param {string | null | undefined} disposition - The header value.
 * @returns {string} The filename, or an empty string if the header does not
 * describe an attachment with a filename.
 */
export function parseContentDispositionFilename(disposition: string | null | undefined): string {
  if (!disposition || !disposition.includes('attachment')) {
    return '';
  }

  const filenameRegex = /filename[^\n;=]*=((["']).*?\2|[^\n;]*)/;
  const matches = filenameRegex.exec(disposition);

  if (!matches?.[1]) {
    return '';
  }

  return matches[1].replaceAll(/["']/g, '');
}
