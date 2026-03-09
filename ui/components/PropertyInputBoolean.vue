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
    modelValue: booleanProp().withDefault(false),
    name: stringProp().required,
    label: stringProp().required,
  },
  emits: {
    'update:modelValue': (value) => true,
  },
  computed: {
    localValue: {
      get() {
        return this.modelValue;
      },
      set(newValue) {
        this.$emit('update:modelValue', newValue ? true : null);
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
