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
import { booleanProp, stringProp } from 'vue-ts-types';

export default {
  props: {
    required: booleanProp().withDefault(false),
    value: booleanProp().withDefault(false),
    name: stringProp().required,
    label: stringProp().required,
  },
  emits: {
    input: value => true,
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
    /** @public */
    focus() {
      this.$refs.input.focus();
    },
  },
};
</script>
