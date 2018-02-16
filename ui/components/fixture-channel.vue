<template>
  <li>
    <details class="channel">
      <summary>
        <app-fixture-channel-type-icon :channel="channel" />{{ unwrappedChannel.name }}<code v-if="channelKey" class="channel-key">{{ channelKey }}</code>{{ appendToHeading ? ` ${appendToHeading}` : `` }}
      </summary>

      <div v-if="unwrappedChannel instanceof FineChannel">
        Fine channel of {{ unwrappedChannel.coarseChannel.name }} (channel&nbsp;{{ mode.getChannelIndex(unwrappedChannel.coarseChannel.key) + 1 }})
      </div>

      <template v-else-if="unwrappedChannel instanceof SwitchingChannel">
        <div>Switch depending on {{ unwrappedChannel.triggerChannel.name }}'s value (channel&nbsp;{{ mode.getChannelIndex(unwrappedChannel.triggerChannel.key) + 1 }}):</div>

        <ol>
          <app-fixture-channel
            v-for="(_, switchToChannelKey) in unwrappedChannel.triggerRanges"
            :key="switchToChannelKey"
            :channel="fixture.getChannelByKey(switchToChannelKey)"
            :mode="mode"
            :append-to-heading="unwrappedChannel.defaultChannel.key === switchToChannelKey ? `(default)` : null" />
        </ol>
      </template>

      <template v-if="channel instanceof MatrixChannel && !(unwrappedChannel instanceof SwitchingChannel)">
        <section v-if="fixture.matrix.pixelGroupKeys.includes(channel.pixelKey)" class="channel-pixel-group">
          <span class="label">Pixel group</span>
          <span class="value">{{ channel.pixelKey }}</span>
        </section>

        <template v-else>
          <section class="channel-pixel-key">
            <span class="label">Pixel</span>
            <span class="value">{{ channel.pixelKey }}</span>
          </section>
          <section class="channel-pixel-position">
            <span class="label">Pixel position</span>
            <span class="value">
              ({{ fixture.matrix.pixelKeyPositions[channel.pixelKey][0] }},
              {{ fixture.matrix.pixelKeyPositions[channel.pixelKey][1] }},
              {{ fixture.matrix.pixelKeyPositions[channel.pixelKey][2] }})
              <span class="hint">(X, Y, Z)</span>
            </span>
          </section>
        </template>
      </template>

      <template v-if="unwrappedChannel instanceof Channel">
        <section v-if="finenessInMode > 0" class="channel-fineChannelAliases">
          <span class="label">Fine channels</span>
          <span class="value">{{
            unwrappedChannel.fineChannels.slice(0, finenessInMode).map(
              fineChannel => `${fineChannel.name} (channel&nbsp;${mode.getChannelIndex(fineChannel) + 1})`
            ).join(`, `)
          }}</span>
        </section>

        <section v-if="unwrappedChannel.hasDefaultValue" class="channel-defaultValue">
          <span class="label">Default DMX value</span>
          <span class="value">{{ unwrappedChannel.getDefaultValueWithFineness(finenessInMode) }}</span>
        </section>

        <section v-if="unwrappedChannel.hasHighlightValue" class="channel-defaultValue">
          <span class="label">Highlight DMX value</span>
          <span class="value">{{ unwrappedChannel.getHighlightValueWithFineness(finenessInMode) }}</span>
        </section>

        <section v-if="unwrappedChannel.invert" class="channel-invert">
          <span class="label">Invert</span>
          <span class="value">Yes</span>
        </section>

        <section v-if="unwrappedChannel.constant" class="channel-constant">
          <span class="label">Constant</span>
          <span class="value">Yes</span>
        </section>

        <section v-if="unwrappedChannel.crossfade" class="channel-crossfade">
          <span class="label">Crossfade</span>
          <span class="value">Yes</span>
        </section>

        <section v-if="unwrappedChannel.precedence !== `LTP`" class="channel-precedence">
          <span class="label">Precedence</span>
          <span class="value">{{ unwrappedChannel.precedence }}</span>
        </section>

        <app-fixture-capability-table
          v-if="unwrappedChannel.hasCapabilities"
          :channel="unwrappedChannel"
          :mode="mode"
          :fineness-in-mode="finenessInMode" />
      </template>

    </details>
  </li>
</template>

<style lang="scss" scoped>
@import '~assets/styles/vars.scss';

summary > .icon,
div.channel > .icon {
  margin-right: 1.2ex;
}

ol.mode-channels {
  padding-left: 1.9em;
  min-height: 1em;

  /* switched channels */
  & ol {
    list-style-type: lower-alpha;
    padding-left: 1.1em;
  }
}

.channel > summary {
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
.channel[open] {
  padding-bottom: 2ex;

  & > summary::after {
    /* chevron up */
    top: 0;
    transform: rotate(315deg);
  }
}
</style>


<script>
import svg from '~/components/svg.vue';
import fixtureChannelTypeIcon from '~/components/fixture-channel-type-icon.vue';
import fixtureCapabilityTable from '~/components/fixture-capability-table.vue';

import AbstractChannel from '~~/lib/model/AbstractChannel.mjs';
import Channel from '~~/lib/model/Channel.mjs';
import FineChannel from '~~/lib/model/FineChannel.mjs';
import MatrixChannel from '~~/lib/model/MatrixChannel.mjs';
import Mode from '~~/lib/model/Mode.mjs';
import NullChannel from '~~/lib/model/NullChannel.mjs';
import SwitchingChannel from '~~/lib/model/SwitchingChannel.mjs';

export default {
  name: `AppFixtureChannel`,
  components: {
    'app-svg': svg,
    'app-fixture-channel-type-icon': fixtureChannelTypeIcon,
    'app-fixture-capability-table': fixtureCapabilityTable
  },
  props: {
    channel: {
      type: [AbstractChannel, MatrixChannel],
      required: true
    },
    mode: {
      type: Mode,
      required: true
    },
    appendToHeading: {
      type: String,
      required: false,
      default: ``
    }
  },
  data() {
    return {
      Channel,
      FineChannel,
      MatrixChannel,
      SwitchingChannel,
      fixture: this.mode.fixture
    };
  },
  computed: {
    unwrappedChannel() {
      if (this.channel instanceof MatrixChannel) {
        return this.channel.wrappedChannel;
      }

      return this.channel;
    },
    channelKey() {
      if (this.unwrappedChannel instanceof NullChannel) {
        return `null`;
      }

      if (this.unwrappedChannel.key !== this.unwrappedChannel.name) {
        return this.unwrappedChannel.key;
      }

      return ``;
    },
    finenessInMode() {
      return this.unwrappedChannel.getFinenessInMode(this.mode);
    }
  }
};
</script>
