<template>
  <span>
    <app-property-input-number
      type="number"
      v-model="start"
      :schema-property="schemaProperty"
      :max="end"
      :required="required || rangeIncomplete"
      hint="min" />
    …
    <app-property-input-number
      type="number"
      v-model="end"
      :schema-property="schemaProperty"
      :min="start"
      :required="required || rangeIncomplete"
      hint="max" />
    {{ unit }}
  </span>
</template>

<script>
import propertyInputNumberVue from '~/components/property-input-number.vue';

export default {
  components: {
    'app-property-input-number': propertyInputNumberVue
  },
  props: {
    startValue: {
      type: [Number, String], // can be the string `invalid`
      required: false,
      default: null
    },
    startHint: {
      type: String,
      required: false,
      default: null
    },
    endValue: {
      type: [Number, String], // can be the string `invalid`
      required: false,
      default: null
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
      return this.startValue !== null || this.endValue !== null;
    }
  }
};
</script>

