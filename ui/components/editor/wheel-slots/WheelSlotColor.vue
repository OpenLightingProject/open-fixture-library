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

<script>
import { objectProp } from 'vue-ts-types';
import { entitiesSchema, schemaDefinitions } from '../../../../lib/schema-properties.js';
import { colorsHexStringToArray } from '../../../assets/scripts/editor-utilities.js';

import LabeledInput from '../../LabeledInput.vue';
import PropertyInputEntity from '../../PropertyInputEntity.vue';
import PropertyInputText from '../../PropertyInputText.vue';

export default {
  components: {
    LabeledInput,
    PropertyInputEntity,
    PropertyInputText,
  },
  props: {
    wheelSlot: objectProp().required,
    formstate: objectProp().optional,
  },
  data() {
    return {
      schemaDefinitions,
      entitiesSchema,

      /**
       * Used in {@link EditorWheelSlot}
       * @public
       */
      defaultData: {
        name: ``,
        colors: null,
        colorsHexString: ``,
        colorTemperature: ``,
      },
      colorPreview: null,
    };
  },
  watch: {
    'wheelSlot.typeData.colorsHexString': {
      handler(hexString) {
        this.wheelSlot.typeData.colors = colorsHexStringToArray(hexString);
        this.colorPreview = this.wheelSlot.typeData.colors;
      },
      immediate: true,
    },
  },
};
</script>
