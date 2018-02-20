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
    :value="value"
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
      type: Number,
      required: false,
      default: null
    },
    max: {
      type: Number,
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
      if (this.min !== null) {
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
      if (this.max !== null) {
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
      if (this.$refs.input.value === ``) {
        return this.$emit(`input`, null);
      }

      return this.$emit(`input`, parseFloat(this.$refs.input.value));
    }
  }
};
</script>

