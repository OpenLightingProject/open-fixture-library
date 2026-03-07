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
        required
        property-name="parameter" />
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
import { schemaDefinitions } from '~~/lib/schema-properties.js';

interface Props {
  capability: {
    uuid: string;
    typeData: {
      parameter?: string | null;
      parameterStart?: string;
      parameterEnd?: string;
      comment?: string;
    };
  };
  formstate?: object;
}

defineProps<Props>();

const hint = `Doesn't activate an effect, only controls a generic parameter of running effects.`;

const defaultData = {
  parameter: null,
  parameterStart: 'low',
  parameterEnd: 'high',
  comment: '',
};
</script>
