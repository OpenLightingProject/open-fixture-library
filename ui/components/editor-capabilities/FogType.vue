<template>
  <div class="capability-type-data">

    <app-labeled-input
      :formstate="formstate"
      :name="`capability${capability.uuid}-fogType`"
      label="Fog Type">
      <select
        v-model="capability.typeData.fogType"
        :class="{ empty: capability.typeData.fogType === `` }"
        :name="`capability${capability.uuid}-fogType`"
        required>

        <option value="" disabled>Please select a Fog Type</option>
        <option
          v-for="fogType in fogTypes"
          :key="fogType"
          :value="fogType">{{ fogType }}</option>

      </select>
    </app-labeled-input>

    <app-labeled-input
      :formstate="formstate"
      :name="`capability${capability.uuid}-comment`"
      label="Comment">
      <app-property-input-text
        v-model="capability.typeData.comment"
        :formstate="formstate"
        :name="`capability${capability.uuid}-comment`"
        :schema-property="properties.definitions.nonEmptyString" />
    </app-labeled-input>

  </div>
</template>

<script>
import schemaProperties from '~~/lib/schema-properties.js';

import editorProportionalCapabilityDataSwitcher from '~/components/editor-proportional-capability-data-switcher.vue';
import propertyInputTextVue from '~/components/property-input-text.vue';
import labeledInputVue from '~/components/labeled-input.vue';

export default {
  components: {
    'app-editor-proportional-capability-data-switcher': editorProportionalCapabilityDataSwitcher,
    'app-property-input-text': propertyInputTextVue,
    'app-labeled-input': labeledInputVue
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
      hint: `Doesn't activate fog, only selects the fog type (Fog or Haze).`,
      defaultData: {
        fogType: ``,
        comment: ``
      }
    };
  },
  computed: {
    fogTypes() {
      return this.properties.capabilityTypes.Fog.properties.fogType.enum;
    }
  }
};
</script>
