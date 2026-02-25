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
import { booleanProp, stringProp } from 'vue-ts-types';

export default {
  props: {
    category: stringProp().required,
    selected: booleanProp().withDefault(false),
    selectable: booleanProp().withDefault(false),
  },
  emits: {
    click: () => true,
    focus: () => true,
    blur: event => true,
  },
  render(createElement) {
    const classes = {
      'category-badge': true,
      selected: this.selected,
    };
    const children = [
      createElement(`OflSvg`, {
        props: {
          type: `fixture`,
          name: this.category,
        },
      }),
      this.category,
    ];

    if (this.selectable) {
      // <NuxtLink> is not cancellable, so we render a default <a> instead
      return createElement(`a`, {
        class: classes,
        attrs: {
          href: `#${encodeURIComponent(this.category)}`,
        },
        on: {
          click: $event => {
            this.$emit(`click`);
            $event.preventDefault();
          },
          focus: () => {
            this.$emit(`focus`);
          },
          blur: $event => {
            this.$emit(`blur`, $event);
          },
        },
      }, children);
    }

    return createElement(`NuxtLink`, {
      class: classes,
      props: {
        to: `/categories/${encodeURIComponent(this.category)}`,
      },
    }, children);
  },
};
</script>
