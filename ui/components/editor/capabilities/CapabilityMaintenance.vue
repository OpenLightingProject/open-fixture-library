<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-parameter`"
      label="Parameter">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        property-name="parameter" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
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
        :schema-property="schemaDefinitions.nonEmptyString" />
    </LabeledInput>

  </div>
</template>

<script>
import { objectProp } from 'vue-ts-types';
import { capabilityTypes, entitiesSchema, schemaDefinitions } from '../../../../lib/schema-properties.js';

import LabeledInput from '../../LabeledInput.vue';
import PropertyInputEntity from '../../PropertyInputEntity.vue';
import PropertyInputText from '../../PropertyInputText.vue';
import EditorProportionalPropertySwitcher from '../EditorProportionalPropertySwitcher.vue';

export default {
  components: {
    EditorProportionalPropertySwitcher,
    LabeledInput,
    PropertyInputEntity,
    PropertyInputText,
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional,
  },
  data() {
    const holdPropertySchema = capabilityTypes.Maintenance.properties.hold;
    const holdEntityName = holdPropertySchema.$ref.replace(`definitions.json#/entities/`, ``);

    return {
      schemaDefinitions,
      holdSchema: entitiesSchema[holdEntityName],

      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        parameter: ``,
        parameterStart: null,
        parameterEnd: null,
        hold: ``,
        comment: ``,
      },
    };
  },
};
</script>
