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

<script setup lang="ts">
import { capabilityTypes, entitiesSchema, schemaDefinitions } from '~~/lib/schema-properties.js';

interface Props {
  capability: {
    uuid: string;
    typeData: {
      parameter?: string;
      parameterStart?: string | null;
      parameterEnd?: string | null;
      hold?: string;
      comment?: string;
    };
  };
  formstate?: object;
}

defineProps<Props>();

const holdPropertySchema = capabilityTypes.Maintenance.properties.hold;
const holdEntityName = holdPropertySchema.$ref.replace('definitions.json#/entities/', '');
const holdSchema = entitiesSchema[holdEntityName];

const defaultData = {
  parameter: '',
  parameterStart: null,
  parameterEnd: null,
  hold: '',
  comment: '',
};
</script>
