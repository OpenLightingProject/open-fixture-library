<template>
  <OflSvg v-bind="iconProperties" />
</template>

<script>
import { instanceOfProp } from 'vue-ts-types';
import AbstractChannel from '../../lib/model/AbstractChannel.js';
import FineChannel from '../../lib/model/FineChannel.js';
import NullChannel from '../../lib/model/NullChannel.js';
import SwitchingChannel from '../../lib/model/SwitchingChannel.js';

export default {
  props: {
    channel: instanceOfProp(AbstractChannel).required,
  },
  computed: {
    iconProperties() {
      return getIconProperties(this.channel);
    },
  },
};

const channelTypeIcons = {
  'Multi-Color': `color-changer`,
  'Fog': `smoke`,
  'Intensity': `dimmer`,
};

/**
 * @param {AbstractChannel} channel The channel to get an icon for.
 * @returns {object} Object containing the props to pass to <OflSvg />
 */
function getIconProperties(channel) {
  if (channel instanceof NullChannel) {
    return {
      type: `fixture`,
      name: `NoFunction`,
      title: `Channel type: NoFunction`,
    };
  }

  if (channel instanceof FineChannel) {
    return getIconProperties(channel.coarseChannel);
  }

  if (channel instanceof SwitchingChannel) {
    return {
      type: `fixture`,
      name: `switching-channel`,
      title: `Channel type: Switching Channel`,
    };
  }

  if (channel.type === `Single Color`) {
    return {
      type: `color-circle`,
      name: channel.color,
      title: `Channel type: Single Color, ${channel.color}`,
    };
  }

  return {
    type: `fixture`,
    name: channelTypeIcons[channel.type] || channel.type,
    title: `Channel type: ${channel.type}`,
  };
}
</script>
