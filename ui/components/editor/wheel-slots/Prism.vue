<template>
  <div class="wheel-slot-type-data">

    <labeled-input
      :formstate="formstate"
      :name="`wheel-slot${wheelSlot.uuid}-name`"
      label="Prism name">
      <property-input-text
        v-model="wheelSlot.typeData.name"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-name`"
        :schema-property="properties.definitions.nonEmptyString" />
    </labeled-input>

    <labeled-input
      :formstate="formstate"
      :name="`wheel-slot${wheelSlot.uuid}-facets`"
      label="Facets">
      <property-input-number
        v-model="wheelSlot.typeData.facets"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-facets`"
        :schema-property="properties.wheelSlotTypes.Prism.properties.facets" />
    </labeled-input>

  </div>
</template>

<script>
import schemaProperties from '../../../../lib/schema-properties.js';

import propertyInputNumber from '../property-input-number.vue';
import propertyInputText from '../property-input-text.vue';
import labeledInput from '../../labeled-input.vue';

export default {
  components: {
    'property-input-number': propertyInputNumber,
    'property-input-text': propertyInputText,
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
        name: ``,
        facets: ``
      }
    };
  }
};
</script>
