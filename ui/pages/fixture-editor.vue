<template>
  <div id="fixture-editor">
    <h1>Fixture Editor</h1>

    <section class="card">
      <h2>Import fixture</h2>
      Instead of creating a new fixture definition in the editor below, you can also <NuxtLink to="/import-fixture-file">import an existing fixture definition file</NuxtLink>.
    </section>

    <noscript class="card yellow">
      Please enable JavaScript to use the Fixture Editor!
    </noscript>

    <ClientOnly placeholder="Fixture editor is loading...">

      <VueForm
        :state="formstate"
        action="#"
        class="only-js"
        @submit.prevent="onSubmit">

        <section class="manufacturer card">
          <h2>Manufacturer</h2>

          <section v-if="fixture.useExistingManufacturer">
            <LabeledInput :formstate="formstate" name="manufacturerKey" label="Choose from list">
              <select
                ref="existingManufacturerSelect"
                v-model="fixture.manufacturerKey"
                :class="{ empty: fixture.manufacturerKey === `` }"
                required
                name="manufacturerKey">

                <option value="" disabled>Please select a manufacturer</option>

                <template v-for="(manufacturer, manKey) in manufacturers">
                  <option v-if="manKey !== `$schema`" :key="manKey" :value="manKey">
                    {{ manufacturer.name }}
                  </option>
                </template>

              </select>
            </LabeledInput>

            <div>or <a href="#add-new-manufacturer" @click.prevent="switchManufacturer(false)">add a new manufacturer</a></div>
          </section>

          <div v-else>
            <LabeledInput :formstate="formstate" name="new-manufacturer-name" label="Name">
              <PropertyInputText
                ref="newManufacturerNameInput"
                v-model="fixture.newManufacturerName"
                :schema-property="properties.manufacturer.name"
                :required="true"
                name="new-manufacturer-name" />
            </LabeledInput>

            <LabeledInput :formstate="formstate" name="new-manufacturer-website" label="Website">
              <PropertyInputText
                v-model="fixture.newManufacturerWebsite"
                :schema-property="properties.manufacturer.website"
                type="url"
                name="new-manufacturer-website" />
            </LabeledInput>

            <LabeledInput :formstate="formstate" name="new-manufacturer-comment" label="Comment">
              <PropertyInputTextarea
                v-model="fixture.newManufacturerComment"
                :schema-property="properties.manufacturer.comment"
                name="new-manufacturer-comment" />
            </LabeledInput>

            <LabeledInput :formstate="formstate" name="new-manufacturer-rdmId">
              <template #label><abbr title="Remote Device Management">RDM</abbr> manufacturer ID</template>
              <PropertyInputNumber
                v-model="fixture.newManufacturerRdmId"
                :schema-property="properties.manufacturer.rdmId"
                name="new-manufacturer-rdmId" />
            </LabeledInput>

            <div>or <a href="#use-existing-manufacturer" @click.prevent="switchManufacturer(true)">choose an existing manufacturer</a></div>
          </div>
        </section>

        <section class="fixture-info card">
          <h2>Fixture info</h2>

          <LabeledInput
            :formstate="formstate"
            :custom-validators="{ 'no-manufacturer-name': fixtureNameIsWithoutManufacturer }"
            name="fixture-name"
            label="Name">
            <PropertyInputText
              v-model="fixture.name"
              :schema-property="properties.fixture.name"
              :required="true"
              name="fixture-name" />
          </LabeledInput>

          <LabeledInput :formstate="formstate" name="fixture-shortName" label="Unique short name">
            <PropertyInputText
              v-model="fixture.shortName"
              :schema-property="properties.fixture.shortName"
              name="fixture-shortName"
              hint="defaults to name" />
          </LabeledInput>

          <LabeledInput
            :formstate="formstate"
            name="fixture-categories"
            label="Categories"
            hint="Select and reorder all applicable categories, the most suitable first.">
            <EditorCategoryChooser
              v-model="fixture.categories"
              :all-categories="properties.fixture.categories.items.enum"
              name="fixture-categories"
              categories-not-empty />
          </LabeledInput>

          <LabeledInput :formstate="formstate" name="comment" label="Comment">
            <PropertyInputTextarea
              v-model="fixture.comment"
              :schema-property="properties.fixture.comment"
              name="comment" />
          </LabeledInput>

          <LabeledInput
            :formstate="formstate"
            :multiple-inputs="true"
            name="links"
            label="Relevant links">
            <EditorLinks v-model="fixture.links" :formstate="formstate" name="links" />
          </LabeledInput>

          <LabeledInput
            :formstate="formstate"
            name="rdmModelId"
            hint="The RDM manufacturer ID is saved per manufacturer.">
            <template #label><abbr title="Remote Device Management">RDM</abbr> model ID</template>
            <PropertyInputNumber
              v-model="fixture.rdmModelId"
              :schema-property="properties.fixture.rdm.properties.modelId"
              name="rdmModelId" />
          </LabeledInput>

          <LabeledInput
            v-if="fixture.rdmModelId !== null"
            :formstate="formstate"
            name="rdmSoftwareVersion"
            label="RDM software version">
            <PropertyInputText
              v-model="fixture.rdmSoftwareVersion"
              :schema-property="properties.fixture.rdm.properties.softwareVersion"
              name="rdmSoftwareVersion" />
          </LabeledInput>
        </section>

        <section class="physical card">
          <h2>Physical data</h2>
          <EditorPhysical
            v-model="fixture.physical"
            :formstate="formstate"
            name-prefix="fixture" />
        </section>

        <section class="fixture-modes">
          <EditorMode
            v-for="(mode, index) in fixture.modes"
            :key="mode.uuid"
            v-model="fixture.modes[index]"
            :index="index"
            :fixture="fixture"
            :formstate="formstate"
            @open-channel-editor="openChannelEditor"
            @remove="fixture.modes.splice(index, 1)" />

          <a class="fixture-mode card add-mode-link" href="#add-mode" @click.prevent="addNewMode">
            <h2>+ Add mode</h2>
          </a>

          <div class="clearfix" />
        </section>

        <section class="user card">
          <h2>Author data</h2>

          <LabeledInput :formstate="formstate" name="author" label="Your name">
            <PropertyInputText
              v-model="fixture.metaAuthor"
              :schema-property="properties.definitions.nonEmptyString"
              :required="true"
              name="author"
              hint="e.g. Anonymous" />
          </LabeledInput>

          <LabeledInput
            :formstate="formstate"
            name="github-username"
            label="GitHub username"
            hint="If you want to be mentioned in the pull request.">
            <PropertyInputText
              v-model="githubUsername"
              :schema-property="properties.definitions.nonEmptyString"
              name="github-username" />
          </LabeledInput>

          <LabeledInput hidden name="honeypot" label="Ignore this!">
            <input v-model="honeypot" type="text">
            <div class="hint">Spammers are likely to fill this field. Leave it empty to show that you're a human.</div>
          </LabeledInput>
        </section>

        <div class="button-bar right">
          <button type="submit" class="save-fixture primary">Create fixture</button>
        </div>

      </VueForm>

      <EditorChannelDialog
        v-model="channel"
        :fixture="fixture"
        @reset-channel="resetChannel"
        @channel-changed="autoSave(`channel`)"
        @remove-channel="removeChannel" />

      <EditorChooseChannelEditModeDialog
        :channel="channel"
        :fixture="fixture" />

      <EditorRestoreDialog v-model="restoredData" @restore-complete="restoreComplete" />

      <EditorSubmitDialog
        ref="submitDialog"
        endpoint="/api/v1/fixtures/from-editor"
        :github-username="githubUsername"
        @success="onFixtureSubmitted"
        @reset="reset" />

    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
.add-mode-link {
  text-align: center;
}

noscript.card {
  display: block;
  margin-top: 1rem;
}
</style>

<script>
import scrollIntoView from 'scroll-into-view';
import {
  constants,
  getEmptyFixture,
  getEmptyChannel,
  getEmptyMode,
} from '../assets/scripts/editor-utils.js';

import schemaProperties from '../../lib/schema-properties.js';

import EditorCategoryChooser from '../components/editor/EditorCategoryChooser.vue';
import EditorChannelDialog from '../components/editor/EditorChannelDialog.vue';
import EditorChooseChannelEditModeDialog from '../components/editor/EditorChooseChannelEditModeDialog.vue';
import EditorLinks from '../components/editor/EditorLinks.vue';
import EditorMode from '../components/editor/EditorMode.vue';
import EditorPhysical from '../components/editor/EditorPhysical.vue';
import EditorRestoreDialog from '../components/editor/EditorRestoreDialog.vue';
import EditorSubmitDialog from '../components/editor/EditorSubmitDialog.vue';
import LabeledInput from '../components/LabeledInput.vue';
import PropertyInputNumber from '../components/PropertyInputNumber.vue';
import PropertyInputText from '../components/PropertyInputText.vue';
import PropertyInputTextarea from '../components/PropertyInputTextarea.vue';

export default {
  components: {
    EditorCategoryChooser,
    EditorChannelDialog,
    EditorChooseChannelEditModeDialog,
    EditorLinks,
    EditorMode,
    EditorPhysical,
    EditorRestoreDialog,
    EditorSubmitDialog,
    LabeledInput,
    PropertyInputNumber,
    PropertyInputText,
    PropertyInputTextarea,
  },
  head() {
    const title = `Fixture Editor`;

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
  async asyncData({ query, $axios, error }) {
    const initFixture = getEmptyFixture();

    if (query.prefill) {
      try {
        const prefillObject = JSON.parse(query.prefill);
        for (const key of Object.keys(prefillObject)) {
          if (isPrefillable(prefillObject, key)) {
            initFixture[key] = prefillObject[key];
          }
        }
      }
      catch (parseError) {
        console.log(`prefill query could not be parsed:`, query.prefill, parseError);
      }
    }

    try {
      const manufacturers = await $axios.$get(`/api/v1/manufacturers`);

      return {
        formstate: {},
        readyToAutoSave: false,
        restoredData: null,
        fixture: initFixture,
        channel: getEmptyChannel(),
        githubUsername: ``,
        honeypot: ``,
        manufacturers,
        properties: schemaProperties,
      };
    }
    catch (requestError) {
      return error(requestError);
    }
  },
  computed: {
    fixtureNameIsWithoutManufacturer() {
      let manufacturerName;

      if (this.fixture.useExistingManufacturer) {
        const manKey = this.fixture.manufacturerKey;

        if (manKey === ``) {
          return true;
        }

        manufacturerName = this.manufacturers[manKey].name;
      }
      else {
        manufacturerName = this.fixture.newManufacturerName;
      }

      manufacturerName = manufacturerName.trim().toLowerCase();

      return manufacturerName === `` || !this.fixture.name.trim().toLowerCase().startsWith(manufacturerName);
    },
  },
  watch: {
    fixture: {
      handler: function() {
        this.autoSave(`fixture`);
      },
      deep: true,
    },
  },
  beforeMount() {
    this.$root._oflRestoreComplete = false;
  },
  mounted() {
    this.applyStoredPrefillData();

    // let all components initialize without auto-focus
    this.$nextTick(() => this.restoreAutoSave());
  },
  methods: {
    switchManufacturer(useExisting) {
      this.fixture.useExistingManufacturer = useExisting;
      this.$nextTick(() => {
        this.$refs[useExisting ? `existingManufacturerSelect` : `newManufacturerNameInput`].focus();
      });
    },

    addNewMode() {
      this.fixture.modes.push(getEmptyMode());
    },

    openChannelEditor(channelData) {
      this.channel = Object.assign({}, this.channel, channelData);
    },

    resetChannel() {
      this.channel = getEmptyChannel();
    },

    /**
     * @param {String} channelUuid The channel's UUID.
     * @returns {String} The channel's name.
     */
    getChannelName(channelUuid) {
      const channel = this.fixture.availableChannels[channelUuid];

      if (`coarseChannelId` in channel) {
        let name = `${this.getChannelName(channel.coarseChannelId)} fine`;
        if (channel.resolution > constants.RESOLUTION_16BIT) {
          name += `^${channel.resolution - 1}`;
        }

        return name;
      }

      return channel.name;
    },

    /**
     * @param {String} channelUuid The channel's UUID.
     * @returns {Boolean} True if the channel's name is not used in another channel, too.
     */
    isChannelNameUnique(channelUuid) {
      const chName = this.getChannelName(channelUuid);

      return Object.keys(this.fixture.availableChannels).every(
        uuid => chName !== this.getChannelName(uuid) || uuid === channelUuid,
      );
    },

    /**
     * @param {String} channelUuid The channel's UUID.
     * @param {String|null} [modeUuid] The mode's UUID. If not supplied, remove channel everywhere.
     */
    removeChannel(channelUuid, modeUuid) {
      if (modeUuid) {
        const channelMode = this.fixture.modes.find(mode => mode.uuid === modeUuid);

        const channelPosition = channelMode.channels.indexOf(channelUuid);
        if (channelPosition > -1) {
          // remove channel reference from mode
          channelMode.channels.splice(channelPosition, 1);
        }

        return;
      }

      // remove fine channels first
      for (const chId of Object.keys(this.fixture.availableChannels)) {
        const channel = this.fixture.availableChannels[chId];
        if (`coarseChannelId` in channel && channel.coarseChannelId === channelUuid) {
          this.removeChannel(channel.uuid);
        }
      }

      // now remove all references from modes
      for (const mode of this.fixture.modes) {
        this.removeChannel(channelUuid, mode.uuid);
      }

      // finally remove the channel itself
      delete this.fixture.availableChannels[channelUuid];
    },

    /**
     * Saves the entered user data to the browser's local storage if available.
     * @param {'fixture'|'channel'} objectName The object to save.
     */
    autoSave(objectName) {
      if (!this.readyToAutoSave) {
        return;
      }

      if (objectName === `fixture`) {
        console.log(`autoSave fixture:`, JSON.parse(JSON.stringify(this.fixture, null, 2)));
      }
      else if (objectName === `channel`) {
        console.log(`autoSave channel:`, JSON.parse(JSON.stringify(this.channel, null, 2)));
      }

      // use an array to be future-proof (maybe we want to support multiple browser tabs sometime)
      localStorage.setItem(`autoSave`, JSON.stringify([
        {
          fixture: this.fixture,
          channel: this.channel,
          timestamp: Date.now(),
        },
      ]));
    },

    clearAutoSave() {
      localStorage.removeItem(`autoSave`);
    },

    /**
     * Loads auto-saved data from browser's local storage into this component's `restoredData` property, such that a dialog is opened that lets the user choose if they want to apply or discard it.
     */
    restoreAutoSave() {
      try {
        this.restoredData = JSON.parse(localStorage.getItem(`autoSave`)).pop();

        if (this.restoredData === undefined) {
          throw new Error(`this.restoredData is undefined.`);
        }
      }
      catch (error) {
        this.restoredData = null;
        this.restoreComplete();
        return;
      }

      console.log(`restore`, JSON.parse(JSON.stringify(this.restoredData)));
    },

    /**
     * Called from restore dialog (via an event) after the restored data are either applied or discarded.
     */
    restoreComplete() {
      this.readyToAutoSave = true;
      this.$root._oflRestoreComplete = true;
      window.scrollTo(0, 0);
    },

    applyStoredPrefillData() {
      if (this.fixture.metaAuthor === ``) {
        this.fixture.metaAuthor = localStorage.getItem(`prefillAuthor`) || ``;
      }

      if (this.githubUsername === ``) {
        this.githubUsername = localStorage.getItem(`prefillGithubUsername`) || ``;
      }
    },

    storePrefillData() {
      localStorage.setItem(`prefillAuthor`, this.fixture.metaAuthor);
      localStorage.setItem(`prefillGithubUsername`, this.githubUsername);
    },

    onSubmit() {
      if (this.formstate.$invalid) {
        const field = document.querySelector(`.vf-field-invalid`);

        scrollIntoView(field, {
          time: 300,
          align: {
            top: 0,
            left: 0,
            topOffset: 100,
          },
          isScrollable: target => target === window,
        }, () => field.focus());

        return;
      }

      if (this.honeypot !== ``) {
        alert(`Do not fill the "Ignore" fields!`);
        return;
      }

      this.$refs.submitDialog.validate([this.fixture]);
    },

    onFixtureSubmitted() {
      this.storePrefillData();
      this.clearAutoSave();
    },

    reset() {
      this.fixture = getEmptyFixture();
      this.channel = getEmptyChannel();
      this.honeypot = ``;
      this.applyStoredPrefillData();

      this.$router.push({
        path: this.$route.path,
        query: {}, // clear prefill query
      });

      this.$nextTick(() => {
        this.formstate._reset();
        this.$refs.existingManufacturerSelect.focus();
        window.scrollTo(0, 0);
      });
    },
  },
};

/**
 * @param {Object} prefillObject The object supplied in the page query.
 * @param {String} key The key to check.
 * @returns {Boolean} True if the value prefillObject[key] is prefillable, false otherwise.
 */
function isPrefillable(prefillObject, key) {
  const allowedPrefillValues = {
    useExistingManufacturer: `boolean`,
    manufacturerKey: `string`,
    newManufacturerRdmId: `number`,
    rdmModelId: `number`,
  };

  return key in allowedPrefillValues && typeof prefillObject[key] === allowedPrefillValues[key];
}
</script>
