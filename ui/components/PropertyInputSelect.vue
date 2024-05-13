<template>
  <select
    v-model="localValue"
    :required="required"
    :class="{ empty: value === `` }">
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
    value: anyProp().required,
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
        this.$emit(`input`, newValue);
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

