<template>
  <div class="capability-type-data">

    <labeled-input
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`capability${capability.uuid}-horizontalAngle`"
      label="Horizontal angle">
      <editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        :required="isPropertyEmpty(`verticalAngle`)"
        property-name="horizontalAngle" />
    </labeled-input>

    <labeled-input
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`capability${capability.uuid}-verticalAngle`"
      label="Vertical angle">
      <editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        :required="isPropertyEmpty(`horizontalAngle`)"
        property-name="verticalAngle" />
    </labeled-input>

    <labeled-input
      :formstate="formstate"
      :name="`capability${capability.uuid}-comment`"
      label="Comment">
      <property-input-text
        v-model="capability.typeData.comment"
        :formstate="formstate"
        :name="`capability${capability.uuid}-comment`"
        :schema-property="properties.definitions.nonEmptyString" />
    </labeled-input>

  </div>
</template>

<script>
import schemaProperties from '../../../../lib/schema-properties.js';

import editorProportionalCapabilityDataSwitcher from '../proportional-capability-data-switcher.vue';
import propertyInputText from '../property-input-text.vue';
import labeledInput from '../../labeled-input.vue';

export default {
  components: {
    'editor-proportional-capability-data-switcher': editorProportionalCapabilityDataSwitcher,
    'property-input-text': propertyInputText,
    'labeled-input': labeledInput
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
