<style lang="scss" scoped>
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
    margin-right: 4px;
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
    },
    selectable: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  render(createElement) {
    const classes = {
      'category-badge': true,
      selected: this.selected
    };
    const children = [
      createElement(`app-svg`, {
        props: {
          type: `category`,
          name: this.category
        }
      }),
      this.category
    ];

    if (this.selectable) {
      // <nuxt-link> is not cancellable, so we render a default <a> instead
      return createElement(`a`, {
        class: classes,
        attrs: {
          href: `#${encodeURIComponent(this.category)}`
        },
        on: {
          click: $event => {
            this.$emit(`click`);
            $event.preventDefault();
          }
        }
      }, children);
    }

    return createElement(`nuxt-link`, {
      class: classes,
      props: {
        to: `/categories/${encodeURIComponent(this.category)}`
      }
    }, children);
  }
};
</script>
