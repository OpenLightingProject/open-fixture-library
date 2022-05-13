<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-soundSensitivity`"
      label="Sound sensitivity">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        required
        property-name="soundSensitivity" />
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
      hint: `Doesn't activate sound controlled mode (use Effect for this), only controls the microphone sensitivity.`,

      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        soundSensitivity: null,
        soundSensitivityStart: `low`,
        soundSensitivityEnd: `high`,
        comment: ``,
      },
    };
  },
};
</script>
