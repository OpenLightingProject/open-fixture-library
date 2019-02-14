<template>
  <div>
    <h1>{{ pluginName }} Plugin</h1>

    <div class="version-info hint">
      <template v-if="exportPluginVersion">Export plugin version {{ exportPluginVersion }}</template>
      <template v-if="exportPluginVersion && importPluginVersion"> | </template>
      <template v-if="importPluginVersion">Import plugin version {{ importPluginVersion }}</template>
    </div>

    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="plugin-description" v-html="pluginData.description.join(`\n`)" />

    <ul>
      <li v-for="link in Object.keys(pluginData.links)" :key="link">
        <a :href="pluginData.links[link]" target="_blank" rel="nofollow">{{ link }}</a>
      </li>
    </ul>

    <div v-if="`fixtureUsage` in pluginData" class="fixture-usage">
      <h2 id="fixture-usage">Fixture usage</h2>

      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-html="pluginData.fixtureUsage.join(`\n`)" />
    </div>

    <div v-if="fileLocationOSes" class="file-locations">
      <h2>File locations</h2>

      <p v-if="`subDirectoriesAllowed` in pluginData.fileLocations">
        Fixture files in subdirectories are {{ pluginData.fileLocations.subDirectoriesAllowed ? `recognized` : `not recognized` }}.
      </p>

      <div v-for="os in fileLocationOSes" :key="os">
        <h3>{{ os }}</h3>

        <section>
          <div v-for="library in Object.keys(pluginData.fileLocations[os])" :key="`${os}-${library}`">
            {{ libraryNames[library] }}: <code>{{ pluginData.fileLocations[os][library] }}</code>
          </div>
        </section>
      </div>
    </div>

    <div v-if="`additionalInfo` in pluginData" class="additional-info">
      <h2>Additional information</h2>

      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-html="pluginData.additionalInfo.join(`\n`)" />
    </div>

    <p style="margin-top: 3rem;"><nuxt-link to="/about/plugins">Back to plugin overview</nuxt-link></p>
  </div>
</template>

<style lang="scss" scoped>
.version-info {
  margin: -1rem 0 0;
}

.plugin-description,
.fixture-usage,
.file-locations,
.additional-info {
  & /deep/ h2,
  & /deep/ h3 {
    margin: 1.5rem 0 -0.5rem;
    line-height: 1.3;
  }

  & /deep/ p {
    text-align: justify;
  }

  & /deep/ code {
    background-color: $grey-50;
    padding: 3px 5px;
  }

  & /deep/ table {
    margin: 1rem 0;
    border: 1px solid $divider-dark;
    border-collapse: collapse;

    th, td {
      border: 1px solid $divider-dark;
      padding: 1px 1ex;
    }
  }
}

</style>

<script>
import plugins from '~~/plugins/plugins.json';

export default {
  validate({ params }) {
    return decodeURIComponent(params.plugin) in plugins.data;
  },
  async asyncData({ params, query, app, redirect }) {
    const pluginKey = decodeURIComponent(params.plugin);

    const pluginData = await app.$axios.$get(`/about/plugins/${pluginKey}.json`);

    const fileLocationOSes = `fileLocations` in pluginData ? Object.keys(pluginData.fileLocations).filter(
      os => os !== `subDirectoriesAllowed`
    ) : null;

    return {
      pluginKey,
      pluginData,
      pluginName: pluginData.name,
      fileLocationOSes,
      exportPluginVersion: plugins.data[pluginKey].exportPluginVersion,
      importPluginVersion: plugins.data[pluginKey].importPluginVersion,
      libraryNames: {
        main: `Main (system) library`,
        user: `User library`
      }
    };
  },
  head() {
    return {
      title: `${this.pluginName} Plugin`
    };
  }
};
</script>
