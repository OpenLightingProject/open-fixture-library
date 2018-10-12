<template>
  <input
    ref="fileInput"
    :required="required"
    :name="name"
    type="file"
    @change="onFileChanged">
</template>

<script>
export default {
  model: {
    prop: `value`
  },
  props: {
    required: {
      type: Boolean,
      required: false,
      default: false
    },
    name: {
      type: String,
      required: true
    },
    value: {
      type: null,
      required: false,
      default: null
    }
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
    }
  }
};
</script>

