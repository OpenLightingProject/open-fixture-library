<template>
  <div class="wheel-slot-type-data">

    <LabeledInput
      :formstate="formstate"
      :name="`wheel-slot${wheelSlot.uuid}-name`"
      label="Prism name">
      <PropertyInputText
        v-model="wheelSlot.typeData.name"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-name`"
        :schema-property="schemaDefinitions.nonEmptyString" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      :name="`wheel-slot${wheelSlot.uuid}-facets`"
      label="Facets">
      <PropertyInputNumber
        v-model="wheelSlot.typeData.facets"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-facets`"
        :schema-property="facetsSchema" />
    </LabeledInput>

  </div>
</template>

<script setup lang="ts">
import { schemaDefinitions, wheelSlotTypes } from '~~/lib/schema-properties.js';

interface Props {
  wheelSlot: {
    uuid: string;
    typeData: {
      name?: string;
      facets?: string;
    };
  };
  formstate?: object;
}

const props = defineProps<Props>();

const facetsSchema = wheelSlotTypes.Prism.properties.facets;

const defaultData = {
  name: '',
  facets: '',
};
</script>
