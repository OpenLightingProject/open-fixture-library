<template>
  <section :class="name">
    <div class="label">
      <template v-if="label">{{ label }}</template>
      <slot name="label" />
    </div>
    <div class="value">
      <template v-if="value">{{ value }}</template>
      <slot />
    </div>
  </section>
</template>

<style lang="scss" scoped>
section {
  padding: .5ex 0;

  & > .label {
    color: $secondary-text-dark;
  }
}

/* move labels left of values */
@media (min-width: $phone-landscape) {
  section {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: flex-start;

    & > .label {
      flex-basis: 10rem;
      flex-grow: 0;
      flex-shrink: 0;
    }

    & > .value {
      // take up the remaining space
      min-width: 0;
      flex-grow: 1;
      flex-shrink: 1;
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
      default: null
    },
    label: {
      type: String,
      required: false,
      default: null
    },
    value: {
      type: String,
      required: false,
      default: null
    }
  }
};
</script>
