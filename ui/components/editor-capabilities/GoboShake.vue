<template>
  <div class="capability-type-data">

    <app-simple-label
      :formstate="formstate"
      :name="`capability${capability.uuid}-shakeAngle`"
      label="Shake Angle">
      <app-editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        property-name="shakeAngle" />
    </app-simple-label>

    <app-simple-label
      :formstate="formstate"
      :name="`capability${capability.uuid}-shakeSpeed`"
      label="Shake Speed">
      <app-editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        property-name="shakeSpeed" />
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
      required: true
    }
  },
  data() {
    return {
      properties: schemaProperties,
      hint: `This capability just enables gobo shaking; the actual gobo selection happens in another channel's GoboIndex capability.`,
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
