<template>
  <span>
    <app-property-input
      type="number"
      v-model="start"
      :schema-property="schemaProperty"
      :max="end !== `` ? parseInt(end) : null"
      :required="required || rangeIncomplete"
      hint="min" />
    …
    <app-property-input
      type="number"
      v-model="end"
      :schema-property="schemaProperty"
      :min="start !== `` ? parseInt(start) : null"
      :required="required || rangeIncomplete"
      hint="max" />
    {{ unit }}
  </span>
</template>

<script>
import propertyInputVue from '~/components/property-input.vue';

export default {
  components: {
    'app-property-input': propertyInputVue
  },
  props: {
    startValue: {
      type: [Number, String],
      required: true
    },
    startHint: {
      type: String,
      required: false,
      default: null
    },
    endValue: {
      type: [Number, String],
      required: true
    },
    endHint: {
      type: String,
      required: false,
      default: null
    },
    schemaProperty: {
      type: Object,
      required: true
    },
    unit: {
      type: String,
      required: false,
      default: null
    },
    required: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    start: {
      get() {
        return this.startValue;
      },
      set(startInput) {
        this.$emit(`start-input`, startInput);
      }
    },
    end: {
      get() {
        return this.endValue;
      },
      set(endInput) {
        this.$emit(`end-input`, endInput);
      }
    },
    rangeIncomplete() {
      return this.startValue !== `` || this.endValue !== ``;
    }
  }
};
</script>

