<template>
  <div class="wheel-slot-type-data">

    <LabeledInput
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`wheel-slot${wheelSlot.uuid}-frostIntensity`"
      label="Frost intensity">
      <PropertyInputEntity
        v-model="wheelSlot.typeData.frostIntensity"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-frostIntensity`"
        :schema-property="properties.entities.percent" />
    </LabeledInput>

  </div>
</template>

<script>
import schemaProperties from '../../../../lib/schema-properties.js';

import LabeledInput from '../../LabeledInput.vue';
import PropertyInputEntity from '../../PropertyInputEntity.vue';

export default {
  components: {
    LabeledInput,
    PropertyInputEntity,
  },
  props: {
    wheelSlot: {
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
      defaultData: {
        frostIntensity: ``,
      },
    };
  },
};
</script>
