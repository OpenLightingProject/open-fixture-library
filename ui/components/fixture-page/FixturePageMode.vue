<template>
  <section
    :id="mode.rdmPersonalityIndex === null ? null : `rdm-personality-${mode.rdmPersonalityIndex}`"
    class="fixture-mode card">

    <h2>{{ mode.name }} mode <code v-if="mode.hasShortName">{{ mode.shortName }}</code></h2>

    <span v-if="mode.rdmPersonalityIndex !== null" class="hint">RDM personality index: {{ mode.rdmPersonalityIndex }}</span>

    <template v-if="mode.physicalOverride !== null">
      <h3>Physical overrides</h3>
      <section class="physical physical-override">
        <FixturePagePhysical :physical="mode.physicalOverride" />
      </section>
    </template>

    <h3>DMX channels<template v-if="showCollapseExpandButtons">
      <button
        type="button"
        class="icon-button expand-all only-js"
        title="Expand all channels"
        @click.prevent="openDetails()">
        <OflSvg name="chevron-double-down" />
      </button>
      <button
        type="button"
        class="icon-button collapse-all only-js"
        title="Collapse all channels"
        @click.prevent="closeDetails()">
        <OflSvg name="chevron-double-up" />
      </button>
    </template></h3>

    <ol class="mode-channels">
      <FixturePageChannel
        v-for="channel of mode.channels"
        :key="channel.key"
        :channel="channel"
        :mode="mode"
        @help-wanted-clicked="$emit(`help-wanted-clicked`, $event)" />
    </ol>

  </section>
</template>

<style lang="scss" scoped>
.expand-all,
.collapse-all {
  margin-left: 1ex;
  font-size: 0.8rem;
}

ol.mode-channels {
  min-height: 1em;
  padding-left: 1.9em;

  :deep(ol) {
    padding-left: 1.1em;
    list-style-type: lower-alpha;
  }
}
</style>

<script setup lang="ts">
import Mode from '~~/lib/model/Mode.js';

interface Props {
  mode: Mode;
}

const props = defineProps<Props>();

defineEmits<{
  'help-wanted-clicked': [event: unknown];
}>();

const hasDetails = ref(true);

const showCollapseExpandButtons = computed(() => {
  return props.mode.channels.length > 1 && hasDetails.value;
});

onMounted(async () => {
  await nextTick();

  const el = document.querySelector('.fixture-mode');
  if (el && !el.querySelector(`details`)) {
    hasDetails.value = false;
  }
});

function openDetails() {
  const el = document.querySelector('.fixture-mode');
  if (!el) return;
  
  for (const details of el.querySelectorAll(`details`)) {
    details.open = true;
  }
}

function closeDetails() {
  const el = document.querySelector('.fixture-mode');
  if (!el) return;
  
  for (const details of el.querySelectorAll(`details`)) {
    details.open = false;
  }
}
</script>
