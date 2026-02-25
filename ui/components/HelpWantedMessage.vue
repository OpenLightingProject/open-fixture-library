<template>
  <section class="help-wanted">
    <div class="information">
      <OflSvg name="comment-question-outline" title="Help wanted!" />
      <strong v-if="title">{{ title }} </strong>
      <span v-html="description" />
    </div>

    <div class="actions">
      <a
        href="#"
        class="only-js"
        @click.prevent="$emit(`help-wanted-clicked`, { type, context })">
        <OflSvg name="comment-alert" class="left" />
        <span>Send information</span>
      </a>
      <a
        href="https://github.com/OpenLightingProject/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Abug"
        class="no-js"
        rel="nofollow">
        <OflSvg name="bug" class="left" />
        <span>Create issue on GitHub</span>
      </a>
      <a :href="mailtoUrl" class="no-js">
        <OflSvg name="email" class="left" />
        <span>Send email</span>
      </a>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.help-wanted {
  position: relative;
  min-height: 32px;
  padding: 0;
  margin: 1ex 0;
  line-height: 1.6;
  background: theme-color(yellow-background);
  border-radius: 2px;
}

.information {
  $icon-width: 1.4em;
  $text-margin: 0.5em;

  padding: 0.6em 0.7em 0.6em (0.7em + $icon-width + $text-margin);
  border-bottom: 2px solid theme-color(yellow-background-hover);

  & > .icon {
    float: left;
    padding-right: $text-margin;
    margin-top: 0.2em;
    margin-left: -$icon-width - $text-margin;
  }
}

.actions {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
  font-size: 90%;

  a {
    box-sizing: border-box;
    display: inline-block;
    flex-grow: 1;
    flex-basis: 10em;
    width: 100%;
    padding: 0.4em 0.6em;
    color: theme-color(text-primary);
    text-align: center;

    &:hover,
    &:focus {
      outline: 0;
      background: theme-color(yellow-background-hover);
      fill: theme-color(text-primary);
    }

    & > .icon {
      margin-right: 1ex;
    }
  }
}
</style>

<script>
import { objectProp, oneOfProp } from 'vue-ts-types';

export default {
  props: {
    type: oneOfProp([`fixture`, `capability`, `plugin`]).required,
    context: objectProp().required,
  },
  emits: {
    'help-wanted-clicked': payload => true,
  },
  computed: {
    location() {
      if (this.type === `capability`) {
        const capability = this.context;
        const channel = capability._channel;
        return `Channel "${channel.name}" → Capability "${capability.name}" (${capability.rawDmxRange})`;
      }

      return null;
    },

    fixture() {
      if (this.type === `fixture`) {
        return this.context;
      }

      if (this.type === `capability`) {
        return this.context._channel.fixture;
      }

      return null;
    },

    title() {
      if (this.type === `fixture`) {
        return `You can help to improve this fixture definition!`;
      }

      if (this.type === `plugin`) {
        return `You can help to improve this plugin!`;
      }

      return null;
    },

    description() {
      if (this.type === `fixture`) {
        if (this.fixture.helpWanted === null) {
          return `Specific questions are included in the capabilities below.`;
        }

        if (this.fixture.isCapabilityHelpWanted) {
          return `${this.fixture.helpWanted} Further questions are included in the capabilities below.`;
        }
      }

      return this.context.helpWanted;
    },

    mailtoUrl() {
      const subject = this.fixture
        ? `Feedback for fixture '${this.fixture.manufacturer.key}/${this.fixture.key}'`
        : `Feedback for ${this.type} '${this.context.key}'`;

      const bodyLines = [];
      if (this.location) {
        bodyLines.push(`Problem location: ${this.location}`);
      }
      if (this.context.helpWanted) {
        bodyLines.push(`Problem description: ${this.context.helpWanted}`);
      }

      const body = bodyLines.join(`\n`);

      return `mailto:flo@open-fixture-library.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    },
  },
};
</script>
