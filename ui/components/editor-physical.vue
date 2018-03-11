<template>
  <div>

    <app-simple-label :formstate="formstate" :name="`${namePrefix}-physical-dimensions`" label="Dimensions">
      <app-property-input-dimensions
        ref="firstInput"
        v-model="physical.dimensions"
        :name="`${namePrefix}-physical-dimensions`"
        :schema-property="properties.dimensionsXYZ"
        :hints="[`width`, `height`, `depth`]"
        :formstate="formstate"
        unit="mm" />
    </app-simple-label>

    <app-simple-label :formstate="formstate" :name="`${namePrefix}-physical-weight`" label="Weight">
      <app-property-input-number
        v-model="physical.weight"
        :name="`${namePrefix}-physical-weight`"
        :schema-property="properties.physical.weight" /> kg
    </app-simple-label>

    <app-simple-label :formstate="formstate" :name="`${namePrefix}-physical-power`" label="Power">
      <app-property-input-number
        v-model="physical.power"
        :name="`${namePrefix}-physical-power`"
        :schema-property="properties.physical.power" /> W
    </app-simple-label>

    <app-simple-label :formstate="formstate" :name="`${namePrefix}-physical-DMXconnector`" label="DMX connector">
      <app-property-input-select
        v-model="physical.DMXconnector"
        :name="`${namePrefix}-physical-DMXconnector`"
        :schema-property="properties.physical.DMXconnector"
        addition-hint="other DMX connector" />
      <validate
        v-if="physical.DMXconnector === `[add-value]`"
        :state="formstate"
        tag="span">
        <app-property-input-text
          v-model="physical.DMXconnectorNew"
          :name="`${namePrefix}-physical-DMXconnectorNew`"
          :schema-property="properties.definitions.nonEmptyString"
          :required="true"
          :auto-focus="true"
          hint="other DMX connector"
          class="addition" />
      </validate>
    </app-simple-label>


    <h4>Bulb</h4>

    <app-simple-label :formstate="formstate" :name="`${namePrefix}-physical-bulb-type`" label="Bulb type">
      <app-property-input-text
        :name="`${namePrefix}-physical-bulb-type`"
        v-model="physical.bulb.type"
        :schema-property="properties.physicalBulb.type"
        hint="e.g. LED" />
    </app-simple-label>

    <app-simple-label :formstate="formstate" :name="`${namePrefix}-physical-bulb-colorTemperature`" label="Color temperature">
      <app-property-input-number
        v-model="physical.bulb.colorTemperature"
        :name="`${namePrefix}-physical-bulb-colorTemperature`"
        :schema-property="properties.physicalBulb.colorTemperature" /> K
    </app-simple-label>

    <app-simple-label :formstate="formstate" :name="`${namePrefix}-physical-bulb-lumens`" label="Lumens">
      <app-property-input-number
        v-model="physical.bulb.lumens"
        :name="`${namePrefix}-physical-bulb-lumens`"
        :schema-property="properties.physicalBulb.lumens" /> lm
    </app-simple-label>


    <h4>Lens</h4>

    <app-simple-label :formstate="formstate" :name="`${namePrefix}-physical-lens-name`" label="Lens name">
      <app-property-input-text
        :name="`${namePrefix}-physical-lens-name`"
        v-model="physical.lens.name"
        :schema-property="properties.physicalLens.name" />
    </app-simple-label>

    <app-simple-label :formstate="formstate" :name="`${namePrefix}-physical-lens-degreesMinMax`" label="Light cone">
      <app-property-input-range
        v-model="physical.lens.degreesMinMax"
        :name="`${namePrefix}-physical-lens-degreesMinMax`"
        :schema-property="properties.physicalLens.degreesMinMax"
        start-hint="min"
        end-hint="max"
        unit="°" />
    </app-simple-label>


    <h4>Focus</h4>

    <app-simple-label :formstate="formstate" :name="`${namePrefix}-physical-focus-type`" label="Focus type">
      <app-property-input-select
        v-model="physical.focus.type"
        :name="`${namePrefix}-physical-focus-type`"
        :schema-property="properties.physicalFocus.type"
        addition-hint="other focus type" />
      <validate
        v-if="physical.focus.type === `[add-value]`"
        :state="formstate"
        tag="span">
        <app-property-input-text
          v-model="physical.focus.typeNew"
          :name="`${namePrefix}-physical-focus-typeNew`"
          :schema-property="properties.definitions.nonEmptyString"
          :required="true"
          :auto-focus="true"
          hint="other focus type"
          class="addition" />
      </validate>
    </app-simple-label>

    <app-simple-label :formstate="formstate" :name="`${namePrefix}-physical-focus-panMax`" label="Pan maximum">
      <app-property-input-number
        v-model="physical.focus.panMax"
        :name="`${namePrefix}-physical-focus-panMax`"
        :schema-property="properties.physicalFocus.panMax" /> °
    </app-simple-label>

    <app-simple-label :formstate="formstate" :name="`${namePrefix}-physical-focus-tiltMax`" label="Tilt maximum">
      <app-property-input-number
        v-model="physical.focus.tiltMax"
        :name="`${namePrefix}-physical-focus-tiltMax`"
        :schema-property="properties.physicalFocus.tiltMax" /> °
    </app-simple-label>

  </div>
</template>


<script>
import schemaProperties from '~~/lib/schema-properties.js';

import simpleLabelVue from '~/components/simple-label.vue';
import propertyInputDimensionsVue from '~/components/property-input-dimensions.vue';
import propertyInputNumberVue from '~/components/property-input-number.vue';
import propertyInputRangeVue from '~/components/property-input-range.vue';
import propertyInputSelectVue from '~/components/property-input-select.vue';
import propertyInputTextVue from '~/components/property-input-text.vue';

export default {
  components: {
    'app-simple-label': simpleLabelVue,
    'app-property-input-dimensions': propertyInputDimensionsVue,
    'app-property-input-number': propertyInputNumberVue,
    'app-property-input-range': propertyInputRangeVue,
    'app-property-input-select': propertyInputSelectVue,
    'app-property-input-text': propertyInputTextVue
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
    // TODO: if (Vue._oflRestoreComplete) {
    this.$refs.firstInput.focus();
  }
};
</script>
