const { SitemapStream } = require(`sitemap`);

const { fixtureFromRepository } = require(`./model.js`);

const register = require(`../fixtures/register.json`);
const plugins = require(`../plugins/plugins.json`);

/**
 * @param {String} hostname The site's hostname.
 * @returns {Promise.<SitemapStream>} A Promise that resolves to a stream of the generated XML sitemap.
 */
module.exports = async function generateSitemap(hostname) {
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
  for (const manufacturerKey of Object.keys(register.manufacturers)) {
    sitemapStream.write({ url: `/${manufacturerKey}`, changefreq: `weekly` });

    // fixture URLs
    for (const fixtureKey of register.manufacturers[manufacturerKey]) {
      const fixture = await fixtureFromRepository(manufacturerKey, fixtureKey);
      sitemapStream.write({
        url: `/${manufacturerKey}/${fixtureKey}`,
        changefreq: `monthly`,
        lastmod: fixture.meta.lastModifyDate.toISOString(),
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
