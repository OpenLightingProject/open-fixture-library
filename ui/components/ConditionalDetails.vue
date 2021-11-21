<!-- Usage:

1. with content
  <ConditionalDetails>
    <template slot="summary">Hello</template>

    World
  </ConditionalDetails>

  renders:
  <details><summary>Hello</summary>World</details>

2. without content
  <ConditionalDetails>
    <template slot="summary">Hello</template>
  </ConditionalDetails>

  renders:
  <div class="summary">Hello</div>

-->

<style lang="scss" scoped>
summary {
  display: block;
  cursor: pointer;
  transition: background-color 0.2s;

  &::-webkit-details-marker {
    display: none;
  }

  &::after {
    // chevron down
    position: relative;
    top: -0.2em;
    left: 1.2ex;
    display: inline-block;
    width: 0.4em;
    height: 0.4em;
    vertical-align: middle;
    content: "";
    border-color: theme-color(icon);
    border-style: solid;
    border-width: 0.17em 0.17em 0 0;
    transition-duration: 0.2s;
    transition-property: transform, top, border-color;
    transform: rotate(135deg);
  }

  &:hover,
  &:focus {
    background-color: theme-color(hover-background);
    outline: none;

    &::after {
      border-color: theme-color(icon-hover);
    }
  }
}

details {
  display: block; // needed for Edge

  &[open] {
    padding-bottom: 2ex;

    & > summary::after {
      // chevron up
      top: 0;
      transform: rotate(315deg);
    }
  }
}

// hide polyfilled arrow, as we use our own
html.no-details details > summary::before {
  display: none;
}
</style>

<script>
export default {
  render(createElement) {
    if (this.$slots.default) {
      return createElement(`details`, [
        createElement(`summary`, this.$slots.summary),
        this.$slots.default,
      ]);
    }

    return createElement(`div`, {
      class: `summary`,
    }, this.$slots.summary);
  },
};
</script>
