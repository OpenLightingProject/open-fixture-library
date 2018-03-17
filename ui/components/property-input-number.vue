<template>
  <input
    ref="input"
    :required="required"
    :min="min"
    :max="max"
    :data-exclusive-minimum="schemaProperty.exclusiveMinimum"
    :data-exclusive-maximum="schemaProperty.exclusiveMaximum"
    :step="schemaProperty.type === `integer` ? 1 : `any`"
    :placeholder="hint"
    :value="value === `invalid` ? `` : value"
    type="number"
    @input="update">
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
    minimum: {
      type: [Number, String], // can be the string `invalid`
      required: false,
      default: null
    },
    maximum: {
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
    min() {
      if (this.minimum !== null && this.minimum !== `invalid`) {
        return this.minimum;
      }

      if (`minimum` in this.schemaProperty) {
        return this.schemaProperty.minimum;
      }

      if (`exclusiveMinimum` in this.schemaProperty) {
        return this.schemaProperty.exclusiveMinimum;
      }

      return null;
    },
    max() {
      if (this.maximum !== null && this.maximum !== `invalid`) {
        return this.maximum;
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
        this.$emit(`input`, `invalid`);
        return;
      }

      if (input.value === ``) {
        this.$emit(`input`, null);
        return;
      }

      let value;
      try {
        value = parseFloat(input.value);
      }
      catch (error) {
        value = `invalid`;
      }

      this.$emit(`input`, value);
    }
  }
};
</script>

