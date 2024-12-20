<template>
  <div class="wheel-slot-type-data">

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`wheel-slot${wheelSlot.uuid}-openPercent`"
      label="Degree of opening">
      <PropertyInputEntity
        v-model="wheelSlot.typeData.openPercent"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-openPercent`"
        :schema-property="entitiesSchema.irisPercent" />
    </LabeledInput>

  </div>
</template>

<script>
import { objectProp } from 'vue-ts-types';
import { entitiesSchema } from '../../../../lib/schema-properties.js';

import LabeledInput from '../../LabeledInput.vue';
import PropertyInputEntity from '../../PropertyInputEntity.vue';

export default {
  components: {
    LabeledInput,
    PropertyInputEntity,
  },
  props: {
    wheelSlot: objectProp().required,
    formstate: objectProp().optional,
  },
  data() {
    return {
      entitiesSchema,

      /**
       * Used in {@link EditorWheelSlot}
       * @public
       */
      defaultData: {
        openPercent: ``,
      },
    };
  },
};
</script>
