<template>
  <section :class="name">
    <div class="label">{{ label }}<slot name="label" /></div>
    <div class="value">{{ value }}<slot /></div>
  </section>
</template>

<style lang="scss" scoped>
@import '~assets/styles/vars.scss';
section {
  padding: .5ex 0;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: flex-start;

  & > .label {
    color: $secondary-text-dark;
  }
}

/* move labels left of values */
@media (min-width: $phone-landscape) {
  section {
    flex-direction: row;

    & > .label {
      flex-basis: 10rem;
      flex-grow: 0;
      flex-shrink: 0;
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
