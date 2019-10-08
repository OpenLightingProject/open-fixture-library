<template>
  <div class="wheel-slot-type-data">

    <labeled-input
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`wheel-slot${wheelSlot.uuid}-frostIntensity`"
      label="Frost intensity">
      <property-input-entity
        v-model="wheelSlot.typeData.frostIntensity"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-frostIntensity`"
        :schema-property="properties.entities.percent" />
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
        frostIntensity: ``
      }
    };
  }
};
</script>
