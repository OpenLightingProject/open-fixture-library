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
        @submit.prevent="onSubmit()">

        <EditorManufacturer
          :fixture="fixture"
          :formstate="formstate"
          :manufacturers="manufacturers" />

        <EditorFixtureInformation
          :fixture="fixture"
          :formstate="formstate"
          :manufacturers="manufacturers" />

        <section class="physical card">
          <h2>Physical data</h2>
          <EditorPhysical
            v-model="fixture.physical"
            :formstate="formstate"
            name-prefix="fixture" />
        </section>

        <section class="fixture-modes">
          <EditorMode
            v-for="(mode, index) of fixture.modes"
            :key="mode.uuid"
            :mode="fixture.modes[index]"
            :index="index"
            :fixture="fixture"
            :formstate="formstate"
            @open-channel-editor="openChannelEditor($event)"
            @remove="fixture.modes.splice(index, 1)" />

          <a class="fixture-mode card add-mode-link" href="#add-mode" @click.prevent="addNewMode()">
            <h2>+ Add mode</h2>
          </a>

          <div class="clearfix" />
        </section>

        <section class="user card">
          <h2>Author data</h2>

          <LabeledInput :formstate="formstate" name="author" label="Your name">
            <PropertyInputText
              v-model="fixture.metaAuthor"
              :schema-property="schemaDefinitions.nonEmptyString"
              required
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
              :schema-property="schemaDefinitions.nonEmptyString"
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
        :channel="channel"
        :fixture="fixture"
        @reset-channel="resetChannel()"
        @channel-changed="autoSave(`channel`)"
        @remove-channel="removeChannel($event)" />

      <EditorChooseChannelEditModeDialog
        :channel="channel"
        :fixture="fixture" />

      <EditorRestoreDialog v-model="restoredData" @restore-complete="restoreComplete()" />

      <EditorSubmitDialog
        ref="submitDialog"
        endpoint="/api/v1/fixtures/from-editor"
        :github-username="githubUsername"
        @success="onFixtureSubmitted()"
        @reset="reset()" />

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

import { schemaDefinitions } from '../../lib/schema-properties.js';
import {
  constants,
  getEmptyChannel,
  getEmptyFixture,
  getEmptyFormState,
  getEmptyMode,
} from '../assets/scripts/editor-utilities.js';

import EditorChannelDialog from '../components/editor/EditorChannelDialog.vue';
import EditorChooseChannelEditModeDialog from '../components/editor/EditorChooseChannelEditModeDialog.vue';
import EditorFixtureInformation from '../components/editor/EditorFixtureInformation.vue';
import EditorManufacturer from '../components/editor/EditorManufacturer.vue';
import EditorMode from '../components/editor/EditorMode.vue';
import EditorPhysical from '../components/editor/EditorPhysical.vue';
import EditorRestoreDialog from '../components/editor/EditorRestoreDialog.vue';
import EditorSubmitDialog from '../components/editor/EditorSubmitDialog.vue';
import LabeledInput from '../components/LabeledInput.vue';
import PropertyInputText from '../components/PropertyInputText.vue';

export default {
  components: {
    EditorChannelDialog,
    EditorChooseChannelEditModeDialog,
    EditorFixtureInformation,
    EditorManufacturer,
    EditorMode,
    EditorPhysical,
    EditorRestoreDialog,
    EditorSubmitDialog,
    LabeledInput,
    PropertyInputText,
  },
  async asyncData({ $axios, error }) {
    let manufacturers;
    try {
      manufacturers = await $axios.$get(`/api/v1/manufacturers`);
    }
    catch (requestError) {
      return error(requestError);
    }
    return { manufacturers };
  },
  data() {
    return {
      formstate: getEmptyFormState(),
      readyToAutoSave: false,
      restoredData: undefined,
      fixture: getEmptyFixture(),
      channel: getEmptyChannel(),
      githubUsername: ``,
      honeypot: ``,
      schemaDefinitions,
    };
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
  watch: {
    fixture: {
      handler() {
        this.autoSave(`fixture`);
      },
      deep: true,
    },
  },
  beforeMount() {
    this.$root._oflRestoreComplete = false;
  },
  async mounted() {
    this.applyQueryPrefillData();
    this.applyStoredPrefillData();

    // let all components initialize without auto-focus
    await this.$nextTick();

    this.restoreAutoSave();
  },
  methods: {
    addNewMode() {
      this.fixture.modes.push(getEmptyMode());
    },

    openChannelEditor(channelData) {
      this.channel = { ...this.channel, ...channelData };
    },

    resetChannel() {
      this.channel = getEmptyChannel();
    },

    /**
     * @param {string} channelUuid The channel's UUID.
     * @returns {string} The channel's name.
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
     * Called from {@link EditorMode}.
     * @public
     * @param {string} channelUuid The channel's UUID.
     * @returns {boolean} True if the channel's name is not used in another channel, too.
     */
    isChannelNameUnique(channelUuid) {
      const channelName = this.getChannelName(channelUuid);

      return Object.keys(this.fixture.availableChannels).every(
        uuid => channelName !== this.getChannelName(uuid) || uuid === channelUuid,
      );
    },

    /**
     * @param {string} channelUuid The channel's UUID.
     * @param {string | null} [modeUuid] The mode's UUID. If not supplied, remove channel everywhere.
     */
    removeChannel(channelUuid, modeUuid) {
      if (modeUuid) {
        const channelMode = this.fixture.modes.find(mode => mode.uuid === modeUuid);

        const channelPosition = channelMode.channels.indexOf(channelUuid);
        if (channelPosition !== -1) {
          // remove channel reference from mode
          channelMode.channels.splice(channelPosition, 1);
        }

        return;
      }

      // remove fine channels first
      for (const channel of Object.values(this.fixture.availableChannels)) {
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
     * @param {'fixture' | 'channel'} objectName The object to save.
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
      catch {
        this.restoredData = undefined;
        this.restoreComplete();
        return;
      }

      console.log(`restore`, structuredClone(this.restoredData));
    },

    /**
     * Called from restore dialog (via an event) after the restored data are either applied or discarded.
     */
    restoreComplete() {
      this.readyToAutoSave = true;
      this.$root._oflRestoreComplete = true;
      window.scrollTo(0, 0);
    },

    applyQueryPrefillData() {
      if (!this.$route.query.prefill) {
        return;
      }

      try {
        const prefillObject = JSON.parse(this.$route.query.prefill);
        for (const key of Object.keys(prefillObject)) {
          if (isPrefillable(prefillObject, key)) {
            this.fixture[key] = prefillObject[key];
          }
        }
      }
      catch (parseError) {
        console.log(`prefill query could not be parsed:`, this.$route.query.prefill, parseError);
      }
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

    async reset() {
      this.fixture = getEmptyFixture();
      this.channel = getEmptyChannel();
      this.honeypot = ``;
      this.applyStoredPrefillData();

      this.$router.push({
        path: this.$route.path,
        query: {}, // clear prefill query
      });

      await this.$nextTick();

      this.formstate._reset();
      this.$refs.existingManufacturerSelect.focus();
      window.scrollTo(0, 0);
    },
  },
};

/**
 * @param {object} prefillObject The object supplied in the page query.
 * @param {string} key The key to check.
 * @returns {boolean} True if the value prefillObject[key] is prefillable, false otherwise.
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
