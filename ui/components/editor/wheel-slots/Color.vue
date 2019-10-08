<template>
  <div class="wheel-slot-type-data">

    <labeled-input
      :formstate="formstate"
      :name="`wheel-slot${wheelSlot.uuid}-name`"
      label="Color name">
      <property-input-text
        v-model="wheelSlot.typeData.name"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-name`"
        :schema-property="properties.definitions.nonEmptyString" />
    </labeled-input>

    <labeled-input
      label="Color hex code(s)"
      :formstate="formstate"
      :name="`wheel-slot${wheelSlot.uuid}-colorsHexString`">
      <property-input-text
        v-model="wheelSlot.typeData.colorsHexString"
        :name="`wheel-slot${wheelSlot.uuid}-colorsHexString`"
        :schema-property="properties.definitions.nonEmptyString"
        valid-color-hex-list />
    </labeled-input>

    <labeled-input v-if="colorPreview !== null" label="Color preview">
      <ofl-svg
        v-for="color in colorPreview"
        :key="color"
        :colors="[color]"
        type="color-circle" />
    </labeled-input>

    <labeled-input
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`wheel-slot${wheelSlot.uuid}-colorTemperature`"
      label="Color temperature">
      <property-input-entity
        v-model="wheelSlot.typeData.colorTemperature"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-colorTemperature`"
        :schema-property="properties.entities.colorTemperature" />
    </labeled-input>

  </div>
</template>

<script>
import schemaProperties from '../../../../lib/schema-properties.js';
import { colorsHexStringToArray } from '../../../assets/scripts/editor-utils.js';

import propertyInputEntity from '../property-input-entity.vue';
import propertyInputText from '../property-input-text.vue';
import labeledInput from '../../labeled-input.vue';

export default {
  components: {
    'property-input-entity': propertyInputEntity,
    'property-input-text': propertyInputText,
    'labeled-input': labeledInput
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
