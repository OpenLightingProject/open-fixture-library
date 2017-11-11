const url = require('url');
const sitemapGenerator = require('sitemap');

const register = require('../fixtures/register.json');
const Fixture = require('../lib/model/Fixture.js');

module.exports = function generateSitemap(options) {
  const sitemap = sitemapGenerator.createSitemap({
    hostname: url.resolve(options.url, '/'),
    urls: getStaticUrls().concat(getRegisterUrls())
  });

  return sitemap.toString();
};

function getStaticUrls() {
  return [
    {
      url: '/',
      changefreq: 'daily'
    },
    {
      url: '/fixture-editor',
      changefreq: 'monthly'
    },
    {
      url: '/manufacturers',
      changefreq: 'monthly'
    },
    {
      url: '/categories',
      changefreq: 'monthly'
    },
    {
      url: '/about',
      changefreq: 'yearly'
    },
    {
      url: '/rdm',
      changefreq: 'yearly'
    },
    {
      url: '/search',
      changefreq: 'yearly'
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
  let urls = [{
    url: `/manufacturers/${manKey}`,
    changefreq: 'monthly'
  }];

  for (const fixKey of fixKeys) {
    const fix = Fixture.fromRepository(manKey, fixKey);
    urls.push({
      url: `/manufacturers/${manKey}/${fixKey}`,
      changefreq: 'weekly',
      lastmodISO: fix.meta.lastModifyDate.toISOString()
    });
  }

  return urls;
}

function getCategoryUrls(cats) {
  return cats.map(cat => ({
    url: `/categories/${cat}`,
    changefreq: 'weekly'
  }));
}