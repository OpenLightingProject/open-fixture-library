<template>
  <div class="wheel-slot-type-data">

    <LabeledInput
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`wheel-slot${wheelSlot.uuid}-openPercent`"
      label="Degree of opening">
      <PropertyInputEntity
        v-model="wheelSlot.typeData.openPercent"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-openPercent`"
        :schema-property="properties.entities.irisPercent" />
    </LabeledInput>

  </div>
</template>

<script>
import schemaProperties from '../../../../lib/schema-properties.js';

import PropertyInputEntity from '../../PropertyInputEntity.vue';
import LabeledInput from '../../LabeledInput.vue';

export default {
  components: {
    PropertyInputEntity,
    LabeledInput
  },
  props: {
    wheelSlot: {
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
        openPercent: ``
      }
    };
  }
};
</script>
