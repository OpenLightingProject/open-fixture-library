<template>
  <div class="wheel-slot-type-data">

    <labeled-input
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`wheel-slot${wheelSlot.uuid}-openPercent`"
      label="Degree of opening">
      <property-input-entity
        v-model="wheelSlot.typeData.openPercent"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-openPercent`"
        :schema-property="properties.entities.irisPercent" />
    </labeled-input>

  </div>
</template>

<script>
import schemaProperties from '../../../../lib/schema-properties.js';

import propertyInputEntity from '../property-input-entity.vue';
import labeledInput from '../../labeled-input.vue';

export default {
  components: {
    'property-input-entity': propertyInputEntity,
    'labeled-input': labeledInput
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
