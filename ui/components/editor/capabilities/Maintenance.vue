<template>
  <div class="capability-type-data">

    <labeled-input
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`capability${capability.uuid}-parameter`"
      label="Parameter">
      <editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        property-name="parameter" />
    </labeled-input>

    <labeled-input
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`capability${capability.uuid}-hold`"
      label="Hold">
      <property-input-entity
        v-model="capability.typeData.hold"
        :name="`capability${capability.uuid}-hold`"
        :schema-property="holdSchema" />
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
        parameter: ``,
        parameterStart: null,
        parameterEnd: null,
        hold: ``,
        comment: ``
      }
    };
  },
  computed: {
    holdSchema() {
      const propertySchema = this.properties.capabilityTypes.Maintenance.properties.hold;
      const entityName = propertySchema.$ref.replace(`definitions.json#/entities/`, ``);

      return this.properties.entities[entityName];
    }
  }
};
</script>
