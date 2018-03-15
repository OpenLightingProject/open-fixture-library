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
        <th /> <!-- color -->
        <th>Capability</th>
        <th /> <!-- menuClick -->
      </tr>
    </thead>
    <tbody>
      <template v-for="(cap, index) in capabilities">
        <tr :key="`cap-${index}`">
          <td class="capability-range0"><code>{{ cap.dmxRangeStart }} </code></td>
          <td class="capability-range-separator"><code>…</code></td>
          <td class="capability-range1"><code>{{ cap.dmxRangeEnd }}</code></td>

          <td
            v-if="cap.color !== null && cap.color2 !== null"
            :title="`color: ${cap.color} / ${cap.color2}`"
            class="capability-color">
            <app-svg :colors="[cap.color, cap.color2]" type="color-circle" />
          </td>
          <td
            v-else-if="cap.color !== null"
            :title="`color: ${cap.color}`"
            class="capability-color">
            <app-svg :colors="[cap.color]" type="color-circle" />
          </td>
          <td v-else />

          <td class="capability-name">{{ cap.name }}</td>

          <td
            :title="cap.menuClick === `hidden` ? `this capability is hidden in quick menus` : `choosing this capability in a quick menu snaps to ${cap.menuClick} of capability`"
            class="capability-menuClick">
            <app-svg :name="`capability-${cap.menuClick}`" />
          </td>
        </tr>

        <tr
          v-for="switchChannel in cap.switchChannels"
          :key="`cap-${index}-switch-${switchChannel.key}`">
          <td colspan="4" />
          <td colspan="2" class="switch-to-channel">
            <span class="switching-channel-key">{{ switchChannel.key }} (channel&nbsp;{{ switchChannel.index + 1 }}) →</span>&nbsp;{{ switchChannel.to }}
          </td>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<style lang="scss" scoped>
@import '~assets/styles/vars.scss';

.capabilities-table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
}

th {
  font-weight: normal;
  color: $secondary-text-dark;
}

td, th {
  padding: 0 4px;
  vertical-align: top;
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

.switch-to-channel {
  line-height: 1rem;
  padding-bottom: 4px;
  font-size: 82%;

  & > .switching-channel-key {
    color: $secondary-text-dark;
  }
}
</style>


<script>
import svg from '~/components/svg.vue';

import Channel from '~~/lib/model/Channel.mjs';
import Mode from '~~/lib/model/Mode.mjs';

export default {
  components: {
    'app-svg': svg
  },
  props: {
    channel: {
      type: Channel,
      required: true
    },
    mode: {
      type: Mode,
      required: true
    },
    finenessInMode: {
      type: Number,
      required: true
    }
  },
  computed: {
    capabilities() {
      return this.channel.capabilities.map(
        cap => {
          const range = cap.getRangeWithFineness(this.finenessInMode);
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
            dmxRangeStart: range.start,
            dmxRangeEnd: range.end,
            color: cap.color ? cap.color.rgb().string() : null,
            color2: cap.color2 ? cap.color2.rgb().string() : null,
            image: cap.image,
            name: cap.name,
            menuClick: cap.menuClick,
            switchChannels
          };
        }
      );
    }
  }
};
</script>
