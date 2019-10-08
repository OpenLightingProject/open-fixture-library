<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      :multiple-inputs="true"
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

      <ProportionalCapabilityDataSwitcher
        v-if="capability.typeData.speedOrDuration"
        ref="speedOrDurationInput"
        :capability="capability"
        :formstate="formstate"
        :property-name="capability.typeData.speedOrDuration"
        :required="true" />

    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      :name="`capability${capability.uuid}-comment`"
      label="Comment">
      <PropertyInputText
        v-model="capability.typeData.comment"
        :formstate="formstate"
        :name="`capability${capability.uuid}-comment`"
        :schema-property="properties.definitions.nonEmptyString" />
    </LabeledInput>

  </div>
</template>

<script>
import schemaProperties from '../../../../lib/schema-properties.js';

import ProportionalCapabilityDataSwitcher from '../ProportionalCapabilityDataSwitcher.vue';
import PropertyInputText from '../PropertyInputText.vue';
import LabeledInput from '../../LabeledInput.vue';

export default {
  components: {
    ProportionalCapabilityDataSwitcher,
    PropertyInputText,
    LabeledInput
  },
  props: {
    capability: {
      type: Object,
      required: true
    },
    formstate: {
      type: Object,
      required: false,
      default: null
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
    },
    resetProps() {
      const resetProp = this.capability.typeData.speedOrDuration === `duration` ? `speed` : `duration`;

      return [resetProp, `${resetProp}Start`, `${resetProp}End`];
    }
  },
  methods: {
    changeSpeedOrDuration(newValue) {
      this.capability.typeData.speedOrDuration = newValue;
      this.$nextTick(() => this.$refs.speedOrDurationInput.focus());
    }
  }
};
</script>
