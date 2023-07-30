<template>
  <input
    ref="fileInput"
    :required="required"
    :name="name"
    type="file"
    @change="onFileChanged()">
</template>

<script>
import { anyProp, booleanProp, stringProp } from 'vue-ts-types';

export default {
  model: {
    prop: `model-value`,
    event: `update:model-value`,
  },
  props: {
    required: booleanProp().withDefault(false),
    name: stringProp().required,
    modelValue: anyProp().optional,
  },
  emits: {
    'update:model-value': value => true,
  },
  watch: {
    modelValue(newFile) {
      if (!newFile) {
        this.$refs.fileInput.value = ``;
      }
    },
  },
  mounted() {
    this.onFileChanged();
  },
  methods: {
    onFileChanged() {
      const file = this.$refs.fileInput.files[0];

      if (!file) {
        this.$emit(`update:model-value`, undefined);
        return;
      }

      this.$emit(`update:model-value`, file);
    },
  },
};
</script>

