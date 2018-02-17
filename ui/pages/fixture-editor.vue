<template>
  <div id="fixture-editor">
    <h1>Fixture Editor</h1>

    <noscript>Please enable JavaScript to use the Fixture Editor!</noscript>

    <form
      action="#"
      id="fixture-form"
      data-validate
      class="only-js">

      <section class="manufacturer card">
        <h2>Manufacturer</h2>

        <section v-if="fixture.useExistingManufacturer">
          <app-simple-label label="Choose from list">
            <select
              required
              v-model="fixture.manufacturerShortName"
              :class="{ empty: fixture.manufacturerShortName === '' }"
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
          <section class="new-manufacturer-name">
            <app-simple-label label="Name">
              <app-property-input
                type="text"
                v-model="fixture.newManufacturerName"
                :schema-property="properties.manufacturer.name"
                :required="true"
                ref="newManufacturerNameInput" />
            </app-simple-label>
          </section>

          <section class="new-manufacturer-shortName">
            <app-simple-label label="Unique short name">
              <app-property-input
                type="text"
                v-model="fixture.newManufacturerShortName"
                :schema-property="properties.manufacturerKey"
                :required="true"
                title="Use only lowercase letters, numbers and dashes." />
            </app-simple-label>
          </section>

          <section class="new-manufacturer-website">
            <app-simple-label label="Website">
              <app-property-input
                type="url"
                v-model="fixture.newManufacturerWebsite"
                :schema-property="properties.manufacturer.website" />
            </app-simple-label>
          </section>

          <section class="new-manufacturer-comment">
            <app-simple-label label="Comment">
              <app-property-input
                type="textarea"
                v-model="fixture.newManufacturerComment"
                :schema-property="properties.manufacturer.comment" />
            </app-simple-label>
          </section>

          <section class="new-manufacturer-rdmId">
            <app-simple-label label="<abbr title='Remote Device Management'>RDM</abbr> ID">
              <app-property-input
                type="number"
                v-model="fixture.newManufacturerRdmId"
                :schema-property="properties.manufacturer.rdmId" />
            </app-simple-label>
          </section>

          <div class="button-bar">or <a href="#use-existing-manufacturer" @click.prevent="switchManufacturer(true)">choose an existing manufacturer</a></div>
        </div>
      </section>

      <section class="fixture-info card">
        <h2>Fixture info</h2>

        <section class="fixture-name">
          <app-simple-label label="Name">
            <app-property-input
              type="text"
              v-model="fixture.name"
              :schema-property="properties.fixture.name"
              :required="true" />
          </app-simple-label>
        </section>

        <section class="fixture-shortName">
          <app-simple-label label="Unique short name">
            <app-property-input
              type="text"
              v-model="fixture.shortName"
              :schema-property="properties.fixture.shortName"
              hint="defaults to name" />
          </app-simple-label>
        </section>

        <section class="categories validate-group">
          <span class="label">Categories</span>
          <span class="value">
            <app-category-chooser
              :all-categories="properties.fixture.categories.items.enum"
              v-model="fixture.categories" />
          </span>
        </section>
      </section>

    </form>
  </div>
</template>

<script>
import uuidV4 from 'uuid/v4.js';

import manufacturers from '~~/fixtures/manufacturers.json';
import schemaProperties from '~~/lib/schema-properties.js';

import simpleLabelVue from '~/components/simple-label.vue';
import propertyInputVue from '~/components/property-input.vue';
import categoryChooserVue from '~/components/category-chooser.vue';

export default {
  components: {
    'app-simple-label': simpleLabelVue,
    'app-property-input': propertyInputVue,
    'app-category-chooser': categoryChooserVue
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
      fixture: initFixture,
      manufacturers,
      properties: schemaProperties
    };
  },
  computed: {},
  methods: {
    switchManufacturer(useExisting) {
      this.fixture.useExistingManufacturer = useExisting;
      this.$nextTick(() => {
        this.$refs[useExisting ? `existingManufacturerSelect` : `newManufacturerNameInput`].focus();
      });
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
    newManufacturerRdmId: ``,
    name: ``,
    shortName: ``,
    categories: [],
    comment: ``,
    manualURL: ``,
    rdmModelId: ``,
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
    dimensionsWidth: ``,
    dimensionsHeight: ``,
    dimensionsDepth: ``,
    weight: ``,
    power: ``,
    DMXconnector: ``,
    DMXconnectorNew: ``,
    bulb: {
      type: ``,
      colorTemperature: ``,
      lumens: ``
    },
    lens: {
      name: ``,
      degreesMin: ``,
      degreesMax: ``
    },
    focus: {
      type: ``,
      typeNew: ``,
      panMax: ``,
      tiltMax: ``
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
    rdmPersonalityIndex: ``,
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
    defaultValue: ``,
    highlightValue: ``,
    invert: ``,
    constant: ``,
    crossfade: ``,
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
    start: ``,
    end: ``,
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
