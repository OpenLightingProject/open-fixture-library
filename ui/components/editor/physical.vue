<template>
  <div>

    <labeled-input
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`${namePrefix}-physical-dimensions`"
      label="Dimensions">
      <property-input-dimensions
        ref="firstInput"
        v-model="physical.dimensions"
        :name="`${namePrefix}-physical-dimensions`"
        :schema-property="properties.dimensionsXYZ"
        :hints="[`width`, `height`, `depth`]"
        :formstate="formstate"
        unit="mm" />
    </labeled-input>

    <labeled-input :formstate="formstate" :name="`${namePrefix}-physical-weight`" label="Weight">
      <property-input-number
        v-model="physical.weight"
        :name="`${namePrefix}-physical-weight`"
        :schema-property="properties.physical.weight" /> kg
    </labeled-input>

    <labeled-input :formstate="formstate" :name="`${namePrefix}-physical-power`" label="Power">
      <property-input-number
        v-model="physical.power"
        :name="`${namePrefix}-physical-power`"
        :schema-property="properties.physical.power" /> W
    </labeled-input>

    <labeled-input
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`${namePrefix}-physical-DMXconnector`"
      label="DMX connector">
      <property-input-select
        v-model="physical.DMXconnector"
        :name="`${namePrefix}-physical-DMXconnector`"
        :schema-property="properties.physical.DMXconnector"
        addition-hint="other DMX connector" />
      <validate
        v-if="physical.DMXconnector === `[add-value]`"
        :state="formstate"
        tag="span">
        <property-input-text
          v-model="physical.DMXconnectorNew"
          :name="`${namePrefix}-physical-DMXconnectorNew`"
          :schema-property="properties.definitions.nonEmptyString"
          :required="true"
          :auto-focus="true"
          hint="other DMX connector"
          class="addition" />
      </validate>
    </labeled-input>


    <h4>Bulb</h4>

    <labeled-input :formstate="formstate" :name="`${namePrefix}-physical-bulb-type`" label="Bulb type">
      <property-input-text
        v-model="physical.bulb.type"
        :name="`${namePrefix}-physical-bulb-type`"
        :schema-property="properties.physicalBulb.type"
        hint="e.g. LED" />
    </labeled-input>

    <labeled-input :formstate="formstate" :name="`${namePrefix}-physical-bulb-colorTemperature`" label="Color temperature">
      <property-input-number
        v-model="physical.bulb.colorTemperature"
        :name="`${namePrefix}-physical-bulb-colorTemperature`"
        :schema-property="properties.physicalBulb.colorTemperature" /> K
    </labeled-input>

    <labeled-input :formstate="formstate" :name="`${namePrefix}-physical-bulb-lumens`" label="Lumens">
      <property-input-number
        v-model="physical.bulb.lumens"
        :name="`${namePrefix}-physical-bulb-lumens`"
        :schema-property="properties.physicalBulb.lumens" /> lm
    </labeled-input>


    <h4>Lens</h4>

    <labeled-input :formstate="formstate" :name="`${namePrefix}-physical-lens-name`" label="Lens name">
      <property-input-text
        v-model="physical.lens.name"
        :name="`${namePrefix}-physical-lens-name`"
        :schema-property="properties.physicalLens.name" />
    </labeled-input>

    <labeled-input
      :formstate="formstate"
      :multiple-inputs="true"
      :name="`${namePrefix}-physical-lens-degreesMinMax`"
      label="Beam angle">
      <property-input-range
        v-model="physical.lens.degreesMinMax"
        :name="`${namePrefix}-physical-lens-degreesMinMax`"
        :schema-property="properties.physicalLens.degreesMinMax"
        :formstate="formstate"
        start-hint="min"
        end-hint="max"
        unit="°" />
    </labeled-input>

  </div>
</template>

<style lang="scss" scoped>
.infinitePanTilt {
  margin-left: 2ex;
}
</style>

<script>
import schemaProperties from '../../../lib/schema-properties.js';

import labeledInput from '../labeled-input.vue';
import propertyInputDimensions from './property-input-dimensions.vue';
import propertyInputNumber from './property-input-number.vue';
import propertyInputRange from './property-input-range.vue';
import propertyInputSelect from './property-input-select.vue';
import propertyInputText from './property-input-text.vue';

export default {
  components: {
    'labeled-input': labeledInput,
    'property-input-dimensions': propertyInputDimensions,
    'property-input-number': propertyInputNumber,
    'property-input-range': propertyInputRange,
    'property-input-select': propertyInputSelect,
    'property-input-text': propertyInputText
  },
  model: {
    prop: `physical`
  },
  props: {
    physical: {
      type: Object,
      required: true
    },
    formstate: {
      type: Object,
      required: true
    },
    namePrefix: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      properties: schemaProperties
    };
  },
  computed: {
    dimensionRequired() {
      return this.physical.dimensionsWidth !== null || this.physical.dimensionsHeight !== null || this.physical.dimensionsDepth !== null;
    }
  },
  mounted: function() {
    if (this.$root._oflRestoreComplete) {
      this.$refs.firstInput.focus();
    }
  }
};
</script>
