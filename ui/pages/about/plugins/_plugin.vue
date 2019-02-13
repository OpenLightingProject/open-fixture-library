<template>
  <div>
    <h1>{{ pluginName }} Plugin</h1>

    <p>Is exportPlugin? {{ isExportPlugin }}</p>

    <p>Is importPlugin? {{ isImportPlugin }}</p>
  </div>
</template>

<script>
import plugins from '~~/plugins/plugins.json';

export default {
  validate({ params }) {
    return decodeURIComponent(params.plugin) in plugins.data;
  },
  asyncData({ params }) {
    const pluginKey = decodeURIComponent(params.plugin);

    return {
      pluginKey: pluginKey,
      pluginName: plugins.data[pluginKey].name,
      pluginData: plugins.data[pluginKey],
      isImportPlugin: plugins.importPlugins.includes(pluginKey),
      isExportPlugin: plugins.exportPlugins.includes(pluginKey)
    };
  },
  head() {
    return {
      title: `${this.pluginName} Plugin`
    };
  }
};
</script>
