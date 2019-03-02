const sitemapGenerator = require(`sitemap`);

const { fixtureFromRepository } = require(`./model.js`);

const register = require(`../fixtures/register.json`);

/**
 * @param {string} hostname The site's hostname.
 * @returns {string} The generated XML sitemap.
 */
module.exports = function generateSitemap(hostname) {
  return sitemapGenerator.createSitemap({
    hostname,
    urls: getStaticUrls().concat(getRegisterUrls())
  }).toString();
};

function getStaticUrls() {
  return [
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
}

function getRegisterUrls() {
  let urls = [];

  for (const manKey of Object.keys(register.manufacturers)) {
    urls = urls.concat(getManufacturerUrls(manKey, register.manufacturers[manKey]));
  }

  urls = urls.concat(getCategoryUrls(Object.keys(register.categories)));

  return urls;
}

function getManufacturerUrls(manKey, fixKeys) {
  const urls = [{
    url: `/${manKey}`,
    changefreq: `weekly`
  }];

  for (const fixKey of fixKeys) {
    const fix = fixtureFromRepository(manKey, fixKey);
    urls.push({
      url: `/${manKey}/${fixKey}`,
      changefreq: `monthly`,
      lastmodISO: fix.meta.lastModifyDate.toISOString()
    });
  }

  return urls;
}

function getCategoryUrls(cats) {
  return cats.map(cat => ({
    url: `/categories/${cat}`,
    changefreq: `weekly`
  }));
}
