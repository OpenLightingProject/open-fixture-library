<template>
  <div>

    <section class="physical-dimensions validate-group">
      <span class="label">Dimensions</span>
      <span class="value">
        <app-property-input
          type="number"
          v-model="value.dimensionsWidth"
          :schema-property="properties.dimensionsXYZ.items"
          hint="width"
          :required="dimensionRequired"
          ref="firstInput" />
        &times;
        <app-property-input
          type="number"
          v-model="value.dimensionsHeight"
          :schema-property="properties.dimensionsXYZ.items"
          hint="height"
          :required="dimensionRequired" />
        &times;
        <app-property-input
          type="number"
          v-model="value.dimensionsDepth"
          :schema-property="properties.dimensionsXYZ.items"
          hint="depth"
          :required="dimensionRequired" /> mm
        <span class="error-message" hidden />
      </span>
    </section>

    <section class="physical-weight">
      <app-simple-label label="Weight">
        <app-property-input
          type="number"
          v-model="value.weight"
          :schema-property="properties.physical.weight" /> kg
      </app-simple-label>
    </section>

    <section class="physical-power">
      <app-simple-label label="Power">
        <app-property-input
          type="number"
          v-model="value.power"
          :schema-property="properties.physical.power" /> W
      </app-simple-label>
    </section>

    <section class="physical-DMXconnector">
      <app-simple-label label="DMX connector">
        <app-property-input
          type="select"
          v-model="value.DMXconnector"
          :schema-property="properties.physical.DMXconnector"
          addition-hint="other DMX connector" />
        <app-property-input
          type="text"
          v-if="value.DMXconnector === `[add-value]`"
          class="addition"
          v-model="value.DMXconnectorNew"
          :schema-property="properties.definitions.nonEmptyString"
          :required="true"
          :auto-focus="true"
          hint="other DMX connector" />
      </app-simple-label>
    </section>


    <h4>Bulb</h4>

    <section class="physical-bulb-type">
      <app-simple-label label="Bulb type">
        <app-property-input
          type="text"
          v-model="value.bulb.type"
          :schema-property="properties.physicalBulb.type"
          hint="e.g. LED" />
      </app-simple-label>
    </section>

    <section class="physical-bulb-colorTemperature">
      <app-simple-label label="Color temperature">
        <app-property-input
          type="number"
          v-model="value.bulb.colorTemperature"
          :schema-property="properties.physicalBulb.colorTemperature" /> K
      </app-simple-label>
    </section>

    <section class="physical-bulb-lumens">
      <app-simple-label label="Lumens">
        <app-property-input
          type="number"
          v-model="value.bulb.lumens"
          :schema-property="properties.physicalBulb.lumens" /> lm
      </app-simple-label>
    </section>


    <h4>Lens</h4>

    <section class="physical-lens-name">
      <app-simple-label label="Lens name">
        <app-property-input
          type="text"
          v-model="value.lens.name"
          :schema-property="properties.physicalLens.name" />
      </app-simple-label>
    </section>

    <section class="physical-lens-degrees validate-group">
      <app-simple-label label="Light cone">
        <app-range-input
          :start-value="value.lens.degreesMin"
          start-hint="min"
          @start-input="newStart => value.lens.degreesMin = newStart"
          :end-value="value.lens.degreesMax"
          end-hint="max"
          @end-input="newEnd => value.lens.degreesMax = newEnd"
          :schema-property="properties.physicalLens.degreesMinMax.items"
          unit="°" />
      </app-simple-label>
    </section>


    <h4>Focus</h4>

    <section class="physical-focus-type">
      <app-simple-label label="Focus type">
        <app-property-input
          type="select"
          v-model="value.focus.type"
          :schema-property="properties.physicalFocus.type"
          addition-hint="other focus type" />
        <app-property-input
          type="text"
          v-if="value.focus.type === `[add-value]`"
          class="addition"
          v-model="value.focus.typeNew"
          :schema-property="properties.definitions.nonEmptyString"
          :required="true"
          :auto-focus="true"
          hint="other focus type" />
      </app-simple-label>
    </section>

    <section class="physical-focus-panMax">
      <app-simple-label label="Pan maximum">
        <app-property-input
          type="number"
          v-model="value.focus.panMax"
          :schema-property="properties.physicalFocus.panMax" /> °
      </app-simple-label>
    </section>

    <section class="physical-focus-tiltMax">
      <app-simple-label label="Tilt maximum">
        <app-property-input
          type="number"
          v-model="value.focus.tiltMax"
          :schema-property="properties.physicalFocus.tiltMax" /> °
      </app-simple-label>
    </section>

  </div>
</template>


<script>
import schemaProperties from '~~/lib/schema-properties.js';

import simpleLabelVue from '~/components/simple-label.vue';
import propertyInputVue from '~/components/property-input.vue';
import rangeInputVue from '~/components/range-input.vue';

export default {
  components: {
    'app-simple-label': simpleLabelVue,
    'app-property-input': propertyInputVue,
    'app-range-input': rangeInputVue
  },
  props: {
    value: {
      type: Object,
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
      return this.value.dimensionsWidth !== `` || this.value.dimensionsHeight !== `` || this.value.dimensionsDepth !== ``;
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
