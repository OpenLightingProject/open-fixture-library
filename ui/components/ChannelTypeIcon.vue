<template>
  <OflSvg v-bind="iconProperties" />
</template>

<script setup lang="ts">
import FineChannel from '~~/lib/model/FineChannel.js';
import NullChannel from '~~/lib/model/NullChannel.js';
import SwitchingChannel from '~~/lib/model/SwitchingChannel.js';
import type { AbstractChannel } from '~/types/models';

interface Properties {
  channel: AbstractChannel;
}

const properties = defineProps<Properties>();

const iconProperties = computed(() => getIconProperties(properties.channel));

const channelTypeIcons: Record<string, string> = {
  'Multi-Color': 'color-changer',
  'Fog': 'smoke',
  'Intensity': 'dimmer',
};

/**
 * Builds the icon props for a channel, resolving fine and switching channels.
 * @param channel - The channel to describe.
 * @returns The icon props.
 */
function getIconProperties(channel: AbstractChannel): { type: string; name: string; title: string; colors?: string[] } {
  while (channel instanceof FineChannel) {
    channel = channel.coarseChannel;
  }

  if (channel instanceof NullChannel) {
    return {
      type: 'fixture',
      name: 'NoFunction',
      title: 'Channel type: NoFunction',
    };
  }

  if (channel instanceof SwitchingChannel) {
    return {
      type: 'fixture',
      name: 'switching-channel',
      title: 'Channel type: Switching Channel',
    };
  }

  const typedChannel = channel as unknown as { type: string; color?: string };

  if (typedChannel.type === 'Single Color') {
    return {
      type: 'color-circle',
      name: typedChannel.color ?? '',
      title: `Channel type: Single Color, ${typedChannel.color ?? ''}`,
    };
  }

  return {
    type: 'fixture',
    name: channelTypeIcons[typedChannel.type] || typedChannel.type,
    title: `Channel type: ${typedChannel.type}`,
  };
}
</script>
