<template>
  <span>
    <input
      ref="input"
      v-model="localValue"
      type="checkbox"
      :required="required"
      :name="name">
    {{ label }}
  </span>
</template>

<script>
export default {
  props: {
    required: {
      type: Boolean,
      required: false,
      default: false,
    },
    value: {
      type: Boolean,
      required: false,
      default: null,
    },
    name: {
      type: String,
      required: false,
      default: null,
    },
    label: {
      type: String,
      required: false,
      default: null,
    },
  },
  computed: {
    localValue: {
      get() {
        return this.value;
      },
      set(newValue) {
        this.$emit(`input`, newValue ? true : null);
      },
    },
  },
  methods: {
    // Called from parent component
    focus() { // eslint-disable-line vue/no-unused-properties
      this.$refs.input.focus();
    },
  },
};
</script>

