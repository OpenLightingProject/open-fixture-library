<template>

  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-x`"
      label="X coordinate">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        :required="isPropertyEmpty(`y`)"
        property-name="x" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-y`"
      label="Y coordinate">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        :required="isPropertyEmpty(`x`)"
        property-name="y" />
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

<script>
import { objectProp } from 'vue-ts-types';
import { schemaDefinitions } from '../../../../lib/schema-properties.js';
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
      hint: 'Sets the color in the CIE 1931 xy color space. Fixtures with separate channels for the x and y coordinate can use one ColorXY capability per channel.',

      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        x: null,
        xStart: '',
        xEnd: '',
        y: null,
        yStart: '',
        yEnd: '',
        comment: '',
      },
    };
  },
  methods: {
    isPropertyEmpty(property) {
      const typeData = this.capability.typeData;
      const isSteppedEmpty = typeData[property] === null || typeData[property] === '';
      const isProportionalEmpty = typeData[`${property}Start`] === null || typeData[`${property}Start`] === '';

      return isSteppedEmpty && isProportionalEmpty;
    },
  },
};
</script>
