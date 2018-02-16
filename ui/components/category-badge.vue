<template>
  <nuxt-link
    :to="`/categories/${encodeURIComponent(category)}`"
    :class="{ 'category-badge': true, 'selected': selected }">
    <app-svg type="category" :name="category" />
    {{ category }}
  </nuxt-link>
</template>

<style lang="scss" scoped>
@import '~assets/styles/vars.scss';

.category-badge {
  display: inline-block;
  padding: 4px 1.5ex 4px 1ex;
  margin: 0 4px 4px 0;
  border-radius: 5000px; /* see http://stackoverflow.com/a/18795153/451391 */
  background: $grey-100;

  &:link,
  &:visited {
    color: $primary-text-dark;
    fill: $icon-dark;
  }
  &:hover,
  &:focus {
    background-color: $grey-300;
  }

  &.selected {
    background-color: $blue-700;
    cursor: move;

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
    height: 1.7em;
    width: 1.7em;
  }
}
</style>


<script>
import svg from '~/components/svg.vue';

export default {
  components: {
    'app-svg': svg
  },
  props: {
    category: {
      type: String,
      required: true
    },
    selected: {
      type: Boolean,
      required: false,
      default: false
    }
  }
};
</script>
