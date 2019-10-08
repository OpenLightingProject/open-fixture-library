<template>
  <div class="capability-type-data">
    <labeled-input
      :formstate="formstate"
      :name="`capability${capability.uuid}-comment`"
      label="Comment">
      <property-input-text
        v-model="capability.typeData.comment"
        :formstate="formstate"
        :name="`capability${capability.uuid}-comment`"
        :schema-property="properties.definitions.nonEmptyString" />
    </labeled-input>
  </div>
</template>

<script>
import schemaProperties from '../../../../lib/schema-properties.js';

import propertyInputText from '../property-input-text.vue';
import labeledInput from '../../labeled-input.vue';

export default {
  components: {
    'property-input-text': propertyInputText,
    'labeled-input': labeledInput
  },
  props: {
    capability: {
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
        comment: ``
      }
    };
  }
};
</script>
