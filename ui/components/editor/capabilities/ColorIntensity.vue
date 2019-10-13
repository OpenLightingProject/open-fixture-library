<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      :name="`capability${capability.uuid}-color`"
      label="Color">
      <select
        v-model="capability.typeData.color"
        :class="{ empty: capability.typeData.color === `` }"
        :name="`capability${capability.uuid}-color`"
        required>

        <option value="" disabled>Please select a color</option>
        <option
          v-for="color in colors"
          :key="color"
          :value="color">{{ color }}</option>

      </select>
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`capability${capability.uuid}-brightness`"
      label="Brightness">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        :required="true"
        property-name="brightness" />
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
      defaultData: {
        color: ``,
        brightness: null,
        brightnessStart: `off`,
        brightnessEnd: `bright`,
        comment: ``
      }
    };
  },
  computed: {
    colors() {
      return this.properties.capabilityTypes.ColorIntensity.properties.color.enum;
    }
  }
};
</script>
