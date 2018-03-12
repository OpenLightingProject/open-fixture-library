<template>
  <select
    ref="input"
    :required="required"
    :class="{boolean: true, empty: value === null}"
    @input="update">
    <option :selected="value === null" value="">unknown</option>
    <option :selected="value === true" value="true">yes</option>
    <option :selected="value === false" value="false">no</option>
  </select>
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
    additionHint: {
      type: String,
      required: false,
      default: null
    },
    autoFocus: {
      type: Boolean,
      required: false,
      default: false
    },
    value: {
      type: Boolean,
      required: false,
      default: null
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
      if (this.$refs.input.value === `true`) {
        this.$emit(`input`, true);
        return;
      }

      if (this.$refs.input.value === `false`) {
        this.$emit(`input`, false);
        return;
      }

      this.$emit(`input`, null);
    }
  }
};
</script>

