<template>
  <!-- Selectable variant: plain <a> so click can be prevented -->
  <a
    v-if="selectable"
    :href="`#${encodedCategory}`"
    :class="classes"
    @click.prevent="onClick"
    @focus="onFocus"
    @blur="onBlur"
  >
    <OflSvg type="fixture" :name="category" />
    {{ category }}
  </a>

  <!-- Default variant: NuxtLink to category page -->
  <NuxtLink
    v-else
    :to="`/categories/${encodedCategory}`"
    :class="classes"
  >
    <OflSvg type="fixture" :name="category" />
    {{ category }}
  </NuxtLink>
</template>

<style lang="scss" scoped>
.category-badge {
  display: inline-block;
  padding: 4px 1.5ex 4px 1ex;
  margin: 0 4px 4px 0;
  background: theme-color(hover-background);
  border-radius: 5000px; // see https://stackoverflow.com/a/18795153/451391

  &:link,
  &:visited {
    color: theme-color(text-primary);
    fill: theme-color(icon);
  }

  &:hover,
  &:focus {
    background-color: theme-color(active-background);
  }

  &.selected {
    cursor: grab;
    background-color: theme-color(blue-background-active);

    &:link,
    &:visited {
      color: $primary-text-light;
      fill: $icon-light;
    }

    &:hover,
    &:focus {
      background-color: $blue-300;
    }
  }

  & > .icon {
    width: 1.7em;
    height: 1.7em;
    margin-right: 4px;
  }
}
</style>

<script setup lang="ts">
import { computed } from 'vue';

// Props
const props = withDefaults(defineProps<{
  category: string;
  selected?: boolean;
  selectable?: boolean;
}>(), {
  selected: false,
  selectable: false,
});

// Emits
const emit = defineEmits<{
  (e: 'click'): void;
  (e: 'focus'): void;
  (e: 'blur', event: FocusEvent): void;
}>();

// Derived state
const encodedCategory = computed(() => encodeURIComponent(props.category));

const classes = computed(() => ({
  'category-badge': true,
  selected: props.selected,
}));

// Handlers
function onClick() {
  emit('click');
}

function onFocus() {
  emit('focus');
}

function onBlur(event: FocusEvent) {
  emit('blur', event);
}

// Expose for template
const category = computed(() => props.category);
const selectable = computed(() => props.selectable);
</script>
