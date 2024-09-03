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

<script>
import { objectProp } from 'vue-ts-types';
import { schemaDefinitions } from '../../../../lib/schema-properties.js';
import { colorsHexStringToArray } from '../../../assets/scripts/editor-utils.js';

import LabeledInput from '../../LabeledInput.vue';
import PropertyInputText from '../../PropertyInputText.vue';
import EditorProportionalPropertySwitcher from '../EditorProportionalPropertySwitcher.vue';

export default {
  components: {
    EditorProportionalPropertySwitcher,
    LabeledInput,
    PropertyInputText,
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional,
  },
  data() {
    return {
      schemaDefinitions,

      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      hint: `This capability enables a static predefined RGB/CMY color. Use WheelSlot for color wheel filters.`,

      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        comment: ``,
        colors: null,
        colorsStart: null,
        colorsEnd: null,
        colorsHexString: ``,
        colorsHexStringStart: null,
        colorsHexStringEnd: null,
        colorTemperature: ``,
        colorTemperatureStart: null,
        colorTemperatureEnd: null,
      },
      colorPreview: null,
      colorPreviewStart: null,
      colorPreviewEnd: null,
    };
  },
  watch: {
    'capability.typeData.colorsHexString': {
      handler(hexString) {
        this.capability.typeData.colors = colorsHexStringToArray(hexString);
        this.colorPreview = this.capability.typeData.colors;
      },
      immediate: true,
    },
    'capability.typeData.colorsHexStringStart': {
      handler(hexString) {
        this.capability.typeData.colorsStart = colorsHexStringToArray(hexString);
        this.colorPreviewStart = this.capability.typeData.colorsStart;
      },
      immediate: true,
    },
    'capability.typeData.colorsHexStringEnd': {
      handler(hexString) {
        this.capability.typeData.colorsEnd = colorsHexStringToArray(hexString);
        this.colorPreviewEnd = this.capability.typeData.colorsEnd;
      },
      immediate: true,
    },
  },
};
</script>
