<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-speed`"
      label="Speed">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        required
        property-name="speed" />
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
      speed?: string | null;
      speedStart?: string;
      speedEnd?: string;
      comment?: string;
    };
  };
  formstate?: object;
}

defineProps<Props>();

const hint = 'Only use this if no other type is applicable. Note that some types like Effect, PanContinuous or Rotation also allow setting a speed value.';

const defaultData = {
  speed: null,
  speedStart: 'slow',
  speedEnd: 'fast',
  comment: '',
};
</script>
