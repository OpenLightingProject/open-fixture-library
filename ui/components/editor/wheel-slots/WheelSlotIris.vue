<template>
  <div class="wheel-slot-type-data">

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`wheel-slot${wheelSlot.uuid}-openPercent`"
      label="Degree of opening">
      <PropertyInputEntity
        v-model="wheelSlot.typeData.openPercent"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-openPercent`"
        :schema-property="entitiesSchema.irisPercent" />
    </LabeledInput>

  </div>
</template>

<script setup lang="ts">
import { entitiesSchema } from '~~/lib/schema-properties.js';

interface Props {
  wheelSlot: {
    uuid: string;
    typeData: {
      openPercent?: string;
    };
  };
  formstate?: object;
}

const props = defineProps<Props>();

const defaultData = {
  openPercent: '',
};
</script>
