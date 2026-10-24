<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      :name="`capability${capability.uuid}-comment`"
      label="Color preset name">
      <PropertyInputText
        v-model="capability.typeData.comment"
        :formstate="formstate"
        :name="`capability${capability.uuid}-comment`"
        :schema-property="schemaDefinitions.nonEmptyString" />
    </LabeledInput>

    <LabeledInput
      multiple-inputs
      label="Color hex code(s)">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        property-name="colorsHexString"
        hint="comma-separated list of #rrggbb hex codes" />
    </LabeledInput>

    <LabeledInput
      v-if="colorPreview !== null"
      key="color-preview"
      :formstate="formstate"
      :name="`capability${capability.uuid}-colorsHexString`"
      label="Color preview">
      <OflSvg
        v-for="color of colorPreview"
        :key="color"
        :colors="[color]"
        type="color-circle" />
    </LabeledInput>

    <LabeledInput
      v-if="colorPreviewStart !== null || colorPreviewEnd !== null"
      key="color-preview-start-end"
      :formstate="formstate"
      :name="`capability${capability.uuid}-colorsHexString`"
      label="Color preview">
      <OflSvg
        v-for="color of colorPreviewStart || []"
        :key="color"
        :colors="[color]"
        type="color-circle" />
      …
      <OflSvg
        v-for="color of colorPreviewEnd || []"
        :key="color"
        :colors="[color]"
        type="color-circle" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-colorTemperature`"
      label="Color temperature">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        property-name="colorTemperature" />
    </LabeledInput>

  </div>
</template>

<script setup lang="ts">
import { schemaDefinitions } from '~~/lib/schema-properties.js';
import { colorsHexStringToArray } from '@/assets/scripts/editor-utilities.js';

interface Props {
  capability: {
    uuid: string;
    typeData: {
      comment?: string;
      colors?: string[] | null;
      colorsStart?: string[] | null;
      colorsEnd?: string[] | null;
      colorsHexString?: string;
      colorsHexStringStart?: string | null;
      colorsHexStringEnd?: string | null;
      colorTemperature?: string;
      colorTemperatureStart?: string | null;
      colorTemperatureEnd?: string | null;
    };
  };
  formstate?: object;
}

const props = defineProps<Props>();

const hint = `This capability enables a static predefined RGB/CMY color. Use WheelSlot for color wheel filters.`;

const defaultData = {
  comment: '',
  colors: null,
  colorsStart: null,
  colorsEnd: null,
  colorsHexString: '',
  colorsHexStringStart: null,
  colorsHexStringEnd: null,
  colorTemperature: '',
  colorTemperatureStart: null,
  colorTemperatureEnd: null,
};

const colorPreview = ref<string[] | null>(null);
const colorPreviewStart = ref<string[] | null>(null);
const colorPreviewEnd = ref<string[] | null>(null);

watch(
  () => props.capability.typeData.colorsHexString,
  (hexString) => {
    props.capability.typeData.colors = colorsHexStringToArray(hexString);
    colorPreview.value = props.capability.typeData.colors;
  },
  { immediate: true }
);

watch(
  () => props.capability.typeData.colorsHexStringStart,
  (hexString) => {
    props.capability.typeData.colorsStart = colorsHexStringToArray(hexString);
    colorPreviewStart.value = props.capability.typeData.colorsStart;
  },
  { immediate: true }
);

watch(
  () => props.capability.typeData.colorsHexStringEnd,
  (hexString) => {
    props.capability.typeData.colorsEnd = colorsHexStringToArray(hexString);
    colorPreviewEnd.value = props.capability.typeData.colorsEnd;
  },
  { immediate: true }
);
</script>
