const os = require('os');
const url = require('url');
const sitemapGenerator = require('sitemap');

const Fixture = require('../../lib/model/Fixture.js');

module.exports = function(options) {
  const urls = [getHomePage()]
    .concat(getStaticUrls())
    .concat(getRegisterUrls(options.register));
  
  const sitemap = sitemapGenerator.createSitemap({
    hostname: url.resolve(options.url, '/'),
    urls: urls
  });

  return sitemap.toString();
}

function getHomePage() {
  return {
    url: '/',
    changefreq: 'daily'
  };
}

function getStaticUrls() {
  return ['fixture-editor/', 'manufacturers/', 'categories/', 'about/', 'rdm/'].map(url => ({
    url: url,
    changefreq: 'yearly'
  }));
}

function getRegisterUrls(register) {
  let urls = [];

  for (const manKey of Object.keys(register.manufacturers)) {
    urls = urls.concat(getManufacturerUrls(manKey, register.manufacturers[manKey]));
  }

  urls = urls.concat(getCategoryUrls(Object.keys(register.categories)));

  return urls;
}

function getManufacturerUrls(manKey, fixKeys) {
  const manUrl = {
    url: `manufacturers/${manKey}/`,
    changefreq: 'monthly'
  };

  const fixUrls = fixKeys.map(fixKey => {
    const fix = Fixture.fromRepository(manKey, fixKey);
    return {
      url: `manufacturers/${manKey}/${fixKey}/`,
      changefreq: 'weekly',
      lastmodISO: fix.meta.lastModifyDate.toISOString()
    }
  });

  return [manUrl].concat(fixUrls);
}

function getCategoryUrls(cats) {
  return cats.map(cat => ({
    url: `categories/${cat}/`,
    changefreq: 'weekly'
  }))
}