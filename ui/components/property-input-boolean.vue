<template>
  <select :required="required" @input="update" ref="input">
    <option value="" :selected="value === ``">unknown</option>
    <option value="true" :selected="value === true">yes</option>
    <option value="false" :selected="value === false">no</option>
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
      type: null,
      required: true
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
      }

      if (this.$refs.input.value === `false`) {
        this.$emit(`input`, false);
      }

      this.$emit(`input`, null);
    }
  }
};
</script>

