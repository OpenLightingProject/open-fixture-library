<template>
  <select
    ref="input"
    :required="required"
    :class="{empty: value === ``}"
    @input="update">
    <option :selected="value === ``" value="">unknown</option>
    <option
      v-for="item in schemaProperty.enum"
      :key="item"
      :value="item"
      :selected="value === item">{{ item }}</option>
    <option
      v-if="additionHint !== null"
      :selected="value === `[add-value]`"
      value="[add-value]">{{ additionHint }}</option>
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
      this.$emit(`input`, this.$refs.input.value);
    }
  }
};
</script>

