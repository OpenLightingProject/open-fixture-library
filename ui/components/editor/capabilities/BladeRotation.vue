<template>
  <div class="capability-type-data">

    <labeled-input
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`capability${capability.uuid}-blade`"
      label="Blade">
      <property-input-entity
        v-model="capability.typeData.blade"
        :name="`capability${capability.uuid}-blade`"
        :schema-property="bladeSchema"
        :required="true" />
    </labeled-input>

    <labeled-input
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`capability${capability.uuid}-angle`"
      label="Angle">
      <editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        :required="true"
        property-name="angle" />
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
import propertyInputEntity from '../property-input-entity.vue';
import propertyInputText from '../property-input-text.vue';
import labeledInput from '../../labeled-input.vue';

export default {
  components: {
    'editor-proportional-capability-data-switcher': editorProportionalCapabilityDataSwitcher,
    'property-input-entity': propertyInputEntity,
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
        blade: ``,
        angle: null,
        angleStart: `0deg`,
        angleEnd: `360deg`,
        comment: ``
      }
    };
  },
  computed: {
    bladeSchema() {
      return this.properties.capabilityTypes.BladeInsertion.properties.blade;
    }
  }
};
</script>
