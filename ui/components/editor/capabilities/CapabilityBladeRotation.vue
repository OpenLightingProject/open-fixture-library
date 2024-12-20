<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-blade`"
      label="Blade">
      <PropertyInputEntity
        v-model="capability.typeData.blade"
        :name="`capability${capability.uuid}-blade`"
        :schema-property="bladeSchema"
        required />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-angle`"
      label="Angle">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        required
        property-name="angle" />
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
import PropertyInputEntity from '../../PropertyInputEntity.vue';
import PropertyInputText from '../../PropertyInputText.vue';
import EditorProportionalPropertySwitcher from '../EditorProportionalPropertySwitcher.vue';

export default {
  components: {
    EditorProportionalPropertySwitcher,
    LabeledInput,
    PropertyInputEntity,
    PropertyInputText,
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional,
  },
  data() {
    return {
      schemaDefinitions,
      bladeSchema: capabilityTypes.BladeInsertion.properties.blade,

      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        blade: ``,
        angle: null,
        angleStart: `0deg`,
        angleEnd: `360deg`,
        comment: ``,
      },
    };
  },
};
</script>
