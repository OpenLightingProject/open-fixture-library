const exportPlugins = require('../../plugins/plugins.js').export;

module.exports = function(options) {
  options.title = 'Open Fixture Library';
  
  let str = require('../includes/header.js')(options);

  str += '<h1>Open Fixture Library</h1>';

  str += '<h3>Create and browse fixture definitions for lighting equipment online and download them in the right format for your DMX control software!</h3>';

  str += '<p><abbr title="Open Fixture Library">OFL</abbr> collects fixture definitions in a JSON format and automatically exports them to the right format for every supported software. Everybody can <a href="https://github.com/FloEdelmann/open-fixture-library">contribute</a> and help to improve! Thanks!</p>';

  str += '<div class="banner grid">';

  str += '<a href="/manufacturers" class="card dark blue">' + require('../includes/svg.js')({svgBasename: 'folder-multiple'}) + '<h2>Browse fixtures</h2></a>';

  str += '<span class="download-button card link dark orange">';
  str += require('../includes/svg.js')({svgBasename: 'briefcase-download'});
  str += '<h2>Download all</h2>';
  str += '<ul>';
  for (const plugin of Object.keys(exportPlugins)) {
    str += `<li><a href="/download.${plugin}">${exportPlugins[plugin].name}</a></li>`;
  }
  str += '</ul>';
  str += '</span>';

  str += '<a href="/fixture-editor" class="card dark light-green">' + require('../includes/svg.js')({svgBasename: 'plus'}) + '<h2>Add fixture</h2></a>';

  str += '</div>'; // .banner.grid

  str += '<div class="grid">';

  str += '<section class="card list">';
  str += '<h2>Recently updated fixtures</h2>';
  for (const fixtureKey of options.register.lastUpdated.slice(0, 8)) {
    const name = options.register.filesystem[fixtureKey].name;
    const date = new Date(options.register.filesystem[fixtureKey].lastModifyDate);
    const dateHtml = `<time class="hint" datetime="${date.toISOString()}" title="${date.toISOString()}">${date.toISOString().replace(/T.*?$/, '')}</time>`;

    str += `<a href="/${fixtureKey}">${name}${dateHtml}</a>`;
  }
  str += '</section>'; // .card

  str += '</div>'; // .banner.grid

  str += '<div class="list grid">';
  str += '<a href="https://github.com/FloEdelmann/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+-label%3Atype-bug" class="card">' + require('../includes/svg.js')({svgBasename: 'lightbulb-on-outline', className: 'left'}) + '<span>Request feature</span></a>';
  str += '<a href="https://github.com/FloEdelmann/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Atype-bug" class="card">' + require('../includes/svg.js')({svgBasename: 'bug', className: 'left'}) + '<span>Report problem</span></a>';
  str += '<a href="https://github.com/FloEdelmann/open-fixture-library" class="card">' + require('../includes/svg.js')({svgBasename: 'github-circle', className: 'left'}) + '<span>View source</span></a>';
  str += '</div>';

  str += require('../includes/footer.js')(options);

  return str;
};
