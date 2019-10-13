<template>

  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`capability${capability.uuid}-horizontalAngle`"
      label="Horizontal angle">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        :required="isPropertyEmpty(`verticalAngle`)"
        property-name="horizontalAngle" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`capability${capability.uuid}-verticalAngle`"
      label="Vertical angle">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        :required="isPropertyEmpty(`horizontalAngle`)"
        property-name="verticalAngle" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      :name="`capability${capability.uuid}-comment`"
      label="Comment">
      <PropertyInputText
        v-model="capability.typeData.comment"
        :formstate="formstate"
        :name="`capability${capability.uuid}-comment`"
        :schema-property="properties.definitions.nonEmptyString" />
    </LabeledInput>

  </div>
</template>

<script>
import schemaProperties from '../../../../lib/schema-properties.js';

import EditorProportionalPropertySwitcher from '../EditorProportionalPropertySwitcher.vue';
import PropertyInputText from '../../PropertyInputText.vue';
import LabeledInput from '../../LabeledInput.vue';

export default {
  components: {
    EditorProportionalPropertySwitcher,
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
      hint: `Only move the beam and not a visible physical part of the fixture. This is especially useful for lasers. Use Pan/Tilt for moving heads.`,
      defaultData: {
        horizontalAngle: null,
        horizontalAngleStart: ``,
        horizontalAngleEnd: ``,
        verticalAngle: null,
        verticalAngleStart: ``,
        verticalAngleEnd: ``,
        comment: ``
      }
    };
  },
  methods: {
    isPropertyEmpty(property) {
      const typeData = this.capability.typeData;
      const isSteppedEmpty = typeData[property] === null || typeData[property] === ``;
      const isProportionalEmpty = typeData[`${property}Start`] === null || typeData[`${property}Start`] === ``;

      return isSteppedEmpty && isProportionalEmpty;
    }
  }
};
</script>
