<template>
  <div class="capability-type-data">
    This is a StrobeSpeed capability!

    <!-- TODO: everything -->
    <app-simple-label
      :formstate="formstate"
      :name="`capability${capability.uuid}-comment`"
      label="Comment">
      <app-property-input-text
        v-model="capability.typeData.comment"
        :formstate="formstate"
        :name="`capability${capability.uuid}-comment`"
        :schema-property="properties.definitions.nonEmptyString" />
    </app-simple-label>
  </div>
</template>

<script>
import schemaProperties from '~~/lib/schema-properties.js';

import propertyInputTextVue from '~/components/property-input-text.vue';
import simpleLabelVue from '~/components/simple-label.vue';

export default {
  components: {
    'app-property-input-text': propertyInputTextVue,
    'app-simple-label': simpleLabelVue
  },
  props: {
    capability: {
      type: Object,
      required: true
    },
    formstate: {
      type: Object,
      required: true
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
