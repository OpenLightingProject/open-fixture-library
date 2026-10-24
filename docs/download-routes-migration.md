# Download Routes Migration: Nuxt 2 → Nuxt 4 / Nitro

## The Problem

Download endpoints for fixture exports (`/download.ofl`, `/cameo/clw-10.ddf`, etc.) stopped working after migrating from Nuxt 2 to Nuxt 4.

**Why it broke:** Nuxt 4 removed the `serverMiddleware` configuration option that was used to mount the old Express-based download router.

## How It Worked in Nuxt 2

`ui/api/download.js` was an Express Router that handled three URL patterns:

| Route | Method | Purpose |
|---|---|---|
| `/download.{format}` | GET | Export all fixtures as a zip in the given format |
| `/download-editor.{format}` | POST | Export fixtures from the editor |
| `/{manufacturer}/{fixture}.{format}` | GET | Export a single fixture (including raw JSON) |

In `nuxt.config.js`:

```js
serverMiddleware: [
  { path: '/api/v1', handler: '~/api/index.js' },
  { path: '/',        handler: '~/api/download.js' },  // Express Router mounted at root
],
```

The Express Router at `/` would:
1. Attempt to match each incoming request against its route patterns
2. If matched — handle the download and call `response.end()`
3. If not matched — call `next()` to pass the request through to Nuxt's page renderer

This coexistence model (Express routes + Nuxt SSR in the same server) is what Nuxt 2 called `serverMiddleware`. Nuxt 4 does not support this pattern.

## Why a Nitro Middleware Instead of File-Based Routes

The dot-format URLs (`/download.ofl`, `/manufacturer/fixture.ofl`) cannot be directly mapped to Nitro's file-based routing system:

- `routes/download.[format].get.ts` — the dot in the filename is treated as a file extension, not a parameter
- `routes/[manufacturer]/[fixture].[format].get.ts` — same problem; dots create file extensions, not route segments
- A catch-all like `routes/[...slug].get.ts` would capture ALL paths including regular page URLs like `/manufacturers`, `/categories`, etc., causing conflicts

The middleware approach solves this with a regex-based pre-check before requests reach the page router:

```typescript
// Only short-circuit if URL matches a download pattern
const batchMatch = pathname.match(/^\/download\.([a-z0-9_.-]+)$/);
if (batchMatch) { return handleBatchDownload(event, batchMatch[1]); }

// Request doesn't match any download pattern → return undefined
// Nitro continues to the next handler (page renderer)
return;
```

## The New Implementation

### File Structure

```
ui/server/
  middleware/
    download.ts      ← HTTP event handler, regex routing only
  utils/
    download.ts     ← all download logic (fixture loading, plugin export, zip creation)
```

### `ui/server/middleware/download.ts`

Thin routing layer only. Pattern-matches the URL, delegates to the appropriate handler, and passes through when no pattern matches.

```typescript
export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname;
  const method = getMethod(event);

  const batchMatch = pathname.match(/^\/download\.([a-z0-9_.-]+)$/);
  if (batchMatch && method === 'GET') {
    return handleBatchDownload(event, batchMatch[1]);
  }
  // ... fixture and editor routes
});
```

Returning `undefined` (no explicit return) means "not handled" — Nitro continues to the next handler, which is the page renderer.

### `ui/server/utils/download.ts`

All the download logic lives here:
- `handleBatchDownload(event, format)` — loads all fixtures from register, exports them
- `handleFixtureDownload(event, manufacturerKey, fixtureKey, format)` — loads a single fixture, exports or returns JSON
- `handleEditorDownload(event, format)` — builds Fixture objects from editor JSON, exports
- `downloadFixtures(event, pluginKey, fixtures, zipName, errorDesc)` — calls the plugin's `exportFixtures()`, zips if multiple files

## Express → H3 API Conversions

| Express | H3 / Nitro |
|---|---|
| `response.setHeader(name, value)` | `setResponseHeader(event, name, value)` |
| `response.statusCode = 200` | `setResponseStatus(event, 200)` |
| `response.end(data)` | `return data` |
| `next()` | `return` (undefined = pass through) |
| `request.body` | `await readBody(event)` |
| `request.params.format` | regex capture group |
| `throw new Error(...)` in route | `throw createError({ statusCode: 500, ... })` |
| `express.json({ limit: '50mb' })` | handled automatically by Nitro |

## Suggested URL Scheme Change (Optional)

The current dot-format scheme works with middleware but is architecturally awkward (regex matching on every request). A cleaner alternative:

| Current | Suggested |
|---|---|
| `/download.ofl` | `/download/ofl` |
| `/cameo/clw-10.ofl` | `/download/cameo/clw-10/ofl` |

This would allow three clean Nitro file-based routes:
- `routes/download/[format].get.ts`
- `routes/download/[manufacturer]/[fixture]/[format].get.ts`
- `routes/download-editor/[format].post.ts`

**Trade-off:** Requires updating all URL generation in `DownloadButton.vue`. The middleware approach is more invasive to the URL scheme but preserves backward compatibility.

## What Was Reused From the Old Implementation

- `lib/model/Fixture.js` — fixture model class
- `lib/model/Manufacturer.js` — manufacturer model class
- `lib/model.js` — `fixtureFromRepository()`, `embedResourcesIntoFixtureJson()`
- `lib/import-json.js` — was used for loading JSON; replaced with direct `fs/promises` read in utils
- All plugin export files under `plugins/*/export.js` — `exportFixtures()` function signature unchanged
- `plugins/plugins.json` — loaded once at startup, `exportPlugins` array used for format validation

## What Was Removed

- `ui/api/download.js` — old Express Router (replaced entirely)
- `ui/api/index.js` — old Express app for API v1 (replaced by `ui/server/api/v1/[...slug].ts`)
- Express dependency (`express`, `node-mock-http`) — no longer needed for downloads
- `server-response-helpers.js` — `sendAttachment()` / `sendJson()` replaced by inline H3 calls

## Production Considerations

- The `plugins/` and `fixtures/` directories are read at server startup (via top-level `await`). This is fine because both files are relatively small and loaded once.
- Dynamic plugin imports (`import(path.resolve('plugins', pluginKey, 'export.js'))`) work in Nitro's Node.js preset.
- The middleware runs on every request — the regex checks are fast (simple string `.match()`), so the overhead is minimal.
- In production (PM2 + `npm run build`), the Nitro preset is `node-server` which is a single process on port 5000, the same as before.

## Files Created

| File | Purpose |
|---|---|
| `ui/server/middleware/download.ts` | Nitro middleware — URL pattern matching + pass-through |
| `ui/server/utils/download.ts` | All download logic — fixture loading, export, zip creation |

## Files That Remain Unchanged (Reference / Dead Code)

| File | Note |
|---|---|
| `ui/api/download.js` | Old Express Router — kept for reference, not active |
| `ui/api/index.js` | Old Express API app — kept for reference |
| `plugins/*/export.js` | All plugin export modules — still in use |
| `lib/model/*.js` | All model classes — still in use |