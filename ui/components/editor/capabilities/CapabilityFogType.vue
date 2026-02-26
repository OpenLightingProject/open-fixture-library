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
          v-for="fogType of fogTypes"
          :key="fogType"
          :value="fogType">{{ fogType }}</option>

      </select>
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
import { capabilityTypes, schemaDefinitions } from '~~/lib/schema-properties.js';

interface Props {
  capability: {
    uuid: string;
    typeData: {
      fogType?: string;
      comment?: string;
    };
  };
  formstate?: object;
}

defineProps<Props>();

const fogTypes = capabilityTypes.Fog.properties.fogType.enum;

const hint = `Doesn't activate fog, only selects the fog type (Fog or Haze).`;

const defaultData = {
  fogType: '',
  comment: '',
};
</script>
