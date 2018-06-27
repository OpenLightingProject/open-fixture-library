const plugins = require(`../../plugins/plugins.json`);
const packageJson = require(`../../package.json`);

module.exports = function(req, res) {
  let lines = [
    `User-agent: *`
  ];

  if (process.env.ALLOW_SEARCH_INDEXING === `allowed`) {
    lines = lines.concat(
      plugins.exportPlugins.map(pluginKey => `Disallow: /*.${pluginKey}$`),
      [
        `Allow: /`,
        ``,
        `Sitemap: ${packageJson.homepage}sitemap.xml`
      ]
    );
  }
  else {
    lines.push(`Disallow: /`);
  }

  res.set(`Content-Type`, `text/plain`);
  res.send(Buffer.from(lines.join(`\n`)));
};
