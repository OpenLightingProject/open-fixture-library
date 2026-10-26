const SITEMAP_HEADERS = [
  'X-Sitemap-Generated',
  'X-Sitemap-Cache-Duration',
  'X-Sitemap-Cache-Expires',
  'X-Sitemap-Cache-Remaining',
];

/**
 * `@nuxtjs/sitemap` serves `text/xml; charset=UTF-8` and cache headers. Master
 * served `application/xml` without cache headers, so restore that contract
 * after the module's handler has run.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('beforeResponse', (event) => {
    if (getRequestURL(event).pathname !== '/sitemap.xml') {
      return;
    }

    setResponseHeader(event, 'Content-Type', 'application/xml');
    removeResponseHeader(event, 'Cache-Control');
    for (const header of SITEMAP_HEADERS) {
      removeResponseHeader(event, header);
    }
  });
});
