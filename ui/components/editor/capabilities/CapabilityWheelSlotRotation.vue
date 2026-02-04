<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-slotNumber`"
      label="Slot number"
      hint="Leave the slot number empty if this capability doesn't select a wheel slot, but only activates wheel slot rotation for a WheelSlot capability in another channel. Use 1.5 to indicate a wheel position halfway between slots 1 and 2."
      style="display: inline-block; margin-bottom: 12px;">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        property-name="slotNumber" />
    </LabeledInput>

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

    <EditorWheelSlots
      :channel="channel"
      :capability="capability"
      :formstate="formstate" />

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
import EditorWheelSlots from '../EditorWheelSlots.vue';

export default {
  components: {
    EditorProportionalPropertySwitcher,
    EditorWheelSlots,
    LabeledInput,
    PropertyInputText,
  },
  props: {
    capability: objectProp().required,
    channel: objectProp().required,
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
        slotNumber: ``,
        slotNumberStart: null,
        slotNumberEnd: null,
        speedOrAngle: `speed`,
        speed: ``,
        speedStart: null,
        speedEnd: null,
        angle: ``,
        angleStart: null,
        angleEnd: null,
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
