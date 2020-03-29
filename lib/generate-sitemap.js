const { SitemapStream } = require(`sitemap`);

const { fixtureFromRepository } = require(`./model.js`);

const register = require(`../fixtures/register.json`);
const plugins = require(`../plugins/plugins.json`);

/**
 * @param {String} hostname The site's hostname.
 * @returns {SitemapStream} A stream of the generated XML sitemap.
 */
module.exports = function generateSitemap(hostname) {
  const sitemapStream = new SitemapStream({ hostname });

  // static URLs
  sitemapStream.write({ url: `/`, changefreq: `daily` });
  sitemapStream.write({ url: `/fixture-editor`, changefreq: `monthly` });
  sitemapStream.write({ url: `/import-fixture-file`, changefreq: `monthly` });
  sitemapStream.write({ url: `/manufacturers`, changefreq: `monthly` });
  sitemapStream.write({ url: `/categories`, changefreq: `monthly` });
  sitemapStream.write({ url: `/about`, changefreq: `monthly` });
  sitemapStream.write({ url: `/about/plugins`, changefreq: `monthly` });
  sitemapStream.write({ url: `/rdm`, changefreq: `yearly` });
  sitemapStream.write({ url: `/search`, changefreq: `yearly` });

  // manufacturer URLs
  for (const manKey of Object.keys(register.manufacturers)) {
    sitemapStream.write({ url: `/${manKey}`, changefreq: `weekly` });

    // fixture URLs
    for (const fixKey of register.manufacturers[manKey]) {
      const fix = fixtureFromRepository(manKey, fixKey);
      sitemapStream.write({
        url: `/${manKey}/${fixKey}`,
        changefreq: `monthly`,
        lastmod: fix.meta.lastModifyDate.toISOString()
      });
    }
  }

  // category URLs
  for (const cat of Object.keys(register.categories)) {
    sitemapStream.write({ url: `/categories/${cat}`, changefreq: `weekly` });
  }

  // plugin URLs
  const pluginKeys = Object.keys(plugins.data).filter(key => !plugins.data[key].outdated);
  for (const plugin of pluginKeys) {
    sitemapStream.write({ url: `/about/plugins/${plugin}`, changefreq: `monthly` });
  }

  sitemapStream.end();

  return sitemapStream;
};
