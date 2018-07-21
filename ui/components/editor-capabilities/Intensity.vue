<template>
  <div class="capability-type-data">

    <app-simple-label
      :formstate="formstate"
      :name="`capability${capability.uuid}-brightness`"
      label="Brightness">
      <app-editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        :required="true"
        property-name="brightness" />
    </app-simple-label>

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
      required: false,
      default: null
    }
  },
  data() {
    return {
      properties: schemaProperties,
      hint: `Master dimmer for the lamp's brightness. Use ColorIntensity for individual color components (e.g. Red, Green, Blue).`,
      defaultData: {
        brightness: null,
        brightnessStart: `off`,
        brightnessEnd: `bright`,
        comment: ``
      }
    };
  }
};
</script>
