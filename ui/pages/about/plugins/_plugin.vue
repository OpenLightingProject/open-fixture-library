<template>
  <div>
    <h1>{{ pluginData.name }} Plugin</h1>

    <div class="version-info hint">
      <template v-if="exportPluginVersion">Export plugin version {{ exportPluginVersion }}</template>
      <template v-if="exportPluginVersion && importPluginVersion"> | </template>
      <template v-if="importPluginVersion">Import plugin version {{ importPluginVersion }}</template>
    </div>

    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="plugin-description" v-html="pluginData.description" />

    <ul>
      <li v-for="link of Object.keys(pluginData.links)" :key="link">
        <a :href="pluginData.links[link]" target="_blank" rel="nofollow noopener">{{ link }}</a>
      </li>
    </ul>

    <HelpWantedMessage
      v-if="`helpWanted` in pluginData"
      type="plugin"
      :context="pluginData"
      @help-wanted-clicked="openHelpWantedDialog($event)" />

    <div v-if="`fixtureUsage` in pluginData" class="fixture-usage">
      <h2 id="fixture-usage">Install fixture definitions</h2>

      <p><NuxtLink to="/manufacturers">Browse to the fixture</NuxtLink> you want to download, then select <em>{{ pluginData.name }}</em> in the <em>Download as…</em> button.</p>

      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-html="pluginData.fixtureUsage" />
    </div>

    <div v-if="`fileLocations` in pluginData" class="file-locations">
      <h2>File locations</h2>

      <p v-if="`subDirectoriesAllowed` in pluginData.fileLocations">
        Fixture files in subdirectories are {{ pluginData.fileLocations.subDirectoriesAllowed ? `recognized` : `not recognized` }}.
      </p>

      <div v-for="os of fileLocationOSes" :key="os">
        <h3>{{ os }}</h3>

        <section>
          <div v-for="library of Object.keys(pluginData.fileLocations[os])" :key="`${os}-${library}`">
            {{ libraryNames[library] }}: <code>{{ pluginData.fileLocations[os][library] }}</code>
          </div>
        </section>
      </div>
    </div>

    <div v-if="`additionalInfo` in pluginData" class="additional-info">
      <h2>Additional information</h2>

      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-html="pluginData.additionalInfo" />
    </div>

    <p style="margin-top: 3rem;"><NuxtLink to="/about/plugins">Back to plugin overview</NuxtLink></p>

    <HelpWantedDialog v-model="helpWantedContext" type="plugin" />
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
  & ::v-deep h2,
  & ::v-deep h3 {
    margin: 1.5rem 0 -0.5rem;
    line-height: 1.3;
  }

  & ::v-deep p {
    text-align: justify;
  }

  & ::v-deep code {
    padding: 3px 5px;
    background-color: theme-color(header-background);
  }

  & ::v-deep table {
    margin: 1rem 0;
    border-collapse: collapse;
    border: 1px solid theme-color(divider);

    th,
    td {
      padding: 1px 1ex;
      border: 1px solid theme-color(divider);
    }
  }
}
</style>

<script>
import HelpWantedDialog from '../../../components/HelpWantedDialog.vue';
import HelpWantedMessage from '../../../components/HelpWantedMessage.vue';

export default {
  components: {
    HelpWantedDialog,
    HelpWantedMessage,
  },
  async asyncData({ params, $axios, redirect, error }) {
    const pluginKey = params.plugin;
    let pluginData;
    try {
      pluginData = await $axios.$get(`/api/v1/plugins/${pluginKey}`);
    }
    catch (requestError) {
      return error(requestError);
    }

    if (pluginKey in pluginData.previousVersions) {
      const newPluginKey = pluginData.key;
      return redirect(301, `/about/plugins/${newPluginKey}`);
    }

    return { pluginData };
  },
  data() {
    return {
      helpWantedContext: undefined,
      libraryNames: {
        main: `Main (system) library`,
        user: `User library`,
      },
    };
  },
  head() {
    const title = `${this.pluginData.name} Plugin`;

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
  computed: {
    exportPluginVersion() {
      return this.pluginData.exportPluginVersion;
    },
    importPluginVersion() {
      return this.pluginData.importPluginVersion;
    },
    fileLocationOSes() {
      return `fileLocations` in this.pluginData ? Object.keys(this.pluginData.fileLocations).filter(
        os => os !== `subDirectoriesAllowed`,
      ) : null;
    },
  },
  methods: {
    openHelpWantedDialog(event) {
      this.helpWantedContext = event.context;
    },
  },
};
</script>
