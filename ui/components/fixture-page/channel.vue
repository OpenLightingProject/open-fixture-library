<template>
  <li>
    <conditional-details class="channel">
      <template slot="summary">
        <fixture-channel-type-icon :channel="channel" />{{ channel.name }}<code v-if="channelKey" class="channel-key">{{ channelKey }}</code>{{ appendToHeading ? ` ${appendToHeading}` : `` }}
        <ofl-svg
          v-if="channel.isHelpWanted"
          class="help-wanted-icon"
          name="comment-question-outline"
          title="Help wanted!" />
      </template>

      <slot />

      <div v-if="(channel instanceof FineChannel)">
        Fine channel of {{ channel.coarseChannel.name }} (channel&nbsp;{{ mode.getChannelIndex(channel.coarseChannel.key) + 1 }})
      </div>

      <template v-else-if="(channel instanceof SwitchingChannel)">
        <span>Switches depending on trigger channel's value.</span>

        <labeled-value
          name="switchingChannel-triggerChannel"
          label="Trigger channel">
          {{ channel.triggerChannel.name }} (channel&nbsp;{{ mode.getChannelIndex(channel.triggerChannel.key) + 1 }})
        </labeled-value>

        <ol>
          <fixture-channel
            v-for="(ranges, switchToChannelKey) in channel.triggerRanges"
            :key="switchToChannelKey"
            :channel="fixture.getChannelByKey(switchToChannelKey)"
            :mode="mode"
            :append-to-heading="channel.defaultChannel.key === switchToChannelKey ? `(default)` : null"
            @help-wanted-clicked="$emit(`help-wanted-clicked`, $event)">
            <labeled-value
              name="switchingChannel-triggerRanges"
              label="Activated when">
              <span v-html="`Trigger channel is set to ${ranges.map(range => `<span style='white-space: nowrap;'>${range}</span>`).join(` or `)}`" />
            </labeled-value>
          </fixture-channel>
        </ol>
      </template>

      <template v-if="channel.pixelKey !== null && !(channel instanceof SwitchingChannel)">
        <labeled-value
          v-if="fixture.matrix.pixelGroupKeys.includes(channel.pixelKey)"
          :value="`${channel.pixelKey}`"
          name="channel-pixel-group"
          label="Pixel group" />

        <template v-else>
          <labeled-value
            :value="`${channel.pixelKey}`"
            name="channel-pixel-key"
            label="Pixel" />
          <labeled-value
            name="channel-pixel-position"
            label="Pixel position">
            ({{ fixture.matrix.pixelKeyPositions[channel.pixelKey][0] }},
            {{ fixture.matrix.pixelKeyPositions[channel.pixelKey][1] }},
            {{ fixture.matrix.pixelKeyPositions[channel.pixelKey][2] }})
            <span class="hint">(X, Y, Z)</span>
          </labeled-value>
        </template>
      </template>

      <template v-if="(channel instanceof CoarseChannel)">
        <labeled-value
          v-if="resolutionInMode > CoarseChannel.RESOLUTION_8BIT"
          name="channel-fineChannelAliases"
          label="Fine channels">
          {{ channel.fineChannels.slice(0, resolutionInMode - 1).map(
            fineChannel => `${fineChannel.name} (channel&nbsp;${mode.getChannelIndex(fineChannel) + 1})`
          ).join(`, `) }}
        </labeled-value>

        <labeled-value
          v-if="channel.hasDefaultValue"
          :value="`${channel.getDefaultValueWithResolution(resolutionInMode)}`"
          name="channel-defaultValue"
          label="Default DMX value" />

        <labeled-value
          v-if="channel.hasHighlightValue"
          :value="`${channel.getHighlightValueWithResolution(resolutionInMode)}`"
          name="channel-highlightValue"
          label="Highlight DMX value" />

        <labeled-value
          v-if="channel.isInverted"
          name="channel-isInverted"
          label="Is inverted?"
          value="Yes" />

        <labeled-value
          v-if="channel.isConstant"
          name="channel-isConstant"
          label="Is constant?"
          value="Yes" />

        <labeled-value
          v-if="channel.canCrossfade"
          name="channel-canCrossfade"
          label="Can crossfade?"
          value="Yes" />

        <labeled-value
          v-if="channel.precedence !== `LTP`"
          :value="channel.precedence"
          name="channel-precedence"
          label="Precedence" />

        <fixture-capability-table
          :channel="channel"
          :mode="mode"
          :resolution-in-mode="resolutionInMode"
          @help-wanted-clicked="$emit(`help-wanted-clicked`, $event)" />
      </template>

    </conditional-details>
  </li>
</template>

<style lang="scss" scoped>
summary, .summary {
  & > .icon {
    margin-right: 1.2ex;
  }

  & > .help-wanted-icon {
    fill: theme-color(yellow-background-hover);
    margin-left: 0.7ex;
    margin-right: 0;
  }
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
</style>

<script>
import conditionalDetails from '../conditional-details.vue';
import fixtureChannelTypeIcon from './channel-type-icon.vue';
import fixtureCapabilityTable from './capability-table.vue';
import labeledValue from '../labeled-value.vue';

import AbstractChannel from '../../../lib/model/AbstractChannel.js';
import CoarseChannel from '../../../lib/model/CoarseChannel.js';
import FineChannel from '../../../lib/model/FineChannel.js';
import Mode from '../../../lib/model/Mode.js';
import NullChannel from '../../../lib/model/NullChannel.js';
import SwitchingChannel from '../../../lib/model/SwitchingChannel.js';

export default {
  name: `AppFixtureChannel`,
  components: {
    'conditional-details': conditionalDetails,
    'fixture-channel-type-icon': fixtureChannelTypeIcon,
    'fixture-capability-table': fixtureCapabilityTable,
    'labeled-value': labeledValue
  },
  props: {
    channel: {
      type: AbstractChannel,
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
      CoarseChannel,
      FineChannel,
      SwitchingChannel,
      fixture: this.mode.fixture
    };
  },
  computed: {
    channelKey() {
      if (this.channel instanceof NullChannel) {
        return `null`;
      }

      if (this.channel.key !== this.channel.name) {
        return this.channel.key;
      }

      return ``;
    },
    resolutionInMode() {
      return this.channel.getResolutionInMode(this.mode);
    }
  }
};
</script>
