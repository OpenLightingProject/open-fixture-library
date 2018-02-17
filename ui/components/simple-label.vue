<template>
  <label class="validate-group">
    <span class="label" v-html="label" />
    <span class="value">
      <slot />
      <span class="error-message" hidden />
      <span v-if="hint" class="hint">{{ hint }}</span>
    </span>
  </label>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: true
    },
    hint: {
      type: String,
      required: false,
      default: ``
    }
  }
};
</script>

