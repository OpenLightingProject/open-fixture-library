<template>
  <div class="wheel-slot-type-data">

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`wheel-slot${wheelSlot.uuid}-frostIntensity`"
      label="Frost intensity">
      <PropertyInputEntity
        v-model="wheelSlot.typeData.frostIntensity"
        :formstate="formstate"
        :name="`wheel-slot${wheelSlot.uuid}-frostIntensity`"
        :schema-property="entitiesSchema.percent" />
    </LabeledInput>

  </div>
</template>

<script setup lang="ts">
import { entitiesSchema } from '~~/lib/schema-properties.js';

interface Props {
  wheelSlot: {
    uuid: string;
    typeData: {
      frostIntensity?: string;
    };
  };
  formstate?: object;
}

const props = defineProps<Props>();

const defaultData = {
  frostIntensity: '',
};
</script>
