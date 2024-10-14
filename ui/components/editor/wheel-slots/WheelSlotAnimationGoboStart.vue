<template>
  <div class="wheel-slot-type-data">

    <LabeledInput
      :formstate="formstate"
      :name="`wheel-slot${wheelSlot.uuid}-name`"
      label="Animation gobo name">
      <PropertyInputText
        v-model="wheelSlot.typeData.name"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-name`"
        :schema-property="schemaDefinitions.nonEmptyString" />
    </LabeledInput>

  </div>
</template>

<script>
import { objectProp } from 'vue-ts-types';
import { schemaDefinitions } from '../../../../lib/schema-properties.js';

import LabeledInput from '../../LabeledInput.vue';
import PropertyInputText from '../../PropertyInputText.vue';

export default {
  components: {
    LabeledInput,
    PropertyInputText,
  },
  props: {
    wheelSlot: objectProp().required,
    formstate: objectProp().optional,
  },
  data() {
    return {
      schemaDefinitions,

      /**
       * Used in {@link EditorWheelSlot}
       * @public
       */
      defaultData: {
        name: ``,
      },
    };
  },
};
</script>
