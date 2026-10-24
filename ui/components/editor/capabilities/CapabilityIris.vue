<template>
  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-openPercent`"
      label="Degree of opening">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        required
        property-name="openPercent" />
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
      openPercent?: string | null;
      openPercentStart?: string;
      openPercentEnd?: string;
      comment?: string;
    };
  };
  formstate?: object;
}

defineProps<Props>();

const defaultData = {
  openPercent: null,
  openPercentStart: 'open',
  openPercentEnd: 'closed',
  comment: '',
};
</script>
