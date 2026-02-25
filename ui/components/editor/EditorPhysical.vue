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

<script>
import { objectProp, stringProp } from 'vue-ts-types';
import {
  physicalBulbProperties,
  physicalLensProperties,
  physicalProperties,
  schemaDefinitions,
} from '../../../lib/schema-properties.js';

import LabeledInput from '../LabeledInput.vue';
import PropertyInputDimensions from '../PropertyInputDimensions.vue';
import PropertyInputNumber from '../PropertyInputNumber.vue';
import PropertyInputRange from '../PropertyInputRange.vue';
import PropertyInputSelect from '../PropertyInputSelect.vue';
import PropertyInputText from '../PropertyInputText.vue';

export default {
  components: {
    LabeledInput,
    PropertyInputDimensions,
    PropertyInputNumber,
    PropertyInputRange,
    PropertyInputSelect,
    PropertyInputText,
  },
  model: {
    prop: `model-value`,
    event: `update:model-value`,
  },
  props: {
    modelValue: objectProp().required,
    formstate: objectProp().required,
    namePrefix: stringProp().required,
  },
  emits: {
    'update:model-value': value => true,
  },
  data() {
    return {
      schemaDefinitions,
      physicalProperties,
      physicalBulbProperties,
      physicalLensProperties,
      localPhysical: structuredClone(this.modelValue),
    };
  },
  watch: {
    localPhysical: {
      handler() {
        this.$emit(`update:model-value`, structuredClone(this.localPhysical));
      },
      deep: true,
    },
    'modelValue.DMXconnector': async function(newValue) {
      if (newValue === `[add-value]` && this.$root._oflRestoreComplete) {
        await this.$nextTick();
        this.$refs.newDmxConnectorInput.focus();
      }
    },
  },
  mounted() {
    if (this.$root._oflRestoreComplete) {
      this.$refs.firstInput.focus();
    }
  },
};
</script>
