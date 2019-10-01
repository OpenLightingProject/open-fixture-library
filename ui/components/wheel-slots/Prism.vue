<template>
  <div class="wheel-slot-type-data">

    <app-labeled-input
      :formstate="formstate"
      :name="`wheel-slot${wheelSlot.uuid}-name`"
      label="Prism name">
      <app-property-input-text
        v-model="wheelSlot.typeData.name"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-name`"
        :schema-property="properties.definitions.nonEmptyString" />
    </app-labeled-input>

    <app-labeled-input
      :formstate="formstate"
      :name="`wheel-slot${wheelSlot.uuid}-facets`"
      label="Facets">
      <app-property-input-number
        v-model="wheelSlot.typeData.facets"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-facets`"
        :schema-property="properties.wheelSlotTypes.Prism.properties.facets" />
    </app-labeled-input>

  </div>
</template>

<script>
import schemaProperties from '~~/lib/schema-properties.js';

import propertyInputNumberVue from '~/components/property-input-number.vue';
import propertyInputTextVue from '~/components/property-input-text.vue';
import labeledInputVue from '~/components/labeled-input.vue';

export default {
  components: {
    'app-property-input-number': propertyInputNumberVue,
    'app-property-input-text': propertyInputTextVue,
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
        name: ``,
        facets: ``
      }
    };
  }
};
</script>
