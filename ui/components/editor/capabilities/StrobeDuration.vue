<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`capability${capability.uuid}-duration`"
      label="Duration">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        :required="true"
        property-name="duration" />
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
import PropertyInputText from '../PropertyInputText.vue';
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
      hint: `Doesn't activate strobe, only controls the strobe flash duration.`,
      defaultData: {
        duration: null,
        durationStart: `ms`,
        durationEnd: `ms`,
        comment: ``
      }
    };
  }
};
</script>
