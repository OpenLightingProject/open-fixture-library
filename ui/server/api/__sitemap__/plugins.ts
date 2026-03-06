import plugins from '~~/plugins/plugins.json' with { type: 'json' };

export default defineEventHandler(() => {
  const urls = [];
  for (const pluginKey of plugins.exportPlugins || []) {
    urls.push({ loc: `/about/plugins/${pluginKey}` });
  }
  return urls;
});
