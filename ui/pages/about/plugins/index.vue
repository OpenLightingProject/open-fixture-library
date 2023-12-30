<template>
  <div>
    <h1>Plugins</h1>

    <p>A plugin in <abbr title="Open Fixture Library">OFL</abbr> is a converter between our <a href="https://github.com/OpenLightingProject/open-fixture-library/blob/master/docs/fixture-format.md">internal fixture definition format</a> and an external format used by DMX lighting software or desks. Click on one of the plugins below to learn more about the corresponding fixture format and download instructions.</p>

    <div class="grid-3 centered">
      <div class="card">
        <h2>Export plugins</h2>

        <div class="hint">for downloading OFL fixtures in various formats</div>

        <ul class="list">
          <li v-for="plugin of plugins.exportPlugins" :key="plugin">
            <NuxtLink :to="`/about/plugins/${plugin}`">
              <OflSvg name="puzzle" class="left" />
              <span class="name">{{ plugins.data[plugin].name }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div class="card">
        <h2>Import plugins</h2>

        <div class="hint">for <NuxtLink to="/import-fixture-file">importing fixtures</NuxtLink> from other formats into OFL</div>

        <ul class="list">
          <li v-for="plugin of plugins.importPlugins" :key="plugin">
            <NuxtLink :to="`/about/plugins/${plugin}`">
              <OflSvg name="puzzle" class="left" />
              <span class="name">{{ plugins.data[plugin].name }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>

    <h3>New plugins</h3>

    <p>If your desired import or export format is not yet supported, please see if there is already an <a href="https://github.com/OpenLightingProject/open-fixture-library/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3Anew-plugin" rel="nofollow">open issue</a> for it in the GitHub repository. If so, try to add information there. Otherwise, please open a <a href="https://github.com/OpenLightingProject/open-fixture-library/issues/new?assignees=&amp;labels=new-plugin&amp;template=new-plugin.md&amp;title=Add+%5Bsoftware+%2F+console+name%5D+Plugin" rel="nofollow">new issue</a>.</p>

    <p>Useful information for developers: <a href="https://github.com/OpenLightingProject/open-fixture-library/blob/master/docs/plugins.md">Plugin documentation</a></p>
  </div>
</template>

<style lang="scss" scoped>
.hint {
  margin-bottom: 1rem;
}

h3 {
  margin: 1.5rem 0 -0.5rem;
  line-height: 1.3;
}
</style>

<script>
export default {
  async asyncData({ $axios, error }) {
    let plugins;
    try {
      plugins = await $axios.$get(`/api/v1/plugins`);
    }
    catch (requestError) {
      return error(requestError);
    }
    return { plugins };
  },
  head() {
    const title = `Plugins`;

    return {
      title,
      meta: [
        {
          hid: `title`,
          content: title,
        },
      ],
    };
  },
};
</script>
