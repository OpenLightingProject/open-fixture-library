<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`capability${capability.uuid}-parameter`"
      label="Parameter">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        property-name="parameter" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`capability${capability.uuid}-hold`"
      label="Hold">
      <PropertyInputEntity
        v-model="capability.typeData.hold"
        :name="`capability${capability.uuid}-hold`"
        :schema-property="holdSchema" />
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
import PropertyInputEntity from '../../PropertyInputEntity.vue';
import PropertyInputText from '../../PropertyInputText.vue';

export default {
  components: {
    EditorProportionalPropertySwitcher,
    LabeledInput,
    PropertyInputEntity,
    PropertyInputText
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
