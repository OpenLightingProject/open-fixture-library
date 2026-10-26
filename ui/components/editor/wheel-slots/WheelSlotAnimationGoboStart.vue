<template>
  <div class="wheel-slot-type-data">

    <LabeledInput
      :formstate="formstate"
      :name="`wheel-slot${wheelSlot.uuid}-name`"
      label="Animation gobo name">
      <PropertyInputText
        v-model="wheelSlot.typeData.name"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-name`"
        :schema-property="schemaDefinitions.nonEmptyString" />
    </LabeledInput>

  </div>
</template>

<script setup lang="ts">
import { schemaDefinitions } from '~~/lib/schema-properties.js';

interface Properties {
  wheelSlot: {
    uuid: string;
    typeData: {
      name?: string;
    };
  };
  formstate?: object;
}

defineProps<Properties>();

const defaultData = {
  name: '',
};

defineExpose({
  defaultData,
});
</script>
