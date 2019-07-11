const sitemapGenerator = require(`sitemap`);

const { fixtureFromRepository } = require(`./model.js`);

const register = require(`../fixtures/register.json`);

/**
 * @param {string} hostname The site's hostname.
 * @returns {string} The generated XML sitemap.
 */
module.exports = function generateSitemap(hostname) {
  const staticUrls = [
    {
      url: `/`,
      changefreq: `daily`
    },
    {
      url: `/fixture-editor`,
      changefreq: `monthly`
    },
    {
      url: `/manufacturers`,
      changefreq: `monthly`
    },
    {
      url: `/categories`,
      changefreq: `monthly`
    },
    {
      url: `/about`,
      changefreq: `yearly`
    },
    {
      url: `/rdm`,
      changefreq: `yearly`
    },
    {
      url: `/search`,
      changefreq: `yearly`
    }
  ];

  const manufacturerUrls = [];
  for (const manKey of Object.keys(register.manufacturers)) {
    manufacturerUrls.push({
      url: `/${manKey}`,
      changefreq: `weekly`
    });

    for (const fixKey of register.manufacturers[manKey]) {
      const fix = fixtureFromRepository(manKey, fixKey);
      manufacturerUrls.push({
        url: `/${manKey}/${fixKey}`,
        changefreq: `monthly`,
        lastmodISO: fix.meta.lastModifyDate.toISOString()
      });
    }
  }

  const categoryUrls = Object.keys(register.categories).map(cat => ({
    url: `/categories/${cat}`,
    changefreq: `weekly`
  }));

  return sitemapGenerator.createSitemap({
    hostname,
    urls: staticUrls.concat(manufacturerUrls, categoryUrls)
  }).toString();
};
