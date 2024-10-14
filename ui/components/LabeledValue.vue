<!-- eslint-disable vuejs-accessibility/no-static-element-interactions -- use more accessible way of highlighting -->

<template>
  <section
    :class="name"
    @focusin="$emit('focusin', $event)"
    @focusout="$emit('focusout', $event)"
    @mouseover="$emit('mouseover', $event)"
    @mouseout="$emit('mouseout', $event)">
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
import { stringProp } from 'vue-ts-types';

export default {
  props: {
    name: stringProp().optional,
    label: stringProp().optional,
    value: stringProp().optional,
  },
  emits: {
    focusin: event => true,
    focusout: event => true,
    mouseover: event => true,
    mouseout: event => true,
  },
};
</script>
