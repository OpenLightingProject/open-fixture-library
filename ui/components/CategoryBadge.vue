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
interface Props {
  category: string;
  selected?: boolean;
  selectable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  selectable: false,
});

const emit = defineEmits<{
  click: [];
  focus: [];
  blur: [event: FocusEvent];
}>();

const handleClick = (event: MouseEvent) => {
  if (props.selectable) {
    emit('click');
  }
};

const handleFocus = () => {
  emit('focus');
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};
</script>

<template>
  <NuxtLink
    :class="{ 'category-badge': true, selected: props.selected }"
    :to="selectable ? undefined : `/categories/${encodeURIComponent(props.category)}`"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur">
    <OflSvg
      type="fixture"
      :name="props.category" />
    {{ props.category }}
  </NuxtLink>
</template>
