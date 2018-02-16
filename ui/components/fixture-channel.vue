<template>
  <li>
    <div class="channel">
      <app-fixture-channel-type-icon :channel="channel" />{{ unwrappedChannel.name }}<code v-if="channelKey" class="channel-key">{{ channelKey }}</code>
    </div>
  </li>
</template>

<style lang="scss" scoped>
@import '~assets/styles/vars.scss';

</style>


<script>
import svg from '~/components/svg.vue';
import fixtureChannelTypeIcon from '~/components/fixture-channel-type-icon.vue';

import AbstractChannel from '~~/lib/model/AbstractChannel.mjs';
import MatrixChannel from '~~/lib/model/MatrixChannel.mjs';
import NullChannel from '~~/lib/model/NullChannel.mjs';

export default {
  components: {
    'app-svg': svg,
    'app-fixture-channel-type-icon': fixtureChannelTypeIcon
  },
  props: {
    channel: {
      type: [AbstractChannel, MatrixChannel],
      required: true
    }
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
    }
  }
};
</script>
