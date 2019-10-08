<template>
  <div class="capability-type-data">

    <labeled-input
      :formstate="formstate"
      :name="`capability${capability.uuid}-fogType`"
      label="Fog type">
      <select
        v-model="capability.typeData.fogType"
        :class="{ empty: capability.typeData.fogType === `` }"
        :name="`capability${capability.uuid}-fogType`"
        required>

        <option value="" disabled>Please select a fog type</option>
        <option
          v-for="fogType in fogTypes"
          :key="fogType"
          :value="fogType">{{ fogType }}</option>

      </select>
    </labeled-input>

    <labeled-input
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`capability${capability.uuid}-fogOutput`"
      label="Fog output">
      <editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        property-name="fogOutput" />
    </labeled-input>

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

import editorProportionalCapabilityDataSwitcher from '../proportional-capability-data-switcher.vue';
import propertyInputText from '../property-input-text.vue';
import labeledInput from '../../labeled-input.vue';

export default {
  components: {
    'editor-proportional-capability-data-switcher': editorProportionalCapabilityDataSwitcher,
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
        fogType: ``,
        fogOutput: ``,
        fogOutputStart: null,
        fogOutputEnd: null,
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
