<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-slotNumber`"
      label="Slot number"
      hint="Leave the slot number empty if this capability doesn't select a wheel slot, but only activates wheel shaking for a WheelSlot capability in another channel. Use 1.5 to indicate a wheel position halfway between slots 1 and 2."
      style="display: inline-block; margin-bottom: 12px;">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        property-name="slotNumber" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-shakeSpeed`"
      label="Shake speed">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        property-name="shakeSpeed" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-shakeAngle`"
      label="Shake angle">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        property-name="shakeAngle" />
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

<script setup lang="ts">
import { schemaDefinitions } from '~~/lib/schema-properties.js';

interface Props {
  capability: {
    uuid: string;
    typeData: {
      slotNumber?: string;
      slotNumberStart?: string | null;
      slotNumberEnd?: string | null;
      shakeSpeed?: string;
      shakeSpeedStart?: string | null;
      shakeSpeedEnd?: string | null;
      shakeAngle?: string;
      shakeAngleStart?: string | null;
      shakeAngleEnd?: string | null;
      comment?: string;
    };
  };
  channel: {
    capabilities?: any[];
  };
  formstate?: object;
}

defineProps<Props>();

const defaultData = {
  slotNumber: '',
  slotNumberStart: null,
  slotNumberEnd: null,
  shakeSpeed: '',
  shakeSpeedStart: null,
  shakeSpeedEnd: null,
  shakeAngle: '',
  shakeAngleStart: null,
  shakeAngleEnd: null,
  comment: '',
};
</script>
