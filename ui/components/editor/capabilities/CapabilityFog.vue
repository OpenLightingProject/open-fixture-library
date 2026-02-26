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
      multiple-inputs
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
      fogOutput?: string;
      fogOutputStart?: string | null;
      fogOutputEnd?: string | null;
      comment?: string;
    };
  };
  formstate?: object;
}

defineProps<Props>();

const fogTypes = capabilityTypes.Fog.properties.fogType.enum;

const defaultData = {
  fogType: '',
  fogOutput: '',
  fogOutputStart: null,
  fogOutputEnd: null,
  comment: '',
};
</script>
