const exportPlugins = require('../../plugins/plugins.js').export;

module.exports = function(options) {
  options.title = 'Open Fixture Library';
  
  let str = require('../includes/header.js')(options);

  str += '<header class="fixture-header">';
  
  str += '<div class="title">';
  str += '<h1>Open Fixture Library</h1>';
  str += '</div>';

  str += '<div class="download-button big">';
  str += `<a href="#" class="title">Download all ${options.register.lastUpdated.length} fixtures</a>`;
  str += '<ul>';
  for (const plugin of Object.keys(exportPlugins)) {
    str += `<li><a href="/download.${plugin}">${exportPlugins[plugin].name}</a></li>`;
  }
  str += '</ul>';
  str += '</div>';

  str += '</header>';


  str += '<h3>Create and browse fixture definitions for lighting equipment online and download them in the right format for your DMX control software!</h3>';

  str += '<p><abbr title="Open Fixture Library">OFL</abbr> collects fixture definitions in a JSON format and automatically exports them to the right format for every supported software. Everybody can <a href="https://github.com/FloEdelmann/open-fixture-library">contribute</a> and help to improve! Thanks!</p>';


  str += '<div class="grid centered">';

  str += '<section class="card list">';
  str += '<h2>Recently updated fixtures</h2>';
  for (const fixtureKey of options.register.lastUpdated.slice(0, 5)) {
    const name = getFixtureName(fixtureKey, options);
    const action = options.register.filesystem[fixtureKey].lastAction;
    const date = new Date(options.register.filesystem[fixtureKey].lastModifyDate);
    const dateHtml = `<time datetime="${date.toISOString()}" title="${date.toISOString()}">${date.toISOString().replace(/T.*?$/, '')}</time>`;

    str += `<a href="/${fixtureKey}">${name}<span class="hint">${action} ${dateHtml}</span></a>`;
  }
  str += '<a href="/manufacturers" class="card dark blue big-button">' + require('../includes/svg.js')({svgBasename: 'folder-multiple'}) + '<h2>Browse fixtures</h2></a>';
  str += '</section>'; // .card

  str += '<section class="card list">';
  str += '<h2>Top contributors</h2>';
  for (const contributor of Object.keys(options.register.contributors).slice(0, 5)) {
    const number = options.register.contributors[contributor].length;
    const latestFixtureKey = getLatestFixtureKey(contributor, options);
    const latestFixtureName = getFixtureName(latestFixtureKey, options);

    str += `<a href="/${latestFixtureKey}">${contributor}<span class="hint">${number} fixture${number === 1 ? '' : 's'}, latest: ${latestFixtureName}</span></a>`;
  }
  str += '<a href="/fixture-editor" class="card dark light-green big-button">' + require('../includes/svg.js')({svgBasename: 'plus'}) + '<h2>Add fixture</h2></a>';
  str += '</section>'; // .card

  str += '</div>'; // .grid.centered

  str += '<div class="list grid centered">';
  str += '<a href="https://github.com/FloEdelmann/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+-label%3Atype-bug" class="card">' + require('../includes/svg.js')({svgBasename: 'lightbulb-on-outline', className: 'left'}) + '<span>Request feature</span></a>';
  str += '<a href="https://github.com/FloEdelmann/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Atype-bug" class="card">' + require('../includes/svg.js')({svgBasename: 'bug', className: 'left'}) + '<span>Report problem</span></a>';
  str += '<a href="https://github.com/FloEdelmann/open-fixture-library" class="card">' + require('../includes/svg.js')({svgBasename: 'github-circle', className: 'left'}) + '<span>View source</span></a>';
  str += '</div>';

  str += require('../includes/footer.js')(options);

  return str;
};


function getFixtureName(fixtureKey, options) {
  const manKey = fixtureKey.split('/')[0];
  const manufacturerName = options.manufacturers[manKey].name;
  const fixtureName = options.register.filesystem[fixtureKey].name;

  return manufacturerName + ' ' + fixtureName;
}

function getLatestFixtureKey(contributor, options) {
  return options.register.lastUpdated.find(
    key => options.register.contributors[contributor].includes(key)
  );
}
