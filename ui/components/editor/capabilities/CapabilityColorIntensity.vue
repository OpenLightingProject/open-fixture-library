<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      :name="`capability${capability.uuid}-color`"
      label="Color">
      <select
        v-model="capability.typeData.color"
        :class="{ empty: capability.typeData.color === `` }"
        :name="`capability${capability.uuid}-color`"
        required>

        <option value="" disabled>Please select a color</option>
        <option
          v-for="color of colors"
          :key="color"
          :value="color">{{ color }}</option>

      </select>
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-brightness`"
      label="Brightness">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        required
        property-name="brightness" />
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
      color?: string;
      brightness?: string | null;
      brightnessStart?: string;
      brightnessEnd?: string;
      comment?: string;
    };
  };
  formstate?: object;
}

defineProps<Props>();

const colors = capabilityTypes.ColorIntensity.properties.color.enum;

const defaultData = {
  color: '',
  brightness: null,
  brightnessStart: 'off',
  brightnessEnd: 'bright',
  comment: '',
};
</script>
