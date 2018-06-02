<template>
  <div class="capability-type-data">

    <app-simple-label
      :formstate="formstate"
      :name="`capability${capability.uuid}-${capability.typeData.speedOrDuration}`">

      <template slot="label">
        <template v-if="capability.typeData.speedOrDuration === `duration`">
          Duration / <a
            href="#speed"
            class="button secondary inline"
            title="Specify speed instead of duration"
            @click.prevent="changeSpeedOrDuration(`speed`)">Speed</a>
        </template>
        <template v-else>
          Speed / <a
            href="#duration"
            class="button secondary inline"
            title="Specify duration instead of speed"
            @click.prevent="changeSpeedOrDuration(`duration`)">Duration</a>
        </template>
      </template>

      <app-editor-proportional-capability-data-switcher
        v-if="capability.typeData.speedOrDuration"
        ref="speedOrDurationInput"
        :capability="capability"
        :formstate="formstate"
        :property-name="capability.typeData.speedOrDuration" />

    </app-simple-label>

    <app-simple-label
      :formstate="formstate"
      :name="`capability${capability.uuid}-comment`"
      label="Comment">
      <app-property-input-text
        v-model="capability.typeData.comment"
        :formstate="formstate"
        :name="`capability${capability.uuid}-comment`"
        :schema-property="properties.definitions.nonEmptyString" />
    </app-simple-label>

  </div>
</template>

<script>
import schemaProperties from '~~/lib/schema-properties.js';

import editorProportionalCapabilityDataSwitcher from '~/components/editor-proportional-capability-data-switcher.vue';
import propertyInputTextVue from '~/components/property-input-text.vue';
import simpleLabelVue from '~/components/simple-label.vue';

export default {
  components: {
    'app-editor-proportional-capability-data-switcher': editorProportionalCapabilityDataSwitcher,
    'app-property-input-text': propertyInputTextVue,
    'app-simple-label': simpleLabelVue
  },
  props: {
    capability: {
      type: Object,
      required: true
    },
    formstate: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      properties: schemaProperties,
      defaultData: {
        speedOrDuration: `speed`,
        speed: null,
        speedStart: `fast`,
        speedEnd: `slow`,
        duration: ``,
        durationStart: null,
        durationEnd: null,
        comment: ``
      }
    };
  },
  computed: {
    shutterEffects() {
      return this.properties.capabilityTypes.ShutterStrobe.properties.shutterEffect.enum;
    }
  },
  methods: {
    changeSpeedOrDuration(newValue) {
      this.capability.typeData.speedOrDuration = newValue;
      this.$nextTick(() => this.$refs.speedOrDurationInput.focus());
    },
    cleanCapabilityData() {
      const resetProp = this.capability.typeData.speedOrDuration === `duration` ? `speed` : `duration`;

      this.capability.typeData[resetProp] = this.defaultData[resetProp];
      this.capability.typeData[`${resetProp}Start`] = this.defaultData[`${resetProp}Start`];
      this.capability.typeData[`${resetProp}End`] = this.defaultData[`${resetProp}End`];
    }
  }
};
</script>
