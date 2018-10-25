<template>
  <section class="help-wanted">
    <div class="information">
      <app-svg name="comment-question-outline" title="Help wanted!" />
      <span class="text" v-html="text" />
    </div>

    <div class="actions">
      <a href="#" class="only-js" @click.prevent="$emit(`update:helpWantedContext`, context)"><app-svg name="comment-alert" class="left" /><span>Send information</span></a>
      <a href="https://github.com/OpenLightingProject/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Atype-bug" class="no-js" rel="nofollow"><app-svg name="bug" class="left" /><span>Create issue on GitHub</span></a>
      <a href="mailto:florian-edelmann@online.de" class="no-js"><app-svg name="email" class="left" /><span>Send mail</span></a>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@import '~assets/styles/vars.scss';

.help-wanted {
  position: relative;
  margin: 1ex 0;
  background: $yellow-300;
  border-radius: 2px;
  min-height: 32px;
  padding: 0;
}

.information {
  display: flex;
  flex-direction: row;
  padding: 0.4em 0.5em;
  border-bottom: 2px solid $yellow-600;

  & > .icon {
    margin: 0.3em 0.5em 0 0.2em;
  }
}

.actions {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  flex-wrap: wrap;
  font-size: 90%;

  a, noscript {
    flex-grow: 1;
    flex-basis: 10em;
  }

  a {
    display: inline-block;
    padding: 0.4em 0.6em;
    color: $primary-text-dark;
    text-align: center;
    width: 100%;
    box-sizing: border-box;

    &:hover,
    &:focus {
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
