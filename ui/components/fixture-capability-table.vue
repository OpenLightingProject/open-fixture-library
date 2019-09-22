<template>
  <table class="capabilities-table">
    <colgroup>
      <col style="width: 5.8ex">
      <col style="width: 1ex">
      <col style="width: 5.8ex">
      <col style="width: 1.8em">
      <col>
      <col style="width: 1.8em">
    </colgroup>
    <thead>
      <tr>
        <th colspan="3" style="text-align: center">DMX values</th>
        <th /> <!-- icon -->
        <th>Capability</th>
        <th /> <!-- menuClick -->
      </tr>
    </thead>
    <tbody>
      <template v-for="(cap, index) in capabilities">
        <tr :key="`cap-${index}`" :class="`capability capability-${cap.model.type}`">
          <td class="capability-range0"><code>{{ cap.dmxRangeStart }} </code></td>
          <td class="capability-range-separator"><code>…</code></td>
          <td class="capability-range1"><code>{{ cap.dmxRangeEnd }}</code></td>

          <td class="capability-icon">
            <app-fixture-capability-type-icon :capability="cap.model" />
          </td>

          <td class="capability-name">{{ cap.model.name }}</td>

          <td
            :title="cap.model.menuClick === `hidden` ? `this capability is hidden in quick menus` : `choosing this capability in a quick menu snaps to ${cap.model.menuClick} of capability`"
            class="capability-menuClick">
            <app-svg :name="`capability-${cap.model.menuClick}`" />
          </td>
        </tr>

        <tr
          v-for="switchChannel in cap.switchChannels"
          :key="`cap-${index}-switch-${switchChannel.key}`"
          class="switch-to-channel">
          <td colspan="4" />
          <td colspan="2">
            <span class="switching-channel-key">Channel&nbsp;{{ switchChannel.index + 1 }} →</span>&nbsp;{{ switchChannel.to }}
          </td>
        </tr>

        <tr
          v-if="cap.model.helpWanted !== null"
          :key="`cap-${index}-helpWanted`">
          <td colspan="4" />
          <td colspan="2">
            <app-help-wanted-message
              type="capability"
              :context="cap.model"
              @help-wanted-clicked="$emit(`help-wanted-clicked`, $event)" />
          </td>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<style lang="scss" scoped>
.capabilities-table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
}

th {
  font-weight: normal;
  color: theme-color(text-secondary);
}

td, th {
  padding: 0 4px;
  vertical-align: top;
}

.capability-NoFunction,
.capability-NoFunction + .switch-to-channel {
  opacity: 0.6;
}

.capability-range0 {
  text-align: right;
  padding-right: 2px;
}

.capability-range-separator {
  text-align: center;
  padding-left: 0;
  padding-right: 0;
}

.capability-range1 {
  text-align: left;
  padding-left: 2px;
}


.capability-menuClick {
  text-align: right;
}

.switch-to-channel > td {
  line-height: 1rem;
  padding-bottom: 4px;
  font-size: 82%;

  & > .switching-channel-key {
    color: theme-color(text-secondary);
  }
}
</style>


<script>
import svg from '~/components/svg.vue';
import helpWantedMessage from '~/components/help-wanted-message.vue';
import fixtureCapabilityTypeIconVue from '~/components/fixture-capability-type-icon.vue';

import CoarseChannel from '~~/lib/model/CoarseChannel.js';
import Mode from '~~/lib/model/Mode.js';

export default {
  components: {
    'app-svg': svg,
    'app-help-wanted-message': helpWantedMessage,
    'app-fixture-capability-type-icon': fixtureCapabilityTypeIconVue
  },
  props: {
    channel: {
      type: CoarseChannel,
      required: true
    },
    mode: {
      type: Mode,
      required: true
    },
    resolutionInMode: {
      type: Number,
      required: true
    }
  },
  computed: {
    capabilities() {
      return this.channel.capabilities.map(
        cap => {
          const dmxRange = cap.getDmxRangeWithResolution(this.resolutionInMode);
          const switchChannels = [];

          for (const switchingChannelKey of Object.keys(cap.switchChannels)) {
            const switchingChannelIndex = this.mode.getChannelIndex(switchingChannelKey);

            if (switchingChannelIndex > -1) {
              switchChannels.push({
                key: switchingChannelKey,
                index: switchingChannelIndex,
                to: cap.switchChannels[switchingChannelKey]
              });
            }
          }

          return {
            model: cap,
            dmxRangeStart: dmxRange.start,
            dmxRangeEnd: dmxRange.end,
            switchChannels: switchChannels.sort((a, b) => a.index - b.index) // ascending indices
          };
        }
      );
    }
  }
};
</script>
