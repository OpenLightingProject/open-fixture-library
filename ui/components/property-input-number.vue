<!--

usage: <app-property-input-number add type="number" ... />
to enable validation

-->

<template>
  <input
    type="number"
    :required="required"
    :min="minimum"
    :max="maximum"
    :data-exclusive-minimum="schemaProperty.exclusiveMinimum"
    :data-exclusive-maximum="schemaProperty.exclusiveMaximum"
    :step="schemaProperty.type === `integer` ? 1 : `any`"
    :placeholder="hint"
    :value="value === `invalid` ? `` : value"
    @input="update"
    ref="input">
</template>

<script>
export default {
  props: {
    schemaProperty: {
      type: Object,
      required: true
    },
    required: {
      type: Boolean,
      required: false,
      default: false
    },
    hint: {
      type: String,
      required: false,
      default: null
    },
    autoFocus: {
      type: Boolean,
      required: false,
      default: false
    },
    min: {
      type: [Number, String], // can be the string `invalid`
      required: false,
      default: null
    },
    max: {
      type: [Number, String], // can be the string `invalid`
      required: false,
      default: null
    },
    value: {
      type: null,
      required: true
    }
  },
  computed: {
    minimum() {
      if (this.min !== null && this.min !== `invalid`) {
        return this.min;
      }

      if (`minimum` in this.schemaProperty) {
        return this.schemaProperty.minimum;
      }

      if (`exclusiveMinimum` in this.schemaProperty) {
        return this.schemaProperty.exclusiveMinimum;
      }

      return null;
    },
    maximum() {
      if (this.max !== null && this.max !== `invalid`) {
        return this.max;
      }

      if (`maximum` in this.schemaProperty) {
        return this.schemaProperty.maximum;
      }

      if (`exclusiveMaximum` in this.schemaProperty) {
        return this.schemaProperty.exclusiveMaximum;
      }

      return null;
    }
  },
  mounted() {
    if (this.autoFocus) {
      this.focus();
    }
  },
  methods: {
    focus() {
      this.$refs.input.focus();
    },
    update() {
      const input = this.$refs.input;
      if (input.validity && input.validity.badInput) {
        return this.$emit(`input`, `invalid`);
      }

      if (input.value === ``) {
        return this.$emit(`input`, null);
      }

      return this.$emit(`input`, parseFloat(input.value));
    }
  }
};
</script>

