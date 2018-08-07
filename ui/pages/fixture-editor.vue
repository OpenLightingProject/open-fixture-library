<template>
  <div id="fixture-editor">
    <h1>Fixture Editor</h1>

    <noscript>Please enable JavaScript to use the Fixture Editor!</noscript>

    <vue-form
      :state="formstate"
      action="#"
      class="only-js"
      @submit.prevent="onSubmit">

      <section class="manufacturer card">
        <h2>Manufacturer</h2>

        <section v-if="fixture.useExistingManufacturer">
          <app-labeled-input :formstate="formstate" name="manufacturerShortName" label="Choose from list">
            <select
              ref="existingManufacturerSelect"
              v-model="fixture.manufacturerShortName"
              :class="{ empty: fixture.manufacturerShortName === `` }"
              required
              name="manufacturerShortName">

              <option value="" disabled>Please select a manufacturer</option>

              <template v-for="(manufacturer, manKey) in manufacturers">
                <option v-if="manKey !== `$schema`" :key="manKey" :value="manKey">
                  {{ manufacturer.name }}
                </option>
              </template>

            </select>
          </app-labeled-input>

          <div class="button-bar">or <a href="#add-new-manufacturer" @click.prevent="switchManufacturer(false)">add a new manufacturer</a></div>
        </section>

        <div v-else>
          <app-labeled-input :formstate="formstate" name="new-manufacturer-name" label="Name">
            <app-property-input-text
              ref="newManufacturerNameInput"
              v-model="fixture.newManufacturerName"
              :schema-property="properties.manufacturer.name"
              :required="true"
              name="new-manufacturer-name" />
          </app-labeled-input>

          <app-labeled-input :formstate="formstate" name="new-manufacturer-shortName" label="Unique short name">
            <app-property-input-text
              v-model="fixture.newManufacturerShortName"
              :schema-property="properties.manufacturerKey"
              :required="true"
              name="new-manufacturer-shortName"
              title="Use only lowercase letters, numbers and dashes." />
          </app-labeled-input>

          <app-labeled-input :formstate="formstate" name="new-manufacturer-website" label="Website">
            <app-property-input-text
              v-model="fixture.newManufacturerWebsite"
              :schema-property="properties.manufacturer.website"
              type="url"
              name="new-manufacturer-website" />
          </app-labeled-input>

          <app-labeled-input :formstate="formstate" name="new-manufacturer-comment" label="Comment">
            <app-property-input-textarea
              v-model="fixture.newManufacturerComment"
              :schema-property="properties.manufacturer.comment"
              name="new-manufacturer-comment" />
          </app-labeled-input>

          <app-labeled-input :formstate="formstate" name="new-manufacturer-rdmId">
            <template slot="label"><abbr title="Remote Device Management">RDM</abbr> model ID</template>
            <app-property-input-number
              v-model="fixture.newManufacturerRdmId"
              :schema-property="properties.manufacturer.rdmId"
              name="new-manufacturer-rdmId" />
          </app-labeled-input>

          <div class="button-bar">or <a href="#use-existing-manufacturer" @click.prevent="switchManufacturer(true)">choose an existing manufacturer</a></div>
        </div>
      </section>

      <section class="fixture-info card">
        <h2>Fixture info</h2>

        <app-labeled-input
          :formstate="formstate"
          :custom-validators="{'no-manufacturer-name': fixtureNameIsWithoutManufacturer}"
          name="fixture-name"
          label="Name">
          <app-property-input-text
            v-model="fixture.name"
            :schema-property="properties.fixture.name"
            :required="true"
            name="fixture-name" />
        </app-labeled-input>

        <app-labeled-input :formstate="formstate" name="fixture-shortName" label="Unique short name">
          <app-property-input-text
            v-model="fixture.shortName"
            :schema-property="properties.fixture.shortName"
            name="fixture-shortName"
            hint="defaults to name" />
        </app-labeled-input>

        <app-labeled-input
          :formstate="formstate"
          name="fixture-categories"
          label="Categories"
          hint="Select and reorder all applicable categories, the most suitable first.">
          <app-category-chooser
            v-model="fixture.categories"
            :all-categories="properties.fixture.categories.items.enum"
            name="fixture-categories"
            categories-not-empty />
        </app-labeled-input>

        <app-labeled-input :formstate="formstate" name="comment" label="Comment">
          <app-property-input-textarea
            v-model="fixture.comment"
            :schema-property="properties.fixture.comment"
            name="comment" />
        </app-labeled-input>

        <app-labeled-input :formstate="formstate" name="links" label="Relevant links">
          <app-editor-links v-model="fixture.links" :formstate="formstate" />
        </app-labeled-input>

        <app-labeled-input
          :formstate="formstate"
          name="rdmModelId"
          hint="The RDM manufacturer ID is saved per manufacturer.">
          <template slot="label"><abbr title="Remote Device Management">RDM</abbr> model ID</template>
          <app-property-input-number
            v-model="fixture.rdmModelId"
            :schema-property="properties.fixture.rdm.properties.modelId"
            name="rdmModelId" />
        </app-labeled-input>

        <app-labeled-input
          v-if="fixture.rdmModelId !== null"
          :formstate="formstate"
          name="rdmSoftwareVersion"
          label="RDM software version">
          <app-property-input-text
            v-model="fixture.rdmSoftwareVersion"
            :schema-property="properties.fixture.rdm.properties.softwareVersion"
            name="rdmSoftwareVersion" />
        </app-labeled-input>
      </section>

      <section class="physical card">
        <h2>Physical data</h2>
        <app-editor-physical
          v-model="fixture.physical"
          :formstate="formstate"
          name-prefix="fixture" />
      </section>

      <section class="fixture-modes">
        <app-editor-mode
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

        <app-labeled-input :formstate="formstate" name="author" label="Your name">
          <app-property-input-text
            v-model="fixture.metaAuthor"
            :schema-property="properties.definitions.nonEmptyString"
            :required="true"
            name="author"
            hint="e.g. Anonymous" />
        </app-labeled-input>

        <app-labeled-input
          :formstate="formstate"
          name="github-username"
          label="GitHub username"
          hint="If you want to be mentioned in the pull request.">
          <app-property-input-text
            v-model="fixture.metaGithubUsername"
            :schema-property="properties.definitions.nonEmptyString"
            name="github-username" />
        </app-labeled-input>

        <app-labeled-input hidden name="honeypot" label="Ignore this!">
          <input v-model="honeypot" type="text">
          <div class="hint">Spammers are likely to fill this field. Leave it empty to show that you're a human.</div>
        </app-labeled-input>
      </section>

      <div class="button-bar right">
        <button type="submit" class="save-fixture primary">Create fixture</button>
      </div>

    </vue-form>

    <app-editor-channel-dialog
      v-model="channel"
      :fixture="fixture"
      @reset-channel="resetChannel"
      @channel-changed="autoSave(`channel`)"
      @remove-channel="removeChannel" />

    <app-editor-choose-channel-edit-mode-dialog
      :channel="channel"
      :fixture="fixture" />

    <app-editor-restore-dialog v-model="restoredData" @restore-complete="restoreComplete" />

    <app-editor-submit-dialog :submit="submit" @reset="reset" />
  </div>
</template>

<style lang="scss" scoped>
.add-mode-link {
  text-align: center;
}
</style>


<script>
import scrollIntoView from 'scroll-into-view';
import {
  getEmptyFixture,
  getEmptyChannel,
  getEmptyMode,
  clone
} from '~/assets/scripts/editor-utils.mjs';

import manufacturers from '~~/fixtures/manufacturers.json';
import schemaProperties from '~~/lib/schema-properties.js';

import labeledInputVue from '~/components/labeled-input.vue';
import propertyInputBooleanVue from '~/components/property-input-boolean.vue';
import propertyInputNumberVue from '~/components/property-input-number.vue';
import propertyInputSelectVue from '~/components/property-input-select.vue';
import propertyInputTextVue from '~/components/property-input-text.vue';
import propertyInputTextareaVue from '~/components/property-input-textarea.vue';
import categoryChooserVue from '~/components/category-chooser.vue';
import editorLinksVue from '~/components/editor-links.vue';
import editorPhysicalVue from '~/components/editor-physical.vue';
import editorModeVue from '~/components/editor-mode.vue';
import editorChannelDialogVue from '~/components/editor-channel-dialog.vue';
import editorChooseChannelEditModeDialogVue from '~/components/editor-choose-channel-edit-mode-dialog.vue';
import editorRestoreDialogVue from '~/components/editor-restore-dialog.vue';
import editorSubmitDialogVue from '~/components/editor-submit-dialog.vue';

const storageAvailable = (function() {
  try {
    const x = `__storage_test__`;
    localStorage.setItem(x, x);
    localStorage.removeItem(x);
    return true;
  }
  catch (e) {
    return false;
  }
})();

export default {
  components: {
    'app-labeled-input': labeledInputVue,
    'app-property-input-boolean': propertyInputBooleanVue,
    'app-property-input-number': propertyInputNumberVue,
    'app-property-input-select': propertyInputSelectVue,
    'app-property-input-text': propertyInputTextVue,
    'app-property-input-textarea': propertyInputTextareaVue,
    'app-category-chooser': categoryChooserVue,
    'app-editor-physical': editorPhysicalVue,
    'app-editor-links': editorLinksVue,
    'app-editor-mode': editorModeVue,
    'app-editor-channel-dialog': editorChannelDialogVue,
    'app-editor-choose-channel-edit-mode-dialog': editorChooseChannelEditModeDialogVue,
    'app-editor-restore-dialog': editorRestoreDialogVue,
    'app-editor-submit-dialog': editorSubmitDialogVue
  },
  head() {
    return {
      title: `Fixture Editor`
    };
  },
  asyncData({ query }) {
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
      catch (error) {
        console.log(`prefill query could not be parsed:`, query.prefill, error);
      }
    }

    return {
      formstate: {},
      readyToAutoSave: false,
      restoredData: null,
      fixture: initFixture,
      channel: getEmptyChannel(),
      honeypot: ``,
      submit: {
        state: `closed`,
        pullRequestUrl: ``,
        rawData: ``
      },
      manufacturers,
      properties: schemaProperties
    };
  },
  computed: {
    fixtureNameIsWithoutManufacturer() {
      let manufacturerName;

      if (this.fixture.useExistingManufacturer) {
        const manKey = this.fixture.manufacturerShortName;

        if (manKey === ``) {
          return true;
        }

        manufacturerName = manufacturers[manKey].name;
      }
      else {
        manufacturerName = this.fixture.newManufacturerName;
      }

      manufacturerName = manufacturerName.trim().toLowerCase();

      return manufacturerName === `` || !this.fixture.name.trim().toLowerCase().startsWith(manufacturerName);
    }
  },
  watch: {
    fixture: {
      handler: function() {
        this.autoSave(`fixture`);
      },
      deep: true
    }
  },
  beforeMount() {
    this.$root._oflRestoreComplete = false;
  },
  mounted() {
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
     * @param {!string} channelUuid The channel's UUID.
     * @returns {!string} The channel's name.
     */
    getChannelName(channelUuid) {
      const channel = this.fixture.availableChannels[channelUuid];

      if (`coarseChannelId` in channel) {
        let name = `${this.getChannelName(channel.coarseChannelId)} fine`;
        if (channel.fineness > 1) {
          name += `^${channel.fineness}`;
        }

        return name;
      }

      return channel.name;
    },

    /**
     * @param {!string} channelUuid The channel's UUID.
     * @returns {!boolean} True if the channel's name is not used in another channel, too.
     */
    isChannelNameUnique(channelUuid) {
      const chName = this.getChannelName(channelUuid);

      return Object.keys(this.fixture.availableChannels).every(
        uuid => chName !== this.getChannelName(uuid) || uuid === channelUuid
      );
    },

    /**
     * @param {!string} channelUuid The channel's UUID.
     * @param {?string} [modeUuid] The mode's UUID. If not supplied, remove channel everywhere.
     */
    removeChannel(channelUuid, modeUuid) {
      if (modeUuid) {
        const mode = this.fixture.modes.find(mode => mode.uuid === modeUuid);

        const channelPosition = mode.channels.indexOf(channelUuid);
        if (channelPosition > -1) {
          // remove channel reference from mode
          mode.channels.splice(channelPosition, 1);
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
      if (!storageAvailable || !this.readyToAutoSave) {
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
          timestamp: Date.now()
        }
      ]));
    },

    clearAutoSave() {
      if (!storageAvailable) {
        return;
      }

      localStorage.removeItem(`autoSave`);
    },

    /**
     * Loads auto-saved data from browser's local storage into this component's `restoredData` property, such that a dialog is opened that lets the user choose if they want to apply or discard it.
     */
    restoreAutoSave() {
      if (!storageAvailable) {
        this.$root._oflRestoreComplete = true;
        return;
      }

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

      // focus first input if no dialog is open
      if (this.channel.editMode === ``) {
        this.switchManufacturer(this.fixture.useExistingManufacturer);
      }
    },

    async onSubmit() {
      if (this.formstate.$invalid) {
        const field = document.querySelector(`.vf-field-invalid`);

        scrollIntoView(field, {
          time: 300,
          align: {
            top: 0,
            left: 0,
            topOffset: 100
          },
          isScrollable: target => target === window
        }, () => field.focus());

        return;
      }

      if (this.honeypot !== ``) {
        alert(`Do not fill the "Ignore" fields!`);
        return;
      }

      const sendObject = {
        fixtures: [this.fixture]
      };

      console.log(`submit`, clone(sendObject));

      // eslint-disable-next-line quotes, prefer-template
      this.submit.rawData = '```json\n' + JSON.stringify(sendObject, null, 2) + '\n```';
      this.submit.state = `loading`;

      try {
        const response = await this.$axios.post(`/ajax/add-fixtures`, sendObject);

        if (response.data.error) {
          throw new Error(response.data.error);
        }

        this.submit.pullRequestUrl = response.data.pullRequestUrl;
        this.submit.state = `success`;
        this.clearAutoSave();
      }
      catch (error) {
        console.error(`There was a problem with the request.`, error);

        this.submit.rawData += `\n\n${error.message}`;
        this.submit.state = `error`;
      }
    },

    reset() {
      this.fixture = getEmptyFixture();
      this.channel = getEmptyChannel();
      this.honeypot = ``;
      this.submit = {
        state: `closed`,
        pullRequestUrl: ``,
        rawData: ``
      };

      this.$router.push({
        path: this.$route.path,
        query: {} // clear prefill query
      });

      this.$nextTick(() => {
        this.formstate._reset();
        this.$refs.existingManufacturerSelect.focus();
        window.scrollTo(0, 0);
      });
    }
  }
};

/**
 * @param {!object} prefillObject The object supplied in the page query.
 * @param {!string} key The key to check.
 * @returns {!boolean} True if the value prefillObject[key] is prefillable, false otherwise.
 */
function isPrefillable(prefillObject, key) {
  const allowedPrefillValues = {
    useExistingManufacturer: `boolean`,
    manufacturerShortName: `string`,
    newManufacturerRdmId: `number`,
    rdmModelId: `number`
  };

  return key in allowedPrefillValues && typeof prefillObject[key] === allowedPrefillValues[key];
}
</script>
