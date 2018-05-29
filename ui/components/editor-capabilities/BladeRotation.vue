<template>
  <div class="capability-type-data">

    <app-editor-proportional-capability-data-switcher
      :capability="capability"
      :formstate="formstate"
      property-name="angle"
      property-display-name="Angle" />

    <!-- TODO: allow numbers for blade -->
    <app-simple-label
      :formstate="formstate"
      :name="`capability${capability.uuid}-blade`"
      label="Blade">
      <select
        v-model="capability.typeData.blade"
        :class="{ empty: capability.typeData.blade === `` }"
        :name="`capability${capability.uuid}-blade`"
        required>

        <option value="" disabled>Please select a blade</option>
        <option
          v-for="blade in blades"
          :key="blade"
          :value="blade">{{ blade }}</option>

      </select>
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
      blades: [
        `Top`,
        `Right`,
        `Bottom`,
        `Left`
      ],
      defaultData: {
        angle: ``,
        angleStart: null,
        angleEnd: null,
        blade: ``,
        comment: ``
      }
    };
  }
};
</script>
