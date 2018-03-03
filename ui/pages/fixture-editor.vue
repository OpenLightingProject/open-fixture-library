<template>
  <div id="fixture-editor">
    <h1>Fixture Editor</h1>

    <noscript>Please enable JavaScript to use the Fixture Editor!</noscript>

    <vue-form
      action="#"
      :state="formstate"
      class="only-js"
      @submit.prevent="onSubmit">

      <section class="manufacturer card">
        <h2>Manufacturer</h2>

        <section v-if="fixture.useExistingManufacturer">
          <app-simple-label name="manufacturerShortName" label="Choose from list" :formstate="formstate">
            <select
              required
              v-model="fixture.manufacturerShortName"
              :class="{ empty: fixture.manufacturerShortName === `` }"
              name="manufacturerShortName"
              ref="existingManufacturerSelect">

              <option value="">Please select a manufacturer</option>

              <template v-for="(manufacturer, manKey) in manufacturers">
                <option :key="manKey" v-if="manKey !== `$schema`" :value="manKey">
                  {{ manufacturer.name }}
                </option>
              </template>

            </select>
          </app-simple-label>

          <div class="button-bar">or <a href="#add-new-manufacturer" @click.prevent="switchManufacturer(false)">add a new manufacturer</a></div>
        </section>

        <div v-else>
          <app-simple-label name="new-manufacturer-name" label="Name" :formstate="formstate">
            <app-property-input-text
              name="new-manufacturer-name"
              v-model="fixture.newManufacturerName"
              :schema-property="properties.manufacturer.name"
              :required="true"
              ref="newManufacturerNameInput" />
          </app-simple-label>

          <app-simple-label name="new-manufacturer-shortName" label="Unique short name" :formstate="formstate">
            <app-property-input-text
              name="new-manufacturer-shortName"
              v-model="fixture.newManufacturerShortName"
              :schema-property="properties.manufacturerKey"
              :required="true"
              title="Use only lowercase letters, numbers and dashes." />
          </app-simple-label>

          <app-simple-label name="new-manufacturer-website" label="Website" :formstate="formstate">
            <app-property-input-text
              type="url"
              name="new-manufacturer-website"
              v-model="fixture.newManufacturerWebsite"
              :schema-property="properties.manufacturer.website" />
          </app-simple-label>

          <app-simple-label name="new-manufacturer-comment" label="Comment" :formstate="formstate">
            <app-property-input-textarea
              name="new-manufacturer-comment"
              v-model="fixture.newManufacturerComment"
              :schema-property="properties.manufacturer.comment" />
          </app-simple-label>

          <app-simple-label name="new-manufacturer-rdmId" label="<abbr title='Remote Device Management'>RDM</abbr> ID" :formstate="formstate">
            <app-property-input-number
              type="number"
              name="new-manufacturer-rdmId"
              v-model="fixture.newManufacturerRdmId"
              :schema-property="properties.manufacturer.rdmId" />
          </app-simple-label>

          <div class="button-bar">or <a href="#use-existing-manufacturer" @click.prevent="switchManufacturer(true)">choose an existing manufacturer</a></div>
        </div>
      </section>

      <section class="fixture-info card">
        <h2>Fixture info</h2>

        <!-- TODO: validate name not containing manufacturer name -->
        <app-simple-label name="fixture-name" label="Name" :formstate="formstate">
          <app-property-input-text
            name="fixture-name"
            v-model="fixture.name"
            :schema-property="properties.fixture.name"
            :required="true" />
        </app-simple-label>

        <app-simple-label name="fixture-shortName" label="Unique short name" :formstate="formstate">
          <app-property-input-text
            name="fixture-shortName"
            v-model="fixture.shortName"
            :schema-property="properties.fixture.shortName"
            hint="defaults to name" />
        </app-simple-label>

        <app-simple-label
          name="fixture-categories"
          label="Categories"
          hint="Select and reorder all applicable categories, the most suitable first."
          :formstate="formstate">
          <app-category-chooser
            name="fixture-categories"
            categories-not-empty
            :all-categories="properties.fixture.categories.items.enum"
            v-model="fixture.categories" />
        </app-simple-label>

        <app-simple-label name="comment" label="Comment" :formstate="formstate">
          <app-property-input-textarea
            name="comment"
            v-model="fixture.comment"
            :schema-property="properties.fixture.comment" />
        </app-simple-label>

        <app-simple-label name="manualURL" label="Manual URL" :formstate="formstate">
          <app-property-input-text
            type="url"
            name="manualURL"
            v-model="fixture.manualURL"
            :schema-property="properties.fixture.manualURL" />
        </app-simple-label>

        <app-simple-label
          name="rdmModelId"
          label="<abbr title='Remote Device Management'>RDM</abbr> model ID"
          hint="The RDM manufacturer ID is saved per manufacturer."
          :formstate="formstate">
          <app-property-input-number
            type="number"
            name="rdmModelId"
            v-model="fixture.rdmModelId"
            :schema-property="properties.fixture.rdm.properties.modelId" />
        </app-simple-label>

        <app-simple-label
          v-if="fixture.rdmModelId !== null"
          name="rdmSoftwareVersion"
          label="RDM software version"
          :formstate="formstate">
          <app-property-input-text
            name="rdmSoftwareVersion"
            v-model="fixture.rdmSoftwareVersion"
            :schema-property="properties.fixture.rdm.properties.softwareVersion" />
        </app-simple-label>
      </section>

      <section class="physical card">
        <h2>Physical data</h2>
        <app-editor-physical
          v-model="fixture.physical"
          :formstate="formstate"
          name-prefix="fixture" />
      </section>

      <section class="fixture-modes">
        <app-mode
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

        <app-simple-label name="author" label="Your name" :formstate="formstate">
          <app-property-input-text
            name="author"
            v-model="fixture.metaAuthor"
            :schema-property="properties.definitions.nonEmptyString"
            :required="true"
            hint="e.g. Anonymous" />
        </app-simple-label>

        <app-simple-label
          name="github-username"
          label="GitHub username"
          hint="If you want to be mentioned in the pull request."
          :formstate="formstate">
          <app-property-input-text
            name="github-username"
            v-model="fixture.metaGithubUsername"
            :schema-property="properties.definitions.nonEmptyString" />
        </app-simple-label>

        <app-simple-label
          hidden
          name="honeypot"
          label="Ignore this!"
          :formstate="formstate">
          <app-property-input-text
            name="honeypot"
            v-model="honeypot"
            :schema-property="properties.definitions.nonEmptyString"
            hint="Spammers are likely to fill this field. Leave it empty to show that you're a human." />
        </app-simple-label>
      </section>

      <div class="button-bar right">
        <button type="submit" class="save-fixture primary">Create fixture</button>
      </div>

    </vue-form>

    <app-editor-channel-dialog
      v-model="channel"
      :fixture="fixture"
      @reset-channel="resetChannel" />
  </div>
</template>

<style lang="scss" scoped>
.add-mode-link {
  text-align: center;
}
</style>


<script>
import uuidV4 from 'uuid/v4.js';

import manufacturers from '~~/fixtures/manufacturers.json';
import schemaProperties from '~~/lib/schema-properties.js';

import simpleLabelVue from '~/components/simple-label.vue';
import propertyInputBooleanVue from '~/components/property-input-boolean.vue';
import propertyInputNumberVue from '~/components/property-input-number.vue';
import propertyInputSelectVue from '~/components/property-input-select.vue';
import propertyInputTextVue from '~/components/property-input-text.vue';
import propertyInputTextareaVue from '~/components/property-input-textarea.vue';
import categoryChooserVue from '~/components/category-chooser.vue';
import editorPhysicalVue from '~/components/editor-physical.vue';
import editorModeVue from '~/components/editor-mode.vue';
import editorChannelDialogVue from '~/components/editor-channel-dialog.vue';

export default {
  components: {
    'app-simple-label': simpleLabelVue,
    'app-property-input-boolean': propertyInputBooleanVue,
    'app-property-input-number': propertyInputNumberVue,
    'app-property-input-select': propertyInputSelectVue,
    'app-property-input-text': propertyInputTextVue,
    'app-property-input-textarea': propertyInputTextareaVue,
    'app-category-chooser': categoryChooserVue,
    'app-editor-physical': editorPhysicalVue,
    'app-mode': editorModeVue,
    'app-editor-channel-dialog': editorChannelDialogVue
  },
  head() {
    return {
      title: `Fixture Editor`
    };
  },
  data() {
    const initFixture = getEmptyFixture();

    // TODO: make this work
    // if ('oflPrefill' in window) {
    //   Object.keys(window.oflPrefill).forEach(function(key) {
    //     if (typeof initFixture[key] !== 'object') {
    //       initFixture[key] = window.oflPrefill[key];
    //     }
    //   });
    // }

    return {
      formstate: {},
      fixture: initFixture,
      channel: getEmptyChannel(),
      honeypot: ``,
      manufacturers,
      properties: schemaProperties
    };
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

        // remove channel reference from mode
        mode.channels.splice(mode.channels.indexOf(channelUuid), 1);
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

    onSubmit() {
      console.log(`submit`, this.fixture);
    }
  }
};


/**
 * @returns {!object} An empty fixture object.
 */
function getEmptyFixture() {
  return {
    key: `[new]`,
    useExistingManufacturer: true,
    manufacturerShortName: ``,
    newManufacturerName: ``,
    newManufacturerShortName: ``,
    newManufacturerWebsite: ``,
    newManufacturerComment: ``,
    newManufacturerRdmId: null,
    name: ``,
    shortName: ``,
    categories: [],
    comment: ``,
    manualURL: ``,
    rdmModelId: null,
    rdmSoftwareVersion: ``,
    physical: getEmptyPhysical(),
    modes: [getEmptyMode()],
    metaAuthor: ``,
    metaGithubUsername: ``,
    availableChannels: {}
  };
}

/**
 * @returns {!object} An empty fixture's or mode's physical object.
 */
function getEmptyPhysical() {
  return {
    dimensions: null,
    weight: null,
    power: null,
    DMXconnector: ``,
    DMXconnectorNew: ``,
    bulb: {
      type: ``,
      colorTemperature: null,
      lumens: null
    },
    lens: {
      name: ``,
      degreesMinMax: null
    },
    focus: {
      type: ``,
      typeNew: ``,
      panMax: null,
      tiltMax: null
    }
  };
}

/**
 * @returns {!object} An empty mode object.
 */
function getEmptyMode() {
  return {
    uuid: uuidV4(),
    name: ``,
    shortName: ``,
    rdmPersonalityIndex: null,
    enablePhysicalOverride: false,
    physical: getEmptyPhysical(),
    channels: []
  };
}

/**
 * @returns {!object} An empty channel object.
 */
function getEmptyChannel() {
  return {
    uuid: uuidV4(),
    editMode: ``,
    modeId: ``,
    name: ``,
    type: ``,
    color: ``,
    fineness: 0,
    defaultValue: null,
    highlightValue: null,
    invert: null,
    constant: null,
    crossfade: null,
    precedence: ``,
    capFineness: 0,
    wizard: {
      show: false,
      start: 0,
      width: 10,
      count: 3,
      templateName: `Function #`
    },
    capabilities: [getEmptyCapability()]
  };
}

/**
 * @param {!string} coarseChannelId The UUID of the coarse channel.
 * @param {!number} fineness The fineness of the newly created fine channel.
 * @returns {!object} An empty fine channel object for the given coarse channel.
 */
function getEmptyFineChannel(coarseChannelId, fineness) {
  return {
    uuid: uuidV4(),
    coarseChannelId: coarseChannelId,
    fineness: fineness
  };
}

/**
 * @returns {!object} An empty capability object.
 */
function getEmptyCapability() {
  return {
    uuid: uuidV4(),
    range: null,
    name: ``,
    color: ``,
    color2: ``
  };
}

/**
 * @param {!object} channel The channel object that shall be sanitized.
 * @returns {!object} A clone of the channel object without properties that are just relevant for displaying it in the channel dialog.
 */
function getSanitizedChannel(channel) {
  const retChannel = this.clone(channel);
  delete retChannel.editMode;
  delete retChannel.modeId;
  delete retChannel.wizard;

  return retChannel;
}

/**
 * @param {!object} cap The capability object.
 * @returns {!boolean} False if the capability object is still empty / unchanged, true otherwise.
 */
function isCapabilityChanged(cap) {
  return Object.keys(cap).some(prop => {
    if (prop === `uuid`) {
      return false;
    }
    return cap[prop] !== ``;
  });
}

/**
 * @param {*} obj The object / array / ... to clone. Note: only JSON-stringifiable objects / properties are cloneable, i.e. no functions.
 * @returns {*} A deep clone.
 */
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

</script>
