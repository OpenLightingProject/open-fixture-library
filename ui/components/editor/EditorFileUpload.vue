<template>
  <input
    ref="fileInput"
    :required="required"
    :name="name"
    type="file"
    @change="onFileChanged()">
</template>

<script>
export default {
  model: {
    prop: `file`,
  },
  props: {
    required: {
      type: Boolean,
      required: false,
      default: false,
    },
    name: {
      type: String,
      required: true,
    },
    file: {
      type: null,
      required: false,
      default: null,
    },
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

