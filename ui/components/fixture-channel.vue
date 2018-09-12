<template>
  <li>
    <app-conditional-details class="channel">
      <template slot="summary">
        <app-fixture-channel-type-icon :channel="channel" />{{ channel.name }}<code v-if="channelKey" class="channel-key">{{ channelKey }}</code>{{ appendToHeading ? ` ${appendToHeading}` : `` }}
        <app-svg
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
        Switches depending on trigger channel's value.

        <app-labeled-value
          name="switchingChannel-triggerChannel"
          label="Trigger channel">
          {{ channel.triggerChannel.name }} (channel&nbsp;{{ mode.getChannelIndex(channel.triggerChannel.key) + 1 }})
        </app-labeled-value>

        <ol>
          <app-fixture-channel
            v-for="(ranges, switchToChannelKey) in channel.triggerRanges"
            :key="switchToChannelKey"
            :channel="fixture.getChannelByKey(switchToChannelKey)"
            :mode="mode"
            :append-to-heading="channel.defaultChannel.key === switchToChannelKey ? `(default)` : null">
            <app-labeled-value
              name="switchingChannel-triggerRanges"
              label="Activated when">
              <span v-html="`Trigger channel is set to ${ranges.map(range => `<span style='white-space: nowrap;'>${range}</span>`).join(` or `)}`" />
            </app-labeled-value>
          </app-fixture-channel>
        </ol>
      </template>

      <template v-if="channel.pixelKey !== null && !(channel instanceof SwitchingChannel)">
        <app-labeled-value
          v-if="fixture.matrix.pixelGroupKeys.includes(channel.pixelKey)"
          :value="`${channel.pixelKey}`"
          name="channel-pixel-group"
          label="Pixel group" />

        <template v-else>
          <app-labeled-value
            :value="`${channel.pixelKey}`"
            name="channel-pixel-key"
            label="Pixel" />
          <app-labeled-value
            name="channel-pixel-position"
            label="Pixel position">
            ({{ fixture.matrix.pixelKeyPositions[channel.pixelKey][0] }},
            {{ fixture.matrix.pixelKeyPositions[channel.pixelKey][1] }},
            {{ fixture.matrix.pixelKeyPositions[channel.pixelKey][2] }})
            <span class="hint">(X, Y, Z)</span>
          </app-labeled-value>
        </template>
      </template>

      <template v-if="(channel instanceof CoarseChannel)">
        <app-labeled-value
          v-if="resolutionInMode > CoarseChannel.RESOLUTION_8BIT"
          name="channel-fineChannelAliases"
          label="Fine channels">
          {{ channel.fineChannels.slice(0, resolutionInMode - 1).map(
            fineChannel => `${fineChannel.name} (channel&nbsp;${mode.getChannelIndex(fineChannel) + 1})`
          ).join(`, `) }}
        </app-labeled-value>

        <app-labeled-value
          v-if="channel.hasDefaultValue"
          :value="`${channel.getDefaultValueWithResolution(resolutionInMode)}`"
          name="channel-defaultValue"
          label="Default DMX value" />

        <app-labeled-value
          v-if="channel.hasHighlightValue"
          :value="`${channel.getHighlightValueWithResolution(resolutionInMode)}`"
          name="channel-highlightValue"
          label="Highlight DMX value" />

        <app-labeled-value
          v-if="channel.isInverted"
          name="channel-isInverted"
          label="Is inverted?"
          value="Yes" />

        <app-labeled-value
          v-if="channel.isConstant"
          name="channel-isConstant"
          label="Is constant?"
          value="Yes" />

        <app-labeled-value
          v-if="channel.canCrossfade"
          name="channel-canCrossfade"
          label="Can crossfade?"
          value="Yes" />

        <app-labeled-value
          v-if="channel.precedence !== `LTP`"
          :value="channel.precedence"
          name="channel-precedence"
          label="Precedence" />

        <app-fixture-capability-table
          :channel="channel"
          :mode="mode"
          :resolution-in-mode="resolutionInMode" />
      </template>

    </app-conditional-details>
  </li>
</template>

<style lang="scss" scoped>
@import '~assets/styles/vars.scss';

summary, .summary {
  & > .icon {
    margin-right: 1.2ex;
  }

  & > .help-wanted-icon {
    fill: $yellow-700;
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
import svg from '~/components/svg.vue';
import conditionalDetails from '~/components/conditional-details.vue';
import fixtureChannelTypeIcon from '~/components/fixture-channel-type-icon.vue';
import fixtureCapabilityTable from '~/components/fixture-capability-table.vue';
import labeledValueVue from '~/components/labeled-value.vue';

import AbstractChannel from '~~/lib/model/AbstractChannel.mjs';
import CoarseChannel from '~~/lib/model/CoarseChannel.mjs';
import FineChannel from '~~/lib/model/FineChannel.mjs';
import Mode from '~~/lib/model/Mode.mjs';
import NullChannel from '~~/lib/model/NullChannel.mjs';
import SwitchingChannel from '~~/lib/model/SwitchingChannel.mjs';

export default {
  name: `AppFixtureChannel`,
  components: {
    'app-svg': svg,
    'app-conditional-details': conditionalDetails,
    'app-fixture-channel-type-icon': fixtureChannelTypeIcon,
    'app-fixture-capability-table': fixtureCapabilityTable,
    'app-labeled-value': labeledValueVue
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
