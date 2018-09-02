<template>
  <li>
    <app-conditional-details class="channel">
      <template slot="summary">
        <app-fixture-channel-type-icon :channel="channel" />{{ unwrappedChannel.name }}<code v-if="channelKey" class="channel-key">{{ channelKey }}</code>{{ appendToHeading ? ` ${appendToHeading}` : `` }}
        <app-svg
          v-if="channel.isHelpWanted"
          class="help-wanted-icon"
          name="comment-question-outline"
          title="Help wanted!" />
      </template>

      <slot />

      <div v-if="(unwrappedChannel instanceof FineChannel)">
        Fine channel of {{ unwrappedChannel.coarseChannel.name }} (channel&nbsp;{{ mode.getChannelIndex(unwrappedChannel.coarseChannel.key) + 1 }})
      </div>

      <template v-else-if="(unwrappedChannel instanceof SwitchingChannel)">
        Switches depending on trigger channel's value.

        <app-labeled-value
          name="switchingChannel-triggerChannel"
          label="Trigger channel">
          {{ unwrappedChannel.triggerChannel.name }} (channel&nbsp;{{ mode.getChannelIndex(unwrappedChannel.triggerChannel.key) + 1 }})
        </app-labeled-value>

        <ol>
          <app-fixture-channel
            v-for="(ranges, switchToChannelKey) in unwrappedChannel.triggerRanges"
            :key="switchToChannelKey"
            :channel="fixture.getChannelByKey(switchToChannelKey)"
            :mode="mode"
            :append-to-heading="unwrappedChannel.defaultChannel.key === switchToChannelKey ? `(default)` : null">
            <app-labeled-value
              name="switchingChannel-triggerRanges"
              label="Activated when">
              <span v-html="`Trigger channel is set to ${ranges.map(range => `<span style='white-space: nowrap;'>${range}</span>`).join(` or `)}`" />
            </app-labeled-value>
          </app-fixture-channel>
        </ol>
      </template>

      <template v-if="channel instanceof MatrixChannel && !(unwrappedChannel instanceof SwitchingChannel)">
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

      <template v-if="(unwrappedChannel instanceof Channel)">
        <app-labeled-value
          v-if="finenessInMode > Channel.FINENESS_8BIT"
          name="channel-fineChannelAliases"
          label="Fine channels">
          {{ unwrappedChannel.fineChannels.slice(0, finenessInMode - 1).map(
            fineChannel => `${fineChannel.name} (channel&nbsp;${mode.getChannelIndex(fineChannel) + 1})`
          ).join(`, `) }}
        </app-labeled-value>

        <app-labeled-value
          v-if="unwrappedChannel.hasDefaultValue"
          :value="`${unwrappedChannel.getDefaultValueWithFineness(finenessInMode)}`"
          name="channel-defaultValue"
          label="Default DMX value" />

        <app-labeled-value
          v-if="unwrappedChannel.hasHighlightValue"
          :value="`${unwrappedChannel.getHighlightValueWithFineness(finenessInMode)}`"
          name="channel-highlightValue"
          label="Highlight DMX value" />

        <app-labeled-value
          v-if="unwrappedChannel.isInverted"
          name="channel-isInverted"
          label="Is inverted?"
          value="Yes" />

        <app-labeled-value
          v-if="unwrappedChannel.isConstant"
          name="channel-isConstant"
          label="Is constant?"
          value="Yes" />

        <app-labeled-value
          v-if="unwrappedChannel.canCrossfade"
          name="channel-canCrossfade"
          label="Can crossfade?"
          value="Yes" />

        <app-labeled-value
          v-if="unwrappedChannel.precedence !== `LTP`"
          :value="unwrappedChannel.precedence"
          name="channel-precedence"
          label="Precedence" />

        <app-fixture-capability-table
          :channel="unwrappedChannel"
          :mode="mode"
          :fineness-in-mode="finenessInMode" />
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
    'app-conditional-details': conditionalDetails,
    'app-fixture-channel-type-icon': fixtureChannelTypeIcon,
    'app-fixture-capability-table': fixtureCapabilityTable,
    'app-labeled-value': labeledValueVue
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
