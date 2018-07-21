<template>
  <div class="capability-type-data">

    <app-simple-label
      :formstate="formstate"
      :name="`capability${capability.uuid}-index`"
      label="Index">
      <app-editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        :required="true"
        property-name="index" />
    </app-simple-label>

    <app-simple-label
      :formstate="formstate"
      :name="`capability${capability.uuid}-comment`"
      label="Color name">
      <app-property-input-text
        v-model="capability.typeData.comment"
        :formstate="formstate"
        :name="`capability${capability.uuid}-comment`"
        :schema-property="properties.definitions.nonEmptyString" />
    </app-simple-label>

    <app-simple-label label="Color hex code(s)">
      <app-editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        property-name="colorsHexString"
        hint="comma-separated list of #rrggbb hex codes" />
    </app-simple-label>

    <app-simple-label
      v-if="colorPreview !== null"
      :formstate="formstate"
      :name="`capability${capability.uuid}-colorsHexString`"
      label="Color preview">
      <app-svg
        v-for="color in colorPreview"
        :key="color"
        :colors="[color]"
        type="color-circle" />
    </app-simple-label>

    <app-simple-label
      v-if="colorPreviewStart !== null || colorPreviewEnd !== null"
      :formstate="formstate"
      :name="`capability${capability.uuid}-colorsHexString`"
      label="Color preview">
      <app-svg
        v-for="color in colorPreviewStart || []"
        :key="color"
        :colors="[color]"
        type="color-circle" />
      …
      <app-svg
        v-for="color in colorPreviewEnd || []"
        :key="color"
        :colors="[color]"
        type="color-circle" />
    </app-simple-label>

    <app-simple-label
      :formstate="formstate"
      :name="`capability${capability.uuid}-colorTemperature`"
      label="Color Temperature">
      <app-editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        property-name="colorTemperature" />
    </app-simple-label>

  </div>
</template>

<script>
import schemaProperties from '~~/lib/schema-properties.js';
import { colorsHexStringToArray } from '~/assets/scripts/editor-utils.mjs';

import editorProportionalCapabilityDataSwitcher from '~/components/editor-proportional-capability-data-switcher.vue';
import propertyInputTextVue from '~/components/property-input-text.vue';
import simpleLabelVue from '~/components/simple-label.vue';
import svgVue from '~/components/svg.vue';

export default {
  components: {
    'app-editor-proportional-capability-data-switcher': editorProportionalCapabilityDataSwitcher,
    'app-property-input-text': propertyInputTextVue,
    'app-simple-label': simpleLabelVue,
    'app-svg': svgVue
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
      defaultData: {
        index: ``,
        indexStart: null,
        indexEnd: null,
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
