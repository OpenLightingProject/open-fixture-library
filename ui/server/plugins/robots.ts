import pluginsJson from '~~/plugins/plugins.json';

const { exportPlugins } = pluginsJson as { exportPlugins: string[] };

// The Nuxt 2 `@nuxtjs/robots` output did not include the Nuxt 4 module's
// credits block, development hints, or trailing newline. This hook pins the
// exact body and headers master served, because the module has no option for
// removing the development hints.

/**
 * Builds the exact robots.txt body master served.
 *
 * @param {string} websiteUrl - The public site URL (with trailing slash).
 * @param {boolean} searchIndexingIsAllowed - Whether indexing is enabled.
 * @returns {string} The robots.txt body without a trailing newline.
 */
function robotsTxt(websiteUrl: string, searchIndexingIsAllowed: boolean): string {
  if (!searchIndexingIsAllowed) {
    return 'User-agent: *\nDisallow: /';
  }

  return [
    'User-agent: *',
    ...exportPlugins.map((pluginKey) => `Disallow: /*.${pluginKey}$`),
    'Allow: /',
    `Sitemap: ${websiteUrl}sitemap.xml`,
  ].join('\n');
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('robots:robots-txt', (ctx) => {
    const { websiteUrl, searchIndexingIsAllowed } = useRuntimeConfig().public as {
      websiteUrl: string;
      searchIndexingIsAllowed: boolean;
    };

    ctx.robotsTxt = robotsTxt(websiteUrl, searchIndexingIsAllowed);
    // Master served `text/plain` with no cache headers.
    setResponseHeader(ctx.e, 'Content-Type', 'text/plain');
    removeResponseHeader(ctx.e, 'Cache-Control');
  });

  // @nuxtjs/robots sets X-Robots-Tag (when enabled) and, in development,
  // X-Robots-Production even with `header: false`. Master sent neither.
  nitroApp.hooks.hook('beforeResponse', (event) => {
    removeResponseHeader(event, 'X-Robots-Tag');
    removeResponseHeader(event, 'X-Robots-Production');
  });
});
