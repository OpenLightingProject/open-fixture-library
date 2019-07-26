<template>
  <app-svg v-bind="iconProps" />
</template>

<script>
import svg from '~/components/svg.vue';

import AbstractChannel from '~~/lib/model/AbstractChannel.mjs';
import FineChannel from '~~/lib/model/FineChannel.mjs';
import NullChannel from '~~/lib/model/NullChannel.mjs';
import SwitchingChannel from '~~/lib/model/SwitchingChannel.mjs';

export default {
  components: {
    'app-svg': svg
  },
  props: {
    channel: {
      type: AbstractChannel,
      required: true
    }
  },
  computed: {
    iconProps() {
      return getIconProps(this.channel);
    }
  }
};

/**
 * @param {AbstractChannel} channel The channel to get an icon for.
 * @returns {object} Object containing the props to pass to <app-svg />
 */
function getIconProps(channel) {
  if (channel instanceof NullChannel) {
    return {
      type: `capability`,
      name: `NoFunction`,
      title: `Channel type: NoFunction`
    };
  }

  if (channel instanceof FineChannel) {
    return getIconProps(channel.coarseChannel);
  }

  if (channel instanceof SwitchingChannel) {
    return {
      type: `capability`,
      name: `Switching Channel`,
      title: `Channel type: Switching Channel`
    };
  }

  if (channel.type === `Single Color`) {
    return {
      type: `color-circle`,
      name: channel.color,
      title: `Channel type: Single Color, ${channel.color}`
    };
  }

  let iconName = channel.type;

  if (channel.type === `Multi-Color`) {
    iconName = `Color`;
  }

  return {
    type: `capability`,
    name: iconName,
    title: `Channel type: ${channel.type}`
  };
}
</script>
