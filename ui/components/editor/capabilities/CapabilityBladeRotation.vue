<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-blade`"
      label="Blade">
      <PropertyInputEntity
        v-model="capability.typeData.blade"
        :name="`capability${capability.uuid}-blade`"
        :schema-property="bladeSchema"
        required />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-angle`"
      label="Angle">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        required
        property-name="angle" />
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
import { capabilityTypes, schemaDefinitions } from '~~/lib/schema-properties.js';

interface Props {
  capability: {
    uuid: string;
    typeData: {
      blade?: string;
      angle?: string | null;
      angleStart?: string;
      angleEnd?: string;
      comment?: string;
    };
  };
  formstate?: object;
}

defineProps<Props>();

const bladeSchema = capabilityTypes.BladeInsertion.properties.blade;

const defaultData = {
  blade: '',
  angle: null,
  angleStart: '0deg',
  angleEnd: '360deg',
  comment: '',
};
</script>
