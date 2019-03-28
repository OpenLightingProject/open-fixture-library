<template>
  <section class="help-wanted">
    <div class="information">
      <app-svg name="comment-question-outline" title="Help wanted!" />
      <strong v-if="title">{{ title }}</strong>
      <span v-html="description" />
    </div>

    <div class="actions">
      <a
        v-if="type !== `plugin`"
        href="#"
        class="only-js"
        @click.prevent="$emit(`helpWantedClicked`, context)">
        <app-svg name="comment-alert" class="left" />
        <span>Send information</span>
      </a>
      <a
        href="https://github.com/OpenLightingProject/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Atype-bug"
        :class="{ 'no-js': type !== `plugin` }"
        rel="nofollow">
        <app-svg name="bug" class="left" />
        <span>Create issue on GitHub</span>
      </a>
      <a :href="mailtoUrl" :class="{ 'no-js': type !== `plugin` }">
        <app-svg name="email" class="left" />
        <span>Send email</span>
      </a>
    </div>
  </section>
</template>

<style lang="scss" scoped>
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

export default {
  components: {
    'app-svg': svg
  },
  props: {
    type: {
      type: String,
      required: true,
      validate(type) {
        return [`fixture`, `capability`, `plugin`].includes(type);
      }
    },
    context: {
      type: Object,
      required: true
    }
  },
  computed: {
    location() {
      if (this.type === `capability`) {
        const cap = this.context;
        const channel = cap._channel;
        return `Channel "${channel.name}" → Capability "${cap.name}" (${cap.rawDmxRange})`;
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
      let subject;

      if (this.fixture) {
        subject = `Feedback for fixture '${this.fixture.manufacturer.key}/${this.fixture.key}'`;
      }
      else {
        subject = `Feedback for ${this.type} '${this.context.key}'`;
      }

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
