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
        :schema-property="properties.definitions.nonEmptyString" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      :name="`wheel-slot${wheelSlot.uuid}-facets`"
      label="Facets">
      <PropertyInputNumber
        v-model="wheelSlot.typeData.facets"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-facets`"
        :schema-property="properties.wheelSlotTypes.Prism.properties.facets" />
    </LabeledInput>

  </div>
</template>

<script>
import schemaProperties from '../../../../lib/schema-properties.js';

import LabeledInput from '../../LabeledInput.vue';
import PropertyInputNumber from '../../PropertyInputNumber.vue';
import PropertyInputText from '../../PropertyInputText.vue';

export default {
  components: {
    LabeledInput,
    PropertyInputNumber,
    PropertyInputText
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
