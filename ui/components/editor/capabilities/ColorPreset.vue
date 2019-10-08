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
        :schema-property="properties.definitions.nonEmptyString" />
    </LabeledInput>

    <LabeledInput
      :multiple-inputs="true"
      label="Color hex code(s)">
      <ProportionalCapabilityDataSwitcher
        :capability="capability"
        :formstate="formstate"
        property-name="colorsHexString"
        hint="comma-separated list of #rrggbb hex codes" />
    </LabeledInput>

    <LabeledInput
      v-if="colorPreview !== null"
      :formstate="formstate"
      :name="`capability${capability.uuid}-colorsHexString`"
      label="Color preview">
      <OflSvg
        v-for="color in colorPreview"
        :key="color"
        :colors="[color]"
        type="color-circle" />
    </LabeledInput>

    <LabeledInput
      v-if="colorPreviewStart !== null || colorPreviewEnd !== null"
      :formstate="formstate"
      :name="`capability${capability.uuid}-colorsHexString`"
      label="Color preview">
      <OflSvg
        v-for="color in colorPreviewStart || []"
        :key="color"
        :colors="[color]"
        type="color-circle" />
      …
      <OflSvg
        v-for="color in colorPreviewEnd || []"
        :key="color"
        :colors="[color]"
        type="color-circle" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`capability${capability.uuid}-colorTemperature`"
      label="Color temperature">
      <ProportionalCapabilityDataSwitcher
        :capability="capability"
        :formstate="formstate"
        property-name="colorTemperature" />
    </LabeledInput>

  </div>
</template>

<script>
import schemaProperties from '../../../../lib/schema-properties.js';
import { colorsHexStringToArray } from '../../../assets/scripts/editor-utils.js';

import ProportionalCapabilityDataSwitcher from '../ProportionalCapabilityDataSwitcher.vue';
import PropertyInputText from '../PropertyInputText.vue';
import LabeledInput from '../../LabeledInput.vue';

export default {
  components: {
    ProportionalCapabilityDataSwitcher,
    PropertyInputText,
    LabeledInput
  },
  props: {
    capability: {
      type: Object,
      required: true
    },
    formstate: {
      type: Object,
      required: false,
      default: null
    }
  },
  data() {
    return {
      properties: schemaProperties,
      hint: `This capability enables a static predefined RGB/CMY color. Use WheelSlot for color wheel filters.`,
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
        colorTemperatureEnd: null
      },
      colorPreview: null,
      colorPreviewStart: null,
      colorPreviewEnd: null
    };
  },
  watch: {
    'capability.typeData.colorsHexString': {
      handler(hexString) {
        this.capability.typeData.colors = colorsHexStringToArray(hexString);
        this.colorPreview = this.capability.typeData.colors;
      },
      immediate: true
    },
    'capability.typeData.colorsHexStringStart': {
      handler(hexString) {
        this.capability.typeData.colorsStart = colorsHexStringToArray(hexString);
        this.colorPreviewStart = this.capability.typeData.colorsStart;
      },
      immediate: true
    },
    'capability.typeData.colorsHexStringEnd': {
      handler(hexString) {
        this.capability.typeData.colorsEnd = colorsHexStringToArray(hexString);
        this.colorPreviewEnd = this.capability.typeData.colorsEnd;
      },
      immediate: true
    }
  }
};
</script>
