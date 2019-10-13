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
        frostIntensity: ``
      }
    };
  }
};
</script>
