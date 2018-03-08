<template>
  <section
    :id="mode.rdmPersonalityIndex !== null ? `rdm-personality-${mode.rdmPersonalityIndex}` : null"
    class="fixture-mode card">

    <h2>{{ mode.name }} mode <code v-if="mode.hasShortName">{{ mode.shortName }}</code></h2>

    <span v-if="mode.rdmPersonalityIndex !== null" class="hint">RDM personality index: {{ mode.rdmPersonalityIndex }}</span>

    <template v-if="mode.physicalOverride !== null">
      <h3>Physical overrides</h3>
      <section class="physical physical-override">
        <app-fixture-physical :physical="mode.physicalOverride" />
      </section>
    </template>

    <h3>DMX channels<template v-if="mode.channels.length > 1">
      <button class="icon-button expand-all only-js" title="Expand all channels">
        <app-svg name="chevron-double-down" />
      </button>
      <button class="icon-button collapse-all only-js" title="Collapse all channels">
        <app-svg name="chevron-double-up" />
      </button>
    </template></h3>

    <ol class="mode-channels">
      <app-fixture-channel
        v-for="channel in mode.channels"
        :key="channel.key"
        :channel="channel"
        :mode="mode" />
    </ol>

  </section>
</template>

<style lang="scss" scoped>
.expand-all,
.collapse-all {
  margin-left: 1ex;
}
</style>

<script>
import svg from '~/components/svg.vue';
import fixturePhysical from '~/components/fixture-physical.vue';
import fixtureChannel from '~/components/fixture-channel.vue';

import Mode from '~~/lib/model/Mode.mjs';

export default {
  components: {
    'app-svg': svg,
    'app-fixture-physical': fixturePhysical,
    'app-fixture-channel': fixtureChannel
  },
  props: {
    mode: {
      type: Mode,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  }
};
</script>
