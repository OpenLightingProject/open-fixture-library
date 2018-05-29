<template>
  <div class="capability-type-data">

    <app-editor-proportional-capability-data-switcher
      :capability="capability"
      :formstate="formstate"
      property-name="shakeAngle"
      property-display-name="Shake Angle" />

    <app-editor-proportional-capability-data-switcher
      :capability="capability"
      :formstate="formstate"
      property-name="shakeSpeed"
      property-display-name="Shake Speed" />

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
        shakeAngle: ``,
        shakeAngleStart: null,
        shakeAngleEnd: null,
        shakeSpeed: ``,
        shakeSpeedStart: null,
        shakeSpeedEnd: null,
        comment: ``
      }
    };
  }
};
</script>
