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
interface Props {
  type: 'fixture' | 'capability' | 'plugin';
  context: {
    _channel?: {
      name: string;
    };
    helpWanted?: string | null;
    manufacturer?: { key: string };
    key?: string;
    helpWanted: string | null;
    isCapabilityHelpWanted?: boolean;
  };
}

const props = defineProps<Props>();

defineEmits<{
  'help-wanted-clicked': [payload: { type: string; context: object }];
}>();

const location = computed(() => {
  if (props.type === 'capability') {
    const capability = props.context;
    const channel = (capability as { _channel: { name: string } })._channel;
    return `Channel "${channel.name}" → Capability "${capability.name}" (${(capability as { rawDmxRange: string }).rawDmxRange})`;
  }
  return null;
});

const fixture = computed(() => {
  if (props.type === 'fixture') return props.context;
  if (props.type === 'capability') return (props.context as { _channel: { fixture: object } })._channel.fixture;
  return null;
});

const title = computed(() => {
  if (props.type === 'fixture') return 'You can help to improve this fixture definition!';
  if (props.type === 'plugin') return 'You can help to improve this plugin!';
  return null;
});

const description = computed(() => {
  if (props.type === 'fixture') {
    const fix = fixture.value as { helpWanted: string | null; isCapabilityHelpWanted?: boolean };
    if (fix.helpWanted === null) return 'Specific questions are included in the capabilities below.';
    if (fix.isCapabilityHelpWanted) return `${fix.helpWanted} Further questions are included in the capabilities below.`;
  }
  return props.context.helpWanted;
});

const mailtoUrl = computed(() => {
  const subject = fixture.value
    ? `Feedback for fixture '${(fixture.value as { manufacturer: { key: string } }).manufacturer.key}/${(fixture.value as { key: string }).key}'`
    : `Feedback for ${props.type} '${props.context.key}'`;

  const bodyLines: string[] = [];
  if (location.value) bodyLines.push(`Problem location: ${location.value}`);
  if (props.context.helpWanted) bodyLines.push(`Problem description: ${props.context.helpWanted}`);

  return `mailto:flo@open-fixture-library.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
});
</script>
