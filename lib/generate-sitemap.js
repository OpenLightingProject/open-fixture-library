const { Sitemap } = require(`sitemap`);

const { fixtureFromRepository } = require(`./model.js`);

const register = require(`../fixtures/register.json`);
const plugins = require(`../plugins/plugins.json`);

/**
 * @param {String} hostname The site's hostname.
 * @returns {String} The generated XML sitemap.
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
      url: `/import-fixture-file`,
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
      changefreq: `monthly`
    },
    {
      url: `/about/plugins`,
      changefreq: `monthly`
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

  const pluginKeys = Object.keys(plugins.data).filter(key => !plugins.data[key].outdated);
  const pluginUrls = pluginKeys.map(plugin => ({
    url: `/about/plugins/${plugin}`,
    changefreq: `monthly`
  }));

  return new Sitemap({
    hostname,
    urls: staticUrls.concat(manufacturerUrls, categoryUrls, pluginUrls)
  }).toString(true);
};
