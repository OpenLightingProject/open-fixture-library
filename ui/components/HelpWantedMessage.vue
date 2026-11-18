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
        @click.prevent="$emit('help-wanted-clicked', { type, context })">
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

<script setup lang="ts">
import type { HelpWantedModel } from '~/types/help-wanted';

interface Properties {
  type: 'fixture' | 'capability' | 'plugin';
  context: object;
}

const properties = defineProps<Properties>();

const context = computed(() => properties.context as HelpWantedModel);

defineEmits<{
  'help-wanted-clicked': [payload: { type: string; context: object }];
}>();

const location = computed(() => {
  if (properties.type !== 'capability') {
    return null;
  }

  const capability = properties.context as { _channel: { name: string }; name: string; rawDmxRange: string };
  return `Channel "${capability._channel.name}" → Capability "${capability.name}" (${capability.rawDmxRange})`;
});

const fixture = computed(() => {
  if (properties.type === 'fixture') {
    return properties.context;
  }
  return properties.type === 'capability' ? (properties.context as { _channel: { fixture: object } })._channel.fixture : null;
});

const title = computed(() => {
  if (properties.type === 'fixture') {
    return 'You can help to improve this fixture definition!';
  }
  return properties.type === 'plugin' ? 'You can help to improve this plugin!' : null;
});

const description = computed(() => {
  if (properties.type === 'fixture') {
    const fixture_ = fixture.value as { helpWanted: string | null; isCapabilityHelpWanted?: boolean };
    if (fixture_.helpWanted === null) {
      return 'Specific questions are included in the capabilities below.';
    }
    if (fixture_.isCapabilityHelpWanted) {
      return `${fixture_.helpWanted} Further questions are included in the capabilities below.`;
    }
  }
  return context.value.helpWanted;
});

const mailtoUrl = computed(() => {
  const subject = fixture.value
    ? `Feedback for fixture '${(fixture.value as { manufacturer: { key: string } }).manufacturer.key}/${(fixture.value as { key: string }).key}'`
    : `Feedback for ${properties.type} '${context.value.key ?? ''}'`;

  const bodyLines: string[] = [];
  if (location.value) {
    bodyLines.push(`Problem location: ${location.value}`);
  }
  if (context.value.helpWanted) {
    bodyLines.push(`Problem description: ${context.value.helpWanted}`);
  }

  return `mailto:flo@open-fixture-library.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
});
</script>
