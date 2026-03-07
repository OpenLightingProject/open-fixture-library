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

<script setup lang="ts">
interface Props {
  name?: string;
  label?: string;
  value?: string;
}

defineProps<Props>();

defineEmits<{
  focusin: [event: FocusEvent];
  focusout: [event: FocusEvent];
  mouseover: [event: MouseEvent];
  mouseout: [event: MouseEvent];
}>();
</script>
