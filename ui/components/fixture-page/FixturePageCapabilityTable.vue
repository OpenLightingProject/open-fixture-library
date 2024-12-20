<template>
  <table class="capabilities-table">
    <colgroup>
      <col style="width: 5.8ex;">
      <col style="width: 1ex;">
      <col style="width: 5.8ex;">
      <col style="width: 1.8em;">
      <col>
      <col style="width: 1.8em;">
    </colgroup>
    <thead>
      <tr>
        <th colspan="3" style="text-align: center;">DMX values</th>
        <th /> <!-- icon -->
        <th>Capability</th>
        <th /> <!-- menuClick -->
      </tr>
    </thead>
    <tbody>
      <template v-for="(cap, index) of capabilities">
        <tr :key="`cap-${index}`" class="capability" :data-capability-type="cap.model.type">
          <td class="capability-range0"><code>{{ cap.dmxRangeStart }} </code></td>
          <td class="capability-range-separator"><code>…</code></td>
          <td class="capability-range1"><code>{{ cap.dmxRangeEnd }}</code></td>

          <td class="capability-icon">
            <CapabilityTypeIcon :capability="cap.model" />
          </td>

          <td class="capability-name">{{ cap.model.name }}</td>

          <td
            :title="cap.model.menuClick === `hidden` ? `this capability is hidden in quick menus` : `choosing this capability in a quick menu snaps to ${cap.model.menuClick} of capability`"
            class="capability-menu-click">
            <OflSvg :name="`capability-${cap.model.menuClick}`" />
          </td>
        </tr>

        <tr
          v-for="switchChannel of cap.switchChannels"
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
            <HelpWantedMessage
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
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

th {
  font-weight: 400;
  color: theme-color(text-secondary);
}

td,
th {
  padding: 0 4px;
  vertical-align: top;
}

.capability[data-capability-type="NoFunction"],
.capability[data-capability-type="NoFunction"] + .switch-to-channel {
  opacity: 0.6;
}

.capability-range0 {
  padding-right: 2px;
  text-align: right;
}

.capability-range-separator {
  padding-right: 0;
  padding-left: 0;
  text-align: center;
}

.capability-range1 {
  padding-left: 2px;
  text-align: left;
}

.capability-icon .gobo-icon {
  pointer-events: none;
  transition: transform 0.4s;
}

.capability-icon:hover .gobo-icon {
  z-index: 1;
  transform: scale(4);
}

.capability-menu-click {
  text-align: right;
}

.switch-to-channel > td {
  padding-bottom: 4px;
  font-size: 82%;
  line-height: 1rem;

  & > .switching-channel-key {
    color: theme-color(text-secondary);
  }
}
</style>

<script>
import { instanceOfProp, numberProp } from 'vue-ts-types';
import CoarseChannel from '../../../lib/model/CoarseChannel.js';
import Mode from '../../../lib/model/Mode.js';

import CapabilityTypeIcon from '../CapabilityTypeIcon.vue';
import HelpWantedMessage from '../HelpWantedMessage.vue';

export default {
  components: {
    CapabilityTypeIcon,
    HelpWantedMessage,
  },
  props: {
    channel: instanceOfProp(CoarseChannel).required,
    mode: instanceOfProp(Mode).required,
    resolutionInMode: numberProp().required,
  },
  emits: {
    'help-wanted-clicked': payload => true,
  },
  computed: {
    capabilities() {
      return this.channel.capabilities.map(capability => {
        const dmxRange = capability.getDmxRangeWithResolution(this.resolutionInMode);
        const switchChannels = [];

        for (const switchingChannelKey of Object.keys(capability.switchChannels)) {
          const switchingChannelIndex = this.mode.getChannelIndex(switchingChannelKey);

          if (switchingChannelIndex > -1) {
            switchChannels.push({
              key: switchingChannelKey,
              index: switchingChannelIndex,
              to: capability.switchChannels[switchingChannelKey],
            });
          }
        }

        return {
          model: capability,
          dmxRangeStart: dmxRange.start,
          dmxRangeEnd: dmxRange.end,
          switchChannels: switchChannels.sort((a, b) => a.index - b.index), // ascending indices
        };
      });
    },
  },
};
</script>
