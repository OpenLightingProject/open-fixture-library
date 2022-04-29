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
    prop: `file`,
  },
  props: {
    required: booleanProp().withDefault(false),
    name: stringProp().required,
    file: anyProp().withDefault(null),
  },
  watch: {
    file(newFile) {
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
        this.$emit(`input`, null);
        return;
      }

      this.$emit(`input`, file);
    },
  },
};
</script>

