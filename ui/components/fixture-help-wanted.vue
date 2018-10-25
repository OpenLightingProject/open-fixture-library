<template>
  <section class="help-wanted">
    <app-svg name="comment-question-outline" title="Help wanted!" />
    <span class="text" v-html="text" />

    <div class="actions">
      <a href="#" class="only-js" @click.prevent="$emit(`update:helpWantedContext`, context)"><app-svg name="comment-alert" class="left" /><span>Send information</span></a>
      <noscript inline-template>
        <a href="https://github.com/OpenLightingProject/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Atype-bug" rel="nofollow"><app-svg name="bug" class="left" /><span>Create issue on GitHub</span></a>
      </noscript>
      <noscript inline-template>
        <a href="mailto:florian-edelmann@online.de"><app-svg name="email" class="left" /><span>Send mail</span></a>
      </noscript>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@import '~assets/styles/vars.scss';

.help-wanted {
  position: relative;
  margin: 1ex 0;
  padding: 0.4em 0.5em 0.4em calc(1.4em + 2*0.5em);
  background: $yellow-300;
  border-radius: 2px;
  min-height: 32px;

  & > .icon {
    margin-left: calc(-1.4em - 0.5em);
    margin-right: 0.5em;
  }
}

.text {
  margin-right: .6em;
}

.actions {
  display: inline-block;

  a {
    display: inline-block;
    border: 2px solid $yellow-600;
    margin: .2em;
    padding: .1em .4em;
    border-radius: 3px;
    color: $primary-text-dark;

    &:hover {
      background: $yellow-600;
      fill: $primary-text-dark;
    }

    & > .icon {
      margin-right: 1ex;
    }
  }
}
</style>


<script>
import svg from '~/components/svg.vue';

import Fixture from '~~/lib/model/Fixture.mjs';
import Capability from '~~/lib/model/Capability.mjs';

export default {
  components: {
    'app-svg': svg
  },
  props: {
    context: {
      type: [Fixture, Capability],
      required: true
    }
  },
  computed: {
    text() {
      if (this.context instanceof Capability) {
        return this.context.helpWanted;
      }

      let text = `<strong>You can help to improve this fixture definition!</strong> `;
      text += this.context.helpWanted !== null ? this.context.helpWanted : `Specific questions are included in the capabilities below.`;
      return text;
    }
  }
};
</script>
