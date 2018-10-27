<template>
  <section class="help-wanted">
    <div class="information">
      <app-svg name="comment-question-outline" title="Help wanted!" />
      <strong v-if="(context instanceof Fixture)">You can help to improve this fixture definition!</strong>
      {{ context.helpWanted !== null ? context.helpWanted : `Specific questions are included in the capabilities below.` }}
    </div>

    <div class="actions">
      <a href="#" class="only-js" @click.prevent="$emit(`helpWantedClicked`, context)"><app-svg name="comment-alert" class="left" /><span>Send information</span></a>
      <a href="https://github.com/OpenLightingProject/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Atype-bug" class="no-js" rel="nofollow"><app-svg name="bug" class="left" /><span>Create issue on GitHub</span></a>
      <a :href="mailtoUrl" class="no-js"><app-svg name="email" class="left" /><span>Send email</span></a>
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
  line-height: 1.6;
}

.information {
  $icon-width: 1.4em;
  $text-margin: 0.5em;
  padding: 0.6em 0.7em 0.6em (0.7em + $icon-width + $text-margin);
  border-bottom: 2px solid $yellow-600;

  & > .icon {
    margin-left: -$icon-width - $text-margin;
    padding-right: $text-margin;
    margin-top: 0.2em;
    float: left;
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
  data: () => {
    return {
      Fixture
    };
  },
  computed: {
    location() {
      if (this.context instanceof Capability) {
        const cap = this.context;
        const channel = cap._channel;
        return `Channel "${channel.name}" → Capability "${cap.name}" (${cap.rawDmxRange})`;
      }

      return null;
    },
    fixture() {
      if (this.context instanceof Fixture) {
        return this.context;
      }
      if (this.context instanceof Capability) {
        return this.context._channel.fixture;
      }

      return null;
    },
    mailtoUrl() {
      const subject = `Feedback for fixture '${this.fixture.manufacturer.key}/${this.fixture.key}'`;

      const bodyLines = [];
      if (this.location) {
        bodyLines.push(`Problem location: ${this.location}`);
      }
      if (this.context.helpWanted) {
        bodyLines.push(`Problem description: ${this.context.helpWanted}`);
      }

      const body = bodyLines.join(`\n`);

      return `mailto:florian-edelmann@online.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  }
};
</script>
