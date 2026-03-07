<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-soundSensitivity`"
      label="Sound sensitivity">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        required
        property-name="soundSensitivity" />
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
      soundSensitivity?: string | null;
      soundSensitivityStart?: string;
      soundSensitivityEnd?: string;
      comment?: string;
    };
  };
  formstate?: object;
}

defineProps<Props>();

const hint = `Doesn't activate sound controlled mode (use Effect for this), only controls the microphone sensitivity.`;

const defaultData = {
  soundSensitivity: null,
  soundSensitivityStart: 'low',
  soundSensitivityEnd: 'high',
  comment: '',
};
</script>
