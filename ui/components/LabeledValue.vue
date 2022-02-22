<template functional>
  <section
    :ref="data.ref"
    :class="[data.class, data.staticClass, props.name]"
    :style="[data.style, data.staticStyle]"
    v-bind="data.attrs"
    v-on="listeners">
    <div class="label">
      <template v-if="props.label">{{ props.label }}</template>
      <slot name="label" />
    </div>
    <div class="value">
      <template v-if="props.value">{{ props.value }}</template>
      <slot />
    </div>
  </section>
</template>

<style lang="scss" scoped>
section {
  padding: 0.5ex 0;

  & > .label {
    color: theme-color(text-secondary);
  }
}

// move labels left of values
@media (min-width: $phone-landscape) {
  section {
    display: flex;
    flex-flow: row nowrap;
    align-items: flex-start;

    & > .label {
      flex: 0 0 10rem;
    }

    & > .value {
      // take up the remaining space
      flex-grow: 1;
      flex-shrink: 1;
      min-width: 0;
    }
  }
}
</style>

<script>
export default {
  props: {
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
    value: {
      type: String,
      required: false,
      default: null,
    },
  },
};
</script>
