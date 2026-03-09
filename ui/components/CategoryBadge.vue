<template>
  <a
    v-if="selectable"
    :class="classes"
    :href="`#${encodeURIComponent(category)}`"
    @click.prevent="$emit('click')"
    @focus="$emit('focus')"
    @blur="$emit('blur', $event)">
    <OflSvg type="fixture" :name="category" />
    {{ category }}
  </a>
  <NuxtLink
    v-else
    :class="classes"
    :to="`/categories/${encodeURIComponent(category)}`">
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

<script>
export default {
  props: {
    category: {
      type: String,
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
    selectable: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    click: () => true,
    focus: () => true,
    blur: (event) => true,
  },
  computed: {
    classes() {
      return {
        'category-badge': true,
        'selected': this.selected,
      };
    },
  },
};
</script>
