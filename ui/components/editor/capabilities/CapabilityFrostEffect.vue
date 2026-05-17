<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      :name="`capability${capability.uuid}-effectName`"
      label="Effect name">
      <PropertyInputText
        v-model="capability.typeData.effectName"
        :formstate="formstate"
        :name="`capability${capability.uuid}-effectName`"
        :schema-property="schemaDefinitions.nonEmptyString"
        required />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-speed`"
      label="Speed">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
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
      effectName?: string;
      speed?: string;
      speedStart?: string | null;
      speedEnd?: string | null;
      comment?: string;
    };
  };
  formstate?: object;
}

defineProps<Props>();

const hint = `This capability enables a non-static frost effect, e.g. pulse. Use the Frost type instead if a static frost intensity can be chosen.`;

const defaultData = {
  effectName: '',
  speed: '',
  speedStart: null,
  speedEnd: null,
  comment: '',
};
</script>
