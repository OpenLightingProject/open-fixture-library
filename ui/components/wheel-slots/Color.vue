<template>
  <div class="wheel-slot-type-data">

    <app-labeled-input
      :formstate="formstate"
      :name="`wheel-slot${wheelSlot.uuid}-name`"
      label="Color name">
      <app-property-input-text
        v-model="wheelSlot.typeData.name"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-name`"
        :schema-property="properties.definitions.nonEmptyString" />
    </app-labeled-input>

    <app-labeled-input
      label="Color hex code(s)"
      :formstate="formstate"
      :name="`wheel-slot${wheelSlot.uuid}-colorsHexString`">
      <app-property-input-text
        v-model="wheelSlot.typeData.colorsHexString"
        :name="`wheel-slot${wheelSlot.uuid}-colorsHexString`"
        :schema-property="properties.definitions.nonEmptyString"
        valid-color-hex-list />
    </app-labeled-input>

    <app-labeled-input v-if="colorPreview !== null" label="Color preview">
      <app-svg
        v-for="color in colorPreview"
        :key="color"
        :colors="[color]"
        type="color-circle" />
    </app-labeled-input>

    <app-labeled-input
      :formstate="formstate"
      :name="`wheel-slot${wheelSlot.uuid}-colorTemperature`"
      label="Color temperature">
      <app-property-input-entity
        v-model="wheelSlot.typeData.colorTemperature"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-colorTemperature`"
        :schema-property="properties.entities.colorTemperature" />
    </app-labeled-input>

  </div>
</template>

<script>
import schemaProperties from '~~/lib/schema-properties.js';
import { colorsHexStringToArray } from '~/assets/scripts/editor-utils.mjs';

import propertyInputEntityVue from '~/components/property-input-entity.vue';
import propertyInputTextVue from '~/components/property-input-text.vue';
import labeledInputVue from '~/components/labeled-input.vue';
import svgVue from '~/components/svg.vue';

export default {
  components: {
    'app-property-input-entity': propertyInputEntityVue,
    'app-property-input-text': propertyInputTextVue,
    'app-labeled-input': labeledInputVue,
    'app-svg': svgVue
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
