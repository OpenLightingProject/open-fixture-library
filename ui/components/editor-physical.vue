<template>
  <div>

    <!-- TODO: validate this -->
    <section class="physical-dimensions">
      <span class="label">Dimensions</span>
      <span class="value">
        <app-property-input-number
          type="number"
          v-model="physical.dimensionsWidth"
          :schema-property="properties.dimensionsXYZ.items"
          hint="width"
          :required="dimensionRequired"
          ref="firstInput" />
        &times;
        <app-property-input-number
          type="number"
          v-model="physical.dimensionsHeight"
          :schema-property="properties.dimensionsXYZ.items"
          hint="height"
          :required="dimensionRequired" />
        &times;
        <app-property-input-number
          type="number"
          v-model="physical.dimensionsDepth"
          :schema-property="properties.dimensionsXYZ.items"
          hint="depth"
          :required="dimensionRequired" /> mm
        <span class="error-message" hidden />
      </span>
    </section>

    <app-simple-label :name="`${namePrefix}-physical-weight`" label="Weight" :formstate="formstate">
      <app-property-input-number
        type="number"
        :name="`${namePrefix}-physical-weight`"
        v-model="physical.weight"
        :schema-property="properties.physical.weight" /> kg
    </app-simple-label>

    <app-simple-label :name="`${namePrefix}-physical-power`" label="Power" :formstate="formstate">
      <app-property-input-number
        type="number"
        :name="`${namePrefix}-physical-power`"
        v-model="physical.power"
        :schema-property="properties.physical.power" /> W
    </app-simple-label>

    <!-- TODO: validate this -->
    <section class="physical-DMXconnector">
      <app-simple-label label="DMX connector">
        <app-property-input-select
          v-model="physical.DMXconnector"
          :schema-property="properties.physical.DMXconnector"
          addition-hint="other DMX connector" />
        <app-property-input-text
          v-if="physical.DMXconnector === `[add-value]`"
          class="addition"
          v-model="physical.DMXconnectorNew"
          :schema-property="properties.definitions.nonEmptyString"
          :required="true"
          :auto-focus="true"
          hint="other DMX connector" />
      </app-simple-label>
    </section>


    <h4>Bulb</h4>

    <app-simple-label :name="`${namePrefix}-physical-bulb-type`" label="Bulb type" :formstate="formstate">
      <app-property-input-text
        :name="`${namePrefix}-physical-bulb-type`"
        v-model="physical.bulb.type"
        :schema-property="properties.physicalBulb.type"
        hint="e.g. LED" />
    </app-simple-label>

    <app-simple-label :name="`${namePrefix}-physical-bulb-colorTemperature`" label="Color temperature" :formstate="formstate">
      <app-property-input-number
        type="number"
        :name="`${namePrefix}-physical-bulb-colorTemperature`"
        v-model="physical.bulb.colorTemperature"
        :schema-property="properties.physicalBulb.colorTemperature" /> K
    </app-simple-label>

    <app-simple-label :name="`${namePrefix}-physical-bulb-lumens`" label="Lumens" :formstate="formstate">
      <app-property-input-number
        type="number"
        :name="`${namePrefix}-physical-bulb-lumens`"
        v-model="physical.bulb.lumens"
        :schema-property="properties.physicalBulb.lumens" /> lm
    </app-simple-label>


    <h4>Lens</h4>

    <app-simple-label :name="`${namePrefix}-physical-lens-name`" label="Lens name" :formstate="formstate">
      <app-property-input-text
        :name="`${namePrefix}-physical-lens-name`"
        v-model="physical.lens.name"
        :schema-property="properties.physicalLens.name" />
    </app-simple-label>

    <!-- TODO: validate this -->
    <section class="physical-lens-degrees">
      <app-simple-label label="Light cone">
        <app-property-input-range
          :start-value="physical.lens.degreesMin"
          start-hint="min"
          @start-input="newStart => physical.lens.degreesMin = newStart"
          :end-value="physical.lens.degreesMax"
          end-hint="max"
          @end-input="newEnd => physical.lens.degreesMax = newEnd"
          :schema-property="properties.physicalLens.degreesMinMax.items"
          unit="°" />
      </app-simple-label>
    </section>


    <h4>Focus</h4>

    <!-- TODO: validate this -->
    <section class="physical-focus-type">
      <app-simple-label label="Focus type">
        <app-property-input-select
          v-model="physical.focus.type"
          :schema-property="properties.physicalFocus.type"
          addition-hint="other focus type" />
        <app-property-input-text
          v-if="physical.focus.type === `[add-value]`"
          class="addition"
          v-model="physical.focus.typeNew"
          :schema-property="properties.definitions.nonEmptyString"
          :required="true"
          :auto-focus="true"
          hint="other focus type" />
      </app-simple-label>
    </section>

    <app-simple-label :name="`${namePrefix}-physical-focus-panMax`" label="Pan maximum" :formstate="formstate">
      <app-property-input-number
        type="number"
        :name="`${namePrefix}-physical-focus-panMax`"
        v-model="physical.focus.panMax"
        :schema-property="properties.physicalFocus.panMax" /> °
    </app-simple-label>

    <app-simple-label :name="`${namePrefix}-physical-focus-tiltMax`" label="Tilt maximum" :formstate="formstate">
      <app-property-input-number
        type="number"
        :name="`${namePrefix}-physical-focus-tiltMax`"
        v-model="physical.focus.tiltMax"
        :schema-property="properties.physicalFocus.tiltMax" /> °
    </app-simple-label>

  </div>
</template>


<script>
import schemaProperties from '~~/lib/schema-properties.js';

import simpleLabelVue from '~/components/simple-label.vue';
import propertyInputNumberVue from '~/components/property-input-number.vue';
import propertyInputRangeVue from '~/components/property-input-range.vue';
import propertyInputSelectVue from '~/components/property-input-select.vue';
import propertyInputTextVue from '~/components/property-input-text.vue';

export default {
  components: {
    'app-simple-label': simpleLabelVue,
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
  methods: {
    mounted: function() {
      // TODO: if (Vue._oflRestoreComplete) {
      this.$refs.firstInput.focus();
    }
  }
};
</script>
