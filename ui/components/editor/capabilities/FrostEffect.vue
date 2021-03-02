<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      :name="`capability${capability.uuid}-effectName`"
      label="Effect name">
      <PropertyInputText
        v-model="capability.typeData.effectName"
        :formstate="formstate"
        :name="`capability${capability.uuid}-effectName`"
        :schema-property="properties.definitions.nonEmptyString"
        :required="true" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`capability${capability.uuid}-speed`"
      label="Speed">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        property-name="speed" />
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
import LabeledInput from '../../LabeledInput.vue';
import PropertyInputText from '../../PropertyInputText.vue';

export default {
  components: {
    EditorProportionalPropertySwitcher,
    LabeledInput,
    PropertyInputText,
  },
  props: {
    capability: {
      type: Object,
      required: true,
    },
    formstate: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      properties: schemaProperties,

      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      hint: `This capability enables a non-static frost effect, e.g. pulse. Use the Frost type instead if a static frost intensity can be chosen.`,

      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        effectName: ``,
        speed: ``,
        speedStart: null,
        speedEnd: null,
        comment: ``,
      },
    };
  },
};
</script>
