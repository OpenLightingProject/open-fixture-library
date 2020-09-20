<template>
  <div class="capability-type-data">

    <LabeledInput
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
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`capability${capability.uuid}-fogOutput`"
      label="Fog output">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        property-name="fogOutput" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      :name="`capability${capability.uuid}-comment`"
      label="Comment">
      <PropertyInputText
        v-model="capability.typeData.comment"
        :formstate="formstate"
        :name="`capability${capability.uuid}-comment`"
        :schema-property="properties.definitions.nonEmptyString" />
    </LabeledInput>

  </div>
</template>

<script>
import schemaProperties from '../../../../lib/schema-properties.js';

import EditorProportionalPropertySwitcher from '../EditorProportionalPropertySwitcher.vue';
import LabeledInput from '../../LabeledInput.vue';
import PropertyInputText from '../../PropertyInputText.vue';

export default {
  components: {
    EditorProportionalPropertySwitcher,
    LabeledInput,
    PropertyInputText,
  },
  props: {
    capability: {
      type: Object,
      required: true,
    },
    formstate: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      properties: schemaProperties,
      defaultData: {
        fogType: ``,
        fogOutput: ``,
        fogOutputStart: null,
        fogOutputEnd: null,
        comment: ``,
      },
    };
  },
  computed: {
    fogTypes() {
      return this.properties.capabilityTypes.Fog.properties.fogType.enum;
    },
  },
};
</script>
