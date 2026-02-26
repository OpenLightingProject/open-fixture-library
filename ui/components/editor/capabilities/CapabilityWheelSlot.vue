<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-slotNumber`"
      label="Slot number"
      hint="Use 1.5 to indicate a wheel position halfway between slots 1 and 2."
      style="display: inline-block; margin-bottom: 12px;">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        required
        property-name="slotNumber" />
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
  comment: '',
};
</script>
