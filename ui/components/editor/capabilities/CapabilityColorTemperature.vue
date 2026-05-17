<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-colorTemperature`"
      label="Color temperature">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        required
        property-name="colorTemperature" />
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
      colorTemperature?: string | null;
      colorTemperatureStart?: string;
      colorTemperatureEnd?: string;
      comment?: string;
    };
  };
  formstate?: object;
}

defineProps<Props>();

const defaultData = {
  colorTemperature: null,
  colorTemperatureStart: '',
  colorTemperatureEnd: '',
  comment: '',
};
</script>
