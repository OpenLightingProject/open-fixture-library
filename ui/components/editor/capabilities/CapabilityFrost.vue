<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-frostIntensity`"
      label="Frost intensity">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        required
        property-name="frostIntensity" />
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

<script setup lang="ts">
import { schemaDefinitions } from '~~/lib/schema-properties.js';

interface Props {
  capability: {
    uuid: string;
    typeData: {
      frostIntensity?: string | null;
      frostIntensityStart?: string;
      frostIntensityEnd?: string;
      comment?: string;
    };
  };
  formstate?: object;
}

defineProps<Props>();

const defaultData = {
  frostIntensity: null,
  frostIntensityStart: 'off',
  frostIntensityEnd: 'high',
  comment: '',
};
</script>
