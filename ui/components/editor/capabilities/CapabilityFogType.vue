<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      :name="`capability${capability.uuid}-fogType`"
      label="Fog type">
      <select
        v-model="capability.typeData.fogType"
        :class="{ empty: capability.typeData.fogType === `` }"
        :name="`capability${capability.uuid}-fogType`"
        required>

        <option value="" disabled>Please select a fog type</option>
        <option
          v-for="fogType of fogTypes"
          :key="fogType"
          :value="fogType">{{ fogType }}</option>

      </select>
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
import { capabilityTypes, schemaDefinitions } from '../../../../lib/schema-properties.js';

import LabeledInput from '../../LabeledInput.vue';
import PropertyInputText from '../../PropertyInputText.vue';

export default {
  components: {
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
      fogTypes: capabilityTypes.Fog.properties.fogType.enum,

      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      hint: `Doesn't activate fog, only selects the fog type (Fog or Haze).`,

      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        fogType: ``,
        comment: ``,
      },
    };
  },
};
</script>
