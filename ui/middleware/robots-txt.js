const plugins = require(`../../plugins/plugins.json`);
const packageJson = require(`../../package.json`);

module.exports = function(req, res) {
  const lines = [
    `User-agent: *`
  ];

  for (const pluginKey of plugins.exportPlugins) {
    lines.push(`Disallow: /*.${pluginKey}$`);
  }

  lines.push(`Allow: /`);
  lines.push(``);
  lines.push(`Sitemap: ${packageJson.homepage}sitemap.xml`);

  res.set(`Content-Type`, `text/html`);
  res.send(Buffer.from(lines.join(`\n`)));
};
