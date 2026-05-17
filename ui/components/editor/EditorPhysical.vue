<template>
  <div>

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`${namePrefix}-physical-dimensions`"
      label="Dimensions">
      <PropertyInputDimensions
        ref="firstInput"
        v-model="localPhysical.dimensions"
        :name="`${namePrefix}-physical-dimensions`"
        :schema-property="schemaDefinitions.dimensionsXYZ"
        :hints="[`width`, `height`, `depth`]"
        :formstate="formstate"
        unit="mm" />
    </LabeledInput>

    <LabeledInput :formstate="formstate" :name="`${namePrefix}-physical-weight`" label="Weight">
      <PropertyInputNumber
        v-model="localPhysical.weight"
        :name="`${namePrefix}-physical-weight`"
        :schema-property="physicalProperties.weight" /> kg
    </LabeledInput>

    <LabeledInput :formstate="formstate" :name="`${namePrefix}-physical-power`" label="Power">
      <PropertyInputNumber
        v-model="localPhysical.power"
        :name="`${namePrefix}-physical-power`"
        :schema-property="physicalProperties.power" /> W
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`${namePrefix}-physical-DMXconnector`"
      label="DMX connector">
      <PropertyInputSelect
        v-model="localPhysical.DMXconnector"
        :name="`${namePrefix}-physical-DMXconnector`"
        :schema-property="physicalProperties.DMXconnector"
        addition-hint="other DMX connector" />
      <Validate
        v-if="modelValue.DMXconnector === `[add-value]`"
        :state="formstate"
        tag="span">
        <PropertyInputText
          ref="newDmxConnectorInput"
          v-model="localPhysical.DMXconnectorNew"
          :name="`${namePrefix}-physical-DMXconnectorNew`"
          :schema-property="schemaDefinitions.nonEmptyString"
          required
          hint="other DMX connector"
          class="addition" />
      </Validate>
    </LabeledInput>

    <h4>Bulb</h4>

    <LabeledInput :formstate="formstate" :name="`${namePrefix}-physical-bulb-type`" label="Bulb type">
      <PropertyInputText
        v-model="localPhysical.bulb.type"
        :name="`${namePrefix}-physical-bulb-type`"
        :schema-property="physicalBulbProperties.type"
        hint="e.g. LED" />
    </LabeledInput>

    <LabeledInput :formstate="formstate" :name="`${namePrefix}-physical-bulb-colorTemperature`" label="Color temperature">
      <PropertyInputNumber
        v-model="localPhysical.bulb.colorTemperature"
        :name="`${namePrefix}-physical-bulb-colorTemperature`"
        :schema-property="physicalBulbProperties.colorTemperature" /> K
    </LabeledInput>

    <LabeledInput :formstate="formstate" :name="`${namePrefix}-physical-bulb-lumens`" label="Lumens">
      <PropertyInputNumber
        v-model="localPhysical.bulb.lumens"
        :name="`${namePrefix}-physical-bulb-lumens`"
        :schema-property="physicalBulbProperties.lumens" /> lm
    </LabeledInput>

    <h4>Lens</h4>

    <LabeledInput :formstate="formstate" :name="`${namePrefix}-physical-lens-name`" label="Lens name">
      <PropertyInputText
        v-model="localPhysical.lens.name"
        :name="`${namePrefix}-physical-lens-name`"
        :schema-property="physicalLensProperties.name" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`${namePrefix}-physical-lens-degreesMinMax`"
      label="Beam angle">
      <PropertyInputRange
        v-model="localPhysical.lens.degreesMinMax"
        :name="`${namePrefix}-physical-lens-degreesMinMax`"
        :schema-property="physicalLensProperties.degreesMinMax"
        :formstate="formstate"
        start-hint="min"
        end-hint="max"
        unit="°" />
    </LabeledInput>

  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, nextTick } from 'vue';
import {
  physicalBulbProperties,
  physicalLensProperties,
  physicalProperties,
  schemaDefinitions,
} from '~~/lib/schema-properties.js';

interface Physical {
  dimensions?: [number, number, number] | null;
  weight?: number | null;
  power?: number | null;
  DMXconnector?: string | null;
  DMXconnectorNew?: string;
  bulb: {
    type?: string;
    colorTemperature?: number | null;
    lumens?: number | null;
  };
  lens: {
    name?: string;
    degreesMinMax?: [number, number] | null;
  };
}

interface Props {
  modelValue: Physical;
  formstate: object;
  namePrefix: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:model-value': [value: Physical];
}>();

const instance = getCurrentInstance();
const firstInput = ref<any>(null);
const newDmxConnectorInput = ref<any>(null);

const localPhysical = ref<Physical>(structuredClone(props.modelValue));

watch(
  localPhysical,
  () => {
    emit('update:model-value', structuredClone(localPhysical.value));
  },
  { deep: true }
);

watch(
  () => props.modelValue.DMXconnector,
  async (newValue) => {
    if (newValue === '[add-value]' && (instance?.proxy?.$root as any)?._oflRestoreComplete) {
      await nextTick();
      newDmxConnectorInput.value?.focus();
    }
  }
);

onMounted(() => {
  if ((instance?.proxy?.$root as any)?._oflRestoreComplete) {
    firstInput.value?.focus();
  }
});
</script>
