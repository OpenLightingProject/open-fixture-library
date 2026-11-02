const batchDownloadPattern = /^\/download\.([a-z0-9_.-]+)$/;
const editorDownloadPattern = /^\/download-editor\.([a-z0-9_.-]+)$/;
const fixtureDownloadPattern = /^\/([^/]+)\/([^/.]+)\.([a-z0-9_.-]+)$/;

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname;
  // The Nuxt 2 Express router registered these as `.get()` routes, which also
  // answer HEAD requests. Nitro hands the method through verbatim, so map HEAD
  // to the GET handlers explicitly.
  const isGet = event.method === 'GET' || event.method === 'HEAD';

  const batchMatch = pathname.match(batchDownloadPattern);
  if (batchMatch && isGet) {
    return handleBatchDownload(event, batchMatch[1]);
  }

  const fixtureMatch = pathname.match(fixtureDownloadPattern);
  if (fixtureMatch && isGet) {
    return handleFixtureDownload(
      event,
      fixtureMatch[1],
      fixtureMatch[2],
      fixtureMatch[3],
    );
  }

  const editorMatch = pathname.match(editorDownloadPattern);
  if (editorMatch && event.method === 'POST') {
    return handleEditorDownload(event, editorMatch[1]);
  }

  return undefined;
});
