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
        :schema-property="properties.definitions.nonEmptyString" />
    </LabeledInput>

    <LabeledInput
      label="Color hex code(s)"
      :formstate="formstate"
      :name="`wheel-slot${wheelSlot.uuid}-colorsHexString`">
      <PropertyInputText
        v-model="wheelSlot.typeData.colorsHexString"
        :name="`wheel-slot${wheelSlot.uuid}-colorsHexString`"
        :schema-property="properties.definitions.nonEmptyString"
        valid-color-hex-list />
    </LabeledInput>

    <LabeledInput v-if="colorPreview !== null" label="Color preview">
      <OflSvg
        v-for="color in colorPreview"
        :key="color"
        :colors="[color]"
        type="color-circle" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`wheel-slot${wheelSlot.uuid}-colorTemperature`"
      label="Color temperature">
      <PropertyInputEntity
        v-model="wheelSlot.typeData.colorTemperature"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-colorTemperature`"
        :schema-property="properties.entities.colorTemperature" />
    </LabeledInput>

  </div>
</template>

<script>
import schemaProperties from '../../../../lib/schema-properties.js';
import { colorsHexStringToArray } from '../../../assets/scripts/editor-utils.js';

import PropertyInputEntity from '../PropertyInputEntity.vue';
import PropertyInputText from '../PropertyInputText.vue';
import LabeledInput from '../../LabeledInput.vue';

export default {
  components: {
    PropertyInputEntity,
    PropertyInputText,
    LabeledInput
  },
  props: {
    wheelSlot: {
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
      defaultData: {
        name: ``,
        colors: null,
        colorsHexString: ``,
        colorTemperature: ``
      },
      colorPreview: null
    };
  },
  watch: {
    'wheelSlot.typeData.colorsHexString': {
      handler(hexString) {
        this.wheelSlot.typeData.colors = colorsHexStringToArray(hexString);
        this.colorPreview = this.wheelSlot.typeData.colors;
      },
      immediate: true
    }
  }
};
</script>
