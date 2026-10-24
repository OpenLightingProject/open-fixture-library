/**
 * nuxt-security only sets these headers on rendered HTML responses; the Nuxt 2
 * helmet middleware set them on every response, including the API and static
 * files. Values are helmet's defaults, which master used unchanged.
 */
const FALLBACK_HEADERS: Record<string, string> = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Origin-Agent-Cluster': '?1',
  'X-DNS-Prefetch-Control': 'off',
};

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('beforeResponse', (event) => {
    for (const [name, value] of Object.entries(FALLBACK_HEADERS)) {
      if (!getResponseHeader(event, name)) {
        setResponseHeader(event, name, value);
      }
    }
  });
});
