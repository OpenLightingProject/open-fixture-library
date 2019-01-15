<template>
  <div class="wheel-slot-type-data">

    <app-labeled-input
      :formstate="formstate"
      :name="`wheel-slot${wheelSlot.uuid}-frostIntensity`"
      label="Frost intensity">
      <app-property-input-entity
        v-model="wheelSlot.typeData.frostIntensity"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-frostIntensity`"
        :schema-property="properties.entities.percent" />
    </app-labeled-input>

  </div>
</template>

<script>
import schemaProperties from '~~/lib/schema-properties.js';

import propertyInputEntityVue from '~/components/property-input-entity.vue';
import labeledInputVue from '~/components/labeled-input.vue';

export default {
  components: {
    'app-property-input-entity': propertyInputEntityVue,
    'app-labeled-input': labeledInputVue
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
