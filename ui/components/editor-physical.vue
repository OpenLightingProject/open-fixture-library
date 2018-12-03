<template>
  <div>

    <app-labeled-input :formstate="formstate" :name="`${namePrefix}-physical-dimensions`" label="Dimensions">
      <app-property-input-dimensions
        ref="firstInput"
        v-model="physical.dimensions"
        :name="`${namePrefix}-physical-dimensions`"
        :schema-property="properties.dimensionsXYZ"
        :hints="[`width`, `height`, `depth`]"
        :formstate="formstate"
        unit="mm" />
    </app-labeled-input>

    <app-labeled-input :formstate="formstate" :name="`${namePrefix}-physical-weight`" label="Weight">
      <app-property-input-number
        v-model="physical.weight"
        :name="`${namePrefix}-physical-weight`"
        :schema-property="properties.physical.weight" /> kg
    </app-labeled-input>

    <app-labeled-input :formstate="formstate" :name="`${namePrefix}-physical-power`" label="Power">
      <app-property-input-number
        v-model="physical.power"
        :name="`${namePrefix}-physical-power`"
        :schema-property="properties.physical.power" /> W
    </app-labeled-input>

    <app-labeled-input :formstate="formstate" :name="`${namePrefix}-physical-DMXconnector`" label="DMX connector">
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
    </app-labeled-input>


    <h4>Bulb</h4>

    <app-labeled-input :formstate="formstate" :name="`${namePrefix}-physical-bulb-type`" label="Bulb type">
      <app-property-input-text
        v-model="physical.bulb.type"
        :name="`${namePrefix}-physical-bulb-type`"
        :schema-property="properties.physicalBulb.type"
        hint="e.g. LED" />
    </app-labeled-input>

    <app-labeled-input :formstate="formstate" :name="`${namePrefix}-physical-bulb-colorTemperature`" label="Color temperature">
      <app-property-input-number
        v-model="physical.bulb.colorTemperature"
        :name="`${namePrefix}-physical-bulb-colorTemperature`"
        :schema-property="properties.physicalBulb.colorTemperature" /> K
    </app-labeled-input>

    <app-labeled-input :formstate="formstate" :name="`${namePrefix}-physical-bulb-lumens`" label="Lumens">
      <app-property-input-number
        v-model="physical.bulb.lumens"
        :name="`${namePrefix}-physical-bulb-lumens`"
        :schema-property="properties.physicalBulb.lumens" /> lm
    </app-labeled-input>


    <h4>Lens</h4>

    <app-labeled-input :formstate="formstate" :name="`${namePrefix}-physical-lens-name`" label="Lens name">
      <app-property-input-text
        v-model="physical.lens.name"
        :name="`${namePrefix}-physical-lens-name`"
        :schema-property="properties.physicalLens.name" />
    </app-labeled-input>

    <app-labeled-input :formstate="formstate" :name="`${namePrefix}-physical-lens-degreesMinMax`" label="Beam angle">
      <app-property-input-range
        v-model="physical.lens.degreesMinMax"
        :name="`${namePrefix}-physical-lens-degreesMinMax`"
        :schema-property="properties.physicalLens.degreesMinMax"
        :formstate="formstate"
        start-hint="min"
        end-hint="max"
        unit="°" />
    </app-labeled-input>


    <h4>Focus</h4>

    <app-labeled-input :formstate="formstate" :name="`${namePrefix}-physical-focus-type`" label="Focus type">
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
    </app-labeled-input>

    <app-labeled-input :formstate="formstate" :name="`${namePrefix}-physical-focus-panMax`" label="Pan maximum">
      <app-property-input-number
        v-model="physical.focus.panMax"
        :name="`${namePrefix}-physical-focus-panMax`"
        :disabled="panMaxInfinite"
        :schema-property="properties.physicalFocus.panMax.oneOf[0]" /> °

      <label class="infinitePanTilt">
        <input v-model="panMaxInfinite" :name="`${namePrefix}-physical-focus-panMaxInfinite`" type="checkbox"> Infinite pan
      </label>
    </app-labeled-input>

    <app-labeled-input :formstate="formstate" :name="`${namePrefix}-physical-focus-tiltMax`" label="Tilt maximum">
      <app-property-input-number
        v-model="physical.focus.tiltMax"
        :name="`${namePrefix}-physical-focus-tiltMax`"
        :disabled="tiltMaxInfinite"
        :schema-property="properties.physicalFocus.tiltMax.oneOf[0]" /> °

      <label class="infinitePanTilt">
        <input v-model="tiltMaxInfinite" :name="`${namePrefix}-physical-focus-tiltMaxInfinite`" type="checkbox"> Infinite tilt
      </label>
    </app-labeled-input>

  </div>
</template>

<style lang="scss" scoped>
.infinitePanTilt {
  margin-left: 2ex;
}
</style>

<script>
import schemaProperties from '~~/lib/schema-properties.js';

import labeledInputVue from '~/components/labeled-input.vue';
import propertyInputDimensionsVue from '~/components/property-input-dimensions.vue';
import propertyInputNumberVue from '~/components/property-input-number.vue';
import propertyInputRangeVue from '~/components/property-input-range.vue';
import propertyInputSelectVue from '~/components/property-input-select.vue';
import propertyInputTextVue from '~/components/property-input-text.vue';

export default {
  components: {
    'app-labeled-input': labeledInputVue,
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
    },
    panMaxInfinite: {
      get() {
        return this.physical.focus.panMax === `infinite`;
      },
      set(newIsInfinite) {
        this.physical.focus.panMax = newIsInfinite ? `infinite` : ``;
      }
    },
    tiltMaxInfinite: {
      get() {
        return this.physical.focus.tiltMax === `infinite`;
      },
      set(newIsInfinite) {
        this.physical.focus.tiltMax = newIsInfinite ? `infinite` : ``;
      }
    }
  },
  mounted: function() {
    if (this.$root._oflRestoreComplete) {
      this.$refs.firstInput.focus();
    }
  }
};
</script>
