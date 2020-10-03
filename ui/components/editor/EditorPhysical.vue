<template>
  <div>

    <LabeledInput
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`${namePrefix}-physical-dimensions`"
      label="Dimensions">
      <PropertyInputDimensions
        ref="firstInput"
        v-model="localPhysical.dimensions"
        :name="`${namePrefix}-physical-dimensions`"
        :schema-property="properties.dimensionsXYZ"
        :hints="[`width`, `height`, `depth`]"
        :formstate="formstate"
        unit="mm" />
    </LabeledInput>

    <LabeledInput :formstate="formstate" :name="`${namePrefix}-physical-weight`" label="Weight">
      <PropertyInputNumber
        v-model="localPhysical.weight"
        :name="`${namePrefix}-physical-weight`"
        :schema-property="properties.physical.weight" /> kg
    </LabeledInput>

    <LabeledInput :formstate="formstate" :name="`${namePrefix}-physical-power`" label="Power">
      <PropertyInputNumber
        v-model="localPhysical.power"
        :name="`${namePrefix}-physical-power`"
        :schema-property="properties.physical.power" /> W
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`${namePrefix}-physical-DMXconnector`"
      label="DMX connector">
      <PropertyInputSelect
        v-model="localPhysical.DMXconnector"
        :name="`${namePrefix}-physical-DMXconnector`"
        :schema-property="properties.physical.DMXconnector"
        addition-hint="other DMX connector" />
      <Validate
        v-if="physical.DMXconnector === `[add-value]`"
        :state="formstate"
        tag="span">
        <PropertyInputText
          v-model="localPhysical.DMXconnectorNew"
          :name="`${namePrefix}-physical-DMXconnectorNew`"
          :schema-property="properties.definitions.nonEmptyString"
          :required="true"
          :auto-focus="true"
          hint="other DMX connector"
          class="addition" />
      </Validate>
    </LabeledInput>


    <h4>Bulb</h4>

    <LabeledInput :formstate="formstate" :name="`${namePrefix}-physical-bulb-type`" label="Bulb type">
      <PropertyInputText
        v-model="localPhysical.bulb.type"
        :name="`${namePrefix}-physical-bulb-type`"
        :schema-property="properties.physicalBulb.type"
        hint="e.g. LED" />
    </LabeledInput>

    <LabeledInput :formstate="formstate" :name="`${namePrefix}-physical-bulb-colorTemperature`" label="Color temperature">
      <PropertyInputNumber
        v-model="localPhysical.bulb.colorTemperature"
        :name="`${namePrefix}-physical-bulb-colorTemperature`"
        :schema-property="properties.physicalBulb.colorTemperature" /> K
    </LabeledInput>

    <LabeledInput :formstate="formstate" :name="`${namePrefix}-physical-bulb-lumens`" label="Lumens">
      <PropertyInputNumber
        v-model="localPhysical.bulb.lumens"
        :name="`${namePrefix}-physical-bulb-lumens`"
        :schema-property="properties.physicalBulb.lumens" /> lm
    </LabeledInput>


    <h4>Lens</h4>

    <LabeledInput :formstate="formstate" :name="`${namePrefix}-physical-lens-name`" label="Lens name">
      <PropertyInputText
        v-model="localPhysical.lens.name"
        :name="`${namePrefix}-physical-lens-name`"
        :schema-property="properties.physicalLens.name" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`${namePrefix}-physical-lens-degreesMinMax`"
      label="Beam angle">
      <PropertyInputRange
        v-model="localPhysical.lens.degreesMinMax"
        :name="`${namePrefix}-physical-lens-degreesMinMax`"
        :schema-property="properties.physicalLens.degreesMinMax"
        :formstate="formstate"
        start-hint="min"
        end-hint="max"
        unit="°" />
    </LabeledInput>

  </div>
</template>

<style lang="scss" scoped>
.infinitePanTilt {
  margin-left: 2ex;
}
</style>

<script>
import { clone } from '../../assets/scripts/editor-utils.js';
import schemaProperties from '../../../lib/schema-properties.js';

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
    prop: `physical`,
  },
  props: {
    physical: {
      type: Object,
      required: true,
    },
    formstate: {
      type: Object,
      required: true,
    },
    namePrefix: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      properties: schemaProperties,
      localPhysical: clone(this.physical),
    };
  },
  watch: {
    localPhysical: {
      handler() {
        this.$emit(`input`, clone(this.localPhysical));
      },
      deep: true,
    },
  },
  mounted() {
    if (this.$root._oflRestoreComplete) {
      this.$refs.firstInput.focus();
    }
  },
};
</script>
