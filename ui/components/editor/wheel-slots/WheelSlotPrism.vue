<template>
  <div class="wheel-slot-type-data">

    <LabeledInput
      :formstate="formstate"
      :name="`wheel-slot${wheelSlot.uuid}-name`"
      label="Prism name">
      <PropertyInputText
        v-model="wheelSlot.typeData.name"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-name`"
        :schema-property="schemaDefinitions.nonEmptyString" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      :name="`wheel-slot${wheelSlot.uuid}-facets`"
      label="Facets">
      <PropertyInputNumber
        v-model="wheelSlot.typeData.facets"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-facets`"
        :schema-property="facetsSchema" />
    </LabeledInput>

  </div>
</template>

<script>
import { objectProp } from 'vue-ts-types';
import { schemaDefinitions, wheelSlotTypes } from '../../../../lib/schema-properties.js';

import LabeledInput from '../../LabeledInput.vue';
import PropertyInputNumber from '../../PropertyInputNumber.vue';
import PropertyInputText from '../../PropertyInputText.vue';

export default {
  components: {
    LabeledInput,
    PropertyInputNumber,
    PropertyInputText,
  },
  props: {
    wheelSlot: objectProp().required,
    formstate: objectProp().optional,
  },
  data() {
    return {
      schemaDefinitions,
      facetsSchema: wheelSlotTypes.Prism.properties.facets,

      /**
       * Used in {@link EditorWheelSlot}
       * @public
       */
      defaultData: {
        name: ``,
        facets: ``,
      },
    };
  },
};
</script>
