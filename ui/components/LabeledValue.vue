<style lang="scss" scoped>
section {
  padding: .5ex 0;

  & > .label {
    color: theme-color(text-secondary);
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
  functional: true,
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
  },
  render(createElement, context) {
    const data = context.data;
    data.class = [data.class, context.props.name];

    const slots = context.slots();

    return createElement(`section`, data, [
      createElement(
        `div`,
        { class: `label` },
        getChildren(context.props.label, slots.label)
      ),
      createElement(
        `div`,
        { class: `value` },
        getChildren(context.props.value, slots.default)
      )
    ]);
  }
};

/**
 * @param {String} string The string prop to use if it's specified.
 * @param {Object} slot The slot VNode to use if it's specified.
 * @returns {Array.<Object>} An array of VNodes.
 */
function getChildren(string, slot) {
  const children = [];

  if (string) {
    children.push(string);
  }

  if (slot) {
    children.push(slot);
  }

  return children;
}
</script>
