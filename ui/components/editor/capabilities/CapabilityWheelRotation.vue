<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-${capability.typeData.speedOrAngle}`">

      <template #label>
        <template v-if="capability.typeData.speedOrAngle === `speed`">
          Speed / <a
            href="#angle"
            class="button secondary inline"
            title="Specify angle instead of speed"
            @click.prevent="changeSpeedOrAngle(`angle`)">Angle</a>
        </template>
        <template v-else>
          Angle / <a
            href="#speed"
            class="button secondary inline"
            title="Specify speed instead of angle"
            @click.prevent="changeSpeedOrAngle(`speed`)">Speed</a>
        </template>
      </template>

      <EditorProportionalPropertySwitcher
        v-if="capability.typeData.speedOrAngle"
        ref="speedOrAngleInput"
        :capability="capability"
        :formstate="formstate"
        :property-name="capability.typeData.speedOrAngle"
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
      hint: `Rotation of the whole wheel (i.e. over all wheel slots). Use WheelSlotRotation if only the slot itself (e.g. a Gobo) rotates in this capability. If the fixture doesn't have a physical color wheel, use Effect with ColorFade/ColorJump preset instead.`,

      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        speedOrAngle: `speed`,
        speed: null,
        speedStart: `slow CW`,
        speedEnd: `fast CW`,
        angle: null,
        angleStart: `0deg`,
        angleEnd: `360deg`,
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
      const resetProperty = this.capability.typeData.speedOrAngle === `speed` ? `angle` : `speed`;

      return [resetProperty, `${resetProperty}Start`, `${resetProperty}End`];
    },
  },
  methods: {
    async changeSpeedOrAngle(newValue) {
      this.capability.typeData.speedOrAngle = newValue;

      await this.$nextTick();
      this.$refs.speedOrAngleInput.focus();
    },
  },
};
</script>
