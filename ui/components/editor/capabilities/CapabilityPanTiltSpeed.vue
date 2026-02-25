<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-${capability.typeData.speedOrDuration}`">

      <template #label>
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

      <EditorProportionalPropertySwitcher
        v-if="capability.typeData.speedOrDuration"
        ref="speedOrDurationInput"
        :capability="capability"
        :formstate="formstate"
        :property-name="capability.typeData.speedOrDuration"
        required />

    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      :name="`capability${capability.uuid}-comment`"
      label="Comment">
      <PropertyInputText
        v-model="capability.typeData.comment"
        :formstate="formstate"
        :name="`capability${capability.uuid}-comment`"
        :schema-property="schemaDefinitions.nonEmptyString" />
    </LabeledInput>

  </div>
</template>

<script>
import { objectProp } from 'vue-ts-types';
import { schemaDefinitions } from '../../../../lib/schema-properties.js';

import LabeledInput from '../../LabeledInput.vue';
import PropertyInputText from '../../PropertyInputText.vue';
import EditorProportionalPropertySwitcher from '../EditorProportionalPropertySwitcher.vue';

export default {
  components: {
    EditorProportionalPropertySwitcher,
    LabeledInput,
    PropertyInputText,
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional,
  },
  data() {
    return {
      schemaDefinitions,

      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        speedOrDuration: `speed`,
        speed: null,
        speedStart: `fast`,
        speedEnd: `slow`,
        duration: ``,
        durationStart: null,
        durationEnd: null,
        comment: ``,
      },
    };
  },
  computed: {
    /**
     * Called from {@link EditorCapabilityTypeData}
     * @public
     * @returns {string[]} Array of all props to reset to default data when capability is saved.
     */
    resetProperties() {
      const resetProperty = this.capability.typeData.speedOrDuration === `duration` ? `speed` : `duration`;

      return [resetProperty, `${resetProperty}Start`, `${resetProperty}End`];
    },
  },
  methods: {
    async changeSpeedOrDuration(newValue) {
      this.capability.typeData.speedOrDuration = newValue;

      await this.$nextTick();
      this.$refs.speedOrDurationInput.focus();
    },
  },
};
</script>
