<template>
  <OflSvg v-bind="iconProperties" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AbstractChannel from '../../lib/model/AbstractChannel.js';
import FineChannel from '../../lib/model/FineChannel.js';
import NullChannel from '../../lib/model/NullChannel.js';
import SwitchingChannel from '../../lib/model/SwitchingChannel.js';

const props = defineProps<{
  channel: InstanceType<typeof AbstractChannel>;
}>();

const channelTypeIcons: Record<string, string> = {
  'Multi-Color': 'color-changer',
  Fog: 'smoke',
  Intensity: 'dimmer',
};

function getIconProperties(channel: any) {
  if (channel instanceof NullChannel) {
    return {
      type: 'fixture',
      name: 'NoFunction',
      title: 'Channel type: NoFunction',
    };
  }

  if (channel instanceof FineChannel) {
    return getIconProperties(channel.coarseChannel);
  }

  if (channel instanceof SwitchingChannel) {
    return {
      type: 'fixture',
      name: 'switching-channel',
      title: 'Channel type: Switching Channel',
    };
  }

  if (channel.type === 'Single Color') {
    return {
      type: 'color-circle',
      name: channel.color,
      title: `Channel type: Single Color, ${channel.color}`,
    };
  }

  return {
    type: 'fixture',
    name: channelTypeIcons[channel.type] || channel.type,
    title: `Channel type: ${channel.type}`,
  };
}

const iconProperties = computed(() => getIconProperties(props.channel));
</script>
