const batchDownloadPattern = /^\/download\.([a-z0-9_.-]+)$/;
const editorDownloadPattern = /^\/download-editor\.([a-z0-9_.-]+)$/;
const fixtureDownloadPattern = /^\/([^/]+)\/([^/.]+)\.([a-z0-9_.-]+)$/;

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname;

  const batchMatch = pathname.match(batchDownloadPattern);
  if (batchMatch && event.method === "GET") {
    return handleBatchDownload(event, batchMatch[1]);
  }

  const fixtureMatch = pathname.match(fixtureDownloadPattern);
  if (fixtureMatch && event.method === "GET") {
    return handleFixtureDownload(
      event,
      fixtureMatch[1],
      fixtureMatch[2],
      fixtureMatch[3],
    );
  }

  const editorMatch = pathname.match(editorDownloadPattern);
  if (editorMatch && event.method === "POST") {
    return handleEditorDownload(event, editorMatch[1]);
  }
});
