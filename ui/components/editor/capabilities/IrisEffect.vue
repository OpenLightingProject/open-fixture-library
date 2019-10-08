<template>
  <div class="capability-type-data">

    <labeled-input
      :formstate="formstate"
      :name="`capability${capability.uuid}-effectName`"
      label="Effect name">
      <property-input-text
        v-model="capability.typeData.effectName"
        :formstate="formstate"
        :name="`capability${capability.uuid}-effectName`"
        :schema-property="properties.definitions.nonEmptyString"
        :required="true" />
    </labeled-input>

    <labeled-input
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`capability${capability.uuid}-speed`"
      label="Speed">
      <editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        property-name="speed" />
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
      hint: `This capability enables a non-static iris effect, e.g. pulse. Use the Iris type instead if a static degree of opening can be chosen.`,
      defaultData: {
        effectName: ``,
        speed: ``,
        speedStart: null,
        speedEnd: null,
        comment: ``
      }
    };
  }
};
</script>
