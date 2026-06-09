<template>
  <div class="wheel-slot-type-data">

    <LabeledInput
      :formstate="formstate"
      :name="`wheel-slot${wheelSlot.uuid}-name`"
      label="Color name">
      <PropertyInputText
        v-model="wheelSlot.typeData.name"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-name`"
        :schema-property="schemaDefinitions.nonEmptyString" />
    </LabeledInput>

    <LabeledInput
      label="Color hex code(s)"
      :formstate="formstate"
      :name="`wheel-slot${wheelSlot.uuid}-colorsHexString`">
      <PropertyInputText
        v-model="wheelSlot.typeData.colorsHexString"
        :name="`wheel-slot${wheelSlot.uuid}-colorsHexString`"
        :schema-property="schemaDefinitions.nonEmptyString"
        valid-color-hex-list />
    </LabeledInput>

    <LabeledInput v-if="colorPreview !== null" label="Color preview">
      <OflSvg
        v-for="color of colorPreview"
        :key="color"
        :colors="[color]"
        type="color-circle" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`wheel-slot${wheelSlot.uuid}-colorTemperature`"
      label="Color temperature">
      <PropertyInputEntity
        v-model="wheelSlot.typeData.colorTemperature"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-colorTemperature`"
        :schema-property="entitiesSchema.colorTemperature" />
    </LabeledInput>

  </div>
</template>

<script setup lang="ts">
import { entitiesSchema, schemaDefinitions } from '~~/lib/schema-properties.js';
import { colorsHexStringToArray } from '@/assets/scripts/editor-utilities.js';
import { ref, watch } from 'vue';

interface Props {
  wheelSlot: {
    uuid: string;
    typeData: {
      name?: string;
      colors?: string[] | null;
      colorsHexString?: string;
      colorTemperature?: string;
    };
  };
  formstate?: object;
}

const props = defineProps<Props>();

const defaultData = {
  name: '',
  colors: null,
  colorsHexString: '',
  colorTemperature: '',
};

const colorPreview = ref<string[] | null>(null);

watch(
  () => props.wheelSlot.typeData.colorsHexString,
  (hexString) => {
    props.wheelSlot.typeData.colors = colorsHexStringToArray(hexString);
    colorPreview.value = props.wheelSlot.typeData.colors;
  },
  { immediate: true }
);
</script>
