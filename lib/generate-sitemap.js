const url = require(`url`);
const sitemapGenerator = require(`sitemap`);

const { fixtureFromRepository } = require(`../lib/model.js`);

const register = require(`../fixtures/register.json`);

module.exports = function generateSitemap(options) {
  if (!options.app.get(`sitemap`)) {
    options.app.set(`sitemap`, sitemapGenerator.createSitemap({
      hostname: url.resolve(options.url, `/`),
      urls: getStaticUrls().concat(getRegisterUrls())
    }).toString());
  }

  return options.app.get(`sitemap`);
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
