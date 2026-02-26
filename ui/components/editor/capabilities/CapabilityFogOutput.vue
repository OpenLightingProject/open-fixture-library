<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-fogOutput`"
      label="Fog output">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        required
        property-name="fogOutput" />
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
      fogOutput?: string | null;
      fogOutputStart?: string;
      fogOutputEnd?: string;
      comment?: string;
    };
  };
  formstate?: object;
}

defineProps<Props>();

const hint = `Doesn't activate fog, only controls the intensity of the fog output.`;

const defaultData = {
  fogOutput: null,
  fogOutputStart: 'weak',
  fogOutputEnd: 'strong',
  comment: '',
};
</script>
