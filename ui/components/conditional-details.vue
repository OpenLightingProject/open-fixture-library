<!-- Usage:

1. with content
  <app-conditional-details>
    <template slot="summary">Hello</template>

    World
  </app-conditional-details>

  renders:
  <details><summary>Hello</summary>World</details>

2. without content
  <app-conditional-details>
    <template slot="summary">Hello</template>
  </app-conditional-details>

  renders:
  <div>Hello</div>

-->


<style lang="scss" scoped>
@import '~assets/styles/vars.scss';
summary {
  display: block;
  cursor: pointer;

  &::-webkit-details-marker {
    display: none;
  }

  &::after {
    /* chevron down */
    border-color: $icon-dark;
    border-style: solid;
    border-width: 0.17em 0.17em 0 0;
    content: '';
    display: inline-block;
    height: 0.4em;
    left: 1.2ex;
    position: relative;
    top: -0.2em;
    transform: rotate(135deg);
    transition-duration: 0.2s;
    transition-property: transform, top, border-color;
    vertical-align: middle;
    width: 0.4em;
  }

  &:hover::after {
    border-color: $icon-dark-hover;
  }
}
details[open] {
  padding-bottom: 2ex;

  & > summary::after {
    /* chevron up */
    top: 0;
    transform: rotate(315deg);
  }
}
</style>

<script>
export default {
  render(createElement) {
    console.log(this.$slots.default);

    if (this.$slots.default) {
      return createElement(`details`, [
        createElement(`summary`, this.$slots.summary),
        this.$slots.default
      ]);
    }

    return createElement(`div`, this.$slots.summary);
  }
};
</script>
