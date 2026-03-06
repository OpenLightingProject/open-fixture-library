<template>
  <select
    v-model="localValue"
    :required="required"
    :class="{ empty: modelValue === `` }">
    <option :disabled="required" value="">unknown</option>
    <option
      v-for="item of schemaProperty.enum"
      :key="item"
      :value="item">{{ item }}</option>
    <option
      v-if="additionHint"
      value="[add-value]">{{ additionHint }}</option>
  </select>
</template>

<script>
import { anyProp, booleanProp, objectProp, stringProp } from 'vue-ts-types';

export default {
  props: {
    schemaProperty: objectProp().required,
    required: booleanProp().withDefault(false),
    additionHint: stringProp().optional,
    modelValue: anyProp().required,
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
        this.$emit('update:modelValue', newValue);
      },
    },
  },
  methods: {
    /** @public */
    focus() {
      this.$el.focus();
    },
  },
};
</script>
