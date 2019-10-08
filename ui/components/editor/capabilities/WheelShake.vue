<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`capability${capability.uuid}-slotNumber`"
      label="Slot number"
      hint="Leave the slot number empty if this capability doesn't select a wheel slot, but only activates wheel shaking for a WheelSlot capability in another channel."
      style="display: inline-block; margin-bottom: 12px;">
      <ProportionalCapabilityDataSwitcher
        :capability="capability"
        :formstate="formstate"
        property-name="slotNumber" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`capability${capability.uuid}-shakeSpeed`"
      label="Shake speed">
      <ProportionalCapabilityDataSwitcher
        :capability="capability"
        :formstate="formstate"
        property-name="shakeSpeed" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`capability${capability.uuid}-shakeAngle`"
      label="Shake angle">
      <ProportionalCapabilityDataSwitcher
        :capability="capability"
        :formstate="formstate"
        property-name="shakeAngle" />
    </LabeledInput>

    <WheelSlots
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
        :schema-property="properties.definitions.nonEmptyString" />
    </LabeledInput>

  </div>
</template>

<script>
import schemaProperties from '../../../../lib/schema-properties.js';

import ProportionalCapabilityDataSwitcher from '../ProportionalCapabilityDataSwitcher.vue';
import WheelSlots from '../EditorWheelSlots.vue';
import PropertyInputText from '../PropertyInputText.vue';
import LabeledInput from '../../LabeledInput.vue';

export default {
  components: {
    ProportionalCapabilityDataSwitcher,
    WheelSlots,
    PropertyInputText,
    LabeledInput
  },
  props: {
    capability: {
      type: Object,
      required: true
    },
    channel: {
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
        slotNumber: ``,
        slotNumberStart: null,
        slotNumberEnd: null,
        shakeSpeed: ``,
        shakeSpeedStart: null,
        shakeSpeedEnd: null,
        shakeAngle: ``,
        shakeAngleStart: null,
        shakeAngleEnd: null,
        comment: ``
      }
    };
  }
};
</script>
