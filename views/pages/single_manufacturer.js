const url = require(`url`);

const svg = require(`../includes/svg.js`);

const { fixtureFromRepository } = require(`../../lib/model.js`);

let manufacturer;
let fixtures;

module.exports = function(options) {
  const {manufacturers, register, man} = options;
  manufacturer = manufacturers[man];
  fixtures = register.manufacturers[man].map(
    fix => fixtureFromRepository(man, fix)
  );

  options.title = `${manufacturer.name} - Open Fixture Library`;
  options.structuredDataItems.push(getStructuredOrganization(options));
  options.structuredDataItems.push(getStructuredItemList(options));

  let str = require(`../includes/header.js`)(options);

  str += `<h1>${manufacturer.name} fixtures</h1>`;

  if (`website` in manufacturer || `rdmId` in manufacturer) {
    str += `<div class="grid list">`;

    if (`website` in manufacturer) {
      str += `<a href="${manufacturer.website}" rel="nofollow" class="card blue dark">${svg.getSvg(`earth`, [`left`])}<span>Manufacturer website</span></a>`;
    }
    if (`rdmId` in manufacturer) {
      str += `<a href="http://rdm.openlighting.org/manufacturer/display?manufacturer=${manufacturer.rdmId}" rel="nofollow" class="card">${svg.getSvg(`ola`, [`left`])}<span>Open Lighting RDM database</span></a>`;
    }

    str += `</div>`;
  }
  if (`comment` in manufacturer) {
    str += `<p class="comment">${manufacturer.comment.replace(/\n/g, `<br />`)}</p>`;
  }

  str += `<ul class="card list manufacturer-fixtures">`;
  for (const fix of fixtures) {
    str += `<li><a href="/${man}/${fix.key}">`;
    str += `<span class="name">${fix.name}</span>`;
    for (const cat of fix.categories) {
      str += svg.getCategoryIcon(cat, [`right`]);
    }
    str += `</a></li>`;
  }
  str += `</ul>`;

  str += require(`../includes/footer.js`)(options);

  return str;
};

/**
 * Creates an Organization as structured data for SEO
 * @param {!object} options Global options
 * @returns {!object} The JSON-LD data
 */
function getStructuredOrganization(options) {
  const data = {
    '@context': `http://schema.org`,
    '@type': `Organization`,
    'name': manufacturer.name,
    'brand': manufacturer.name
  };

  if (`website` in manufacturer) {
    data.sameAs = manufacturer.website;
  }

  return data;
}

/**
 * Creates an ItemList as structured data for SEO
 * @param {!object} options Global options
 * @returns {!object} The JSON-LD data
 */
function getStructuredItemList(options) {
  return {
    '@context': `http://schema.org`,
    '@type': `ItemList`,
    'itemListElement': fixtures.map((fix, index) => ({
      '@type': `ListItem`,
      'position': index + 1,
      'url': url.resolve(options.url, fix.key)
    }))
  };
}
