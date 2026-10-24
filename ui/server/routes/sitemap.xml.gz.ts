import { gzipSync } from 'node:zlib';
import { createSitemap } from '#sitemap/server/sitemap/nitro';
import { useSitemapRuntimeConfig } from '#sitemap/server/utils';

const SITEMAP_CACHE_HEADERS = [
  'X-Sitemap-Generated',
  'X-Sitemap-Cache-Duration',
  'X-Sitemap-Cache-Expires',
  'X-Sitemap-Cache-Remaining',
];

/**
 * Master's `@nuxtjs/sitemap` `gzip: true` registered a separate
 * `/sitemap.xml.gz` endpoint (application/gzip, no Content-Encoding) in
 * addition to the plain `/sitemap.xml`. `@nuxtjs/sitemap` v7 has no equivalent
 * route, so this reproduces it from the same sitemap definition.
 */
export default defineEventHandler(async (event) => {
  const runtimeConfig = useSitemapRuntimeConfig();
  const definition = Object.values(runtimeConfig.sitemaps)[0];

  // `createSitemap` also sets the XML content type and cache headers; the
  // oracle's .gz endpoint only sent `Content-Type: application/gzip`.
  const xml = await createSitemap(event, definition, runtimeConfig);

  setResponseHeader(event, 'Content-Type', 'application/gzip');
  removeResponseHeader(event, 'Cache-Control');
  for (const header of SITEMAP_CACHE_HEADERS) {
    removeResponseHeader(event, header);
  }

  return gzipSync(xml);
});
