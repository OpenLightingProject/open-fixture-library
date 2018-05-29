<template>
  <div class="capability-type-data">

    <app-editor-proportional-capability-data-switcher
      :capability="capability"
      :formstate="formstate"
      property-name="parameter"
      property-display-name="Parameter" />

    <app-editor-proportional-capability-data-switcher
      :capability="capability"
      :formstate="formstate"
      property-name="hold"
      property-display-name="Hold" />

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

import editorProportionalCapabilityDataSwitcher from '~/components/editor-proportional-capability-data-switcher.vue';
import propertyInputTextVue from '~/components/property-input-text.vue';
import simpleLabelVue from '~/components/simple-label.vue';

export default {
  components: {
    'app-editor-proportional-capability-data-switcher': editorProportionalCapabilityDataSwitcher,
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
        parameter: ``,
        parameterStart: null,
        parameterEnd: null,
        hold: ``,
        holdStart: null,
        holdEnd: null,
        comment: ``
      }
    };
  }
};
</script>
