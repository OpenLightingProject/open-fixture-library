<template>
  <A11yDialog
    id="restore-dialog"
    is-alert-dialog
    :shown="modelValue !== undefined"
    title="Auto-saved fixture data found">

    Do you want to restore the data (auto-saved <time>{{ restoredDate }}</time>) to continue to create the fixture?

    <div class="button-bar right">
      <button
        type="submit"
        class="discard secondary"
        @click.prevent="discardRestored()">
        Discard data
      </button>
      <button
        type="submit"
        class="restore primary"
        @click.prevent="applyRestored()">
        Restore to continue work
      </button>
    </div>

  </A11yDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  getEmptyCapability,
  getEmptyChannel,
  getEmptyFineChannel,
  getEmptyFixture,
  getEmptyLink,
  getEmptyMode,
  getEmptyPhysical,
  getSanitizedChannel,
} from '@/assets/scripts/editor-utilities.js';

interface Props {
  modelValue?: {
    timestamp: number;
    fixture: any;
    channel?: any;
  };
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:model-value': [value: undefined];
  'restore-complete': [];
}>();

const restoredDate = computed(() => {
  if (props.modelValue === undefined) {
    return undefined;
  }
  return (new Date(props.modelValue.timestamp)).toISOString().replace(/\..*$/, '').replace('T', ', ');
});

function discardRestored() {
  localStorage.setItem('autoSave', JSON.stringify(JSON.parse(localStorage.getItem('autoSave') || '[]').slice(0, -1)));

  emit('update:model-value', undefined);
  emit('restore-complete');
}

async function applyRestored() {
  const modelValue = structuredClone(props.modelValue);

  emit('update:model-value', undefined);

  await nextTick();

  const parent = getCurrentInstance()?.proxy?.$parent;
  if (parent) {
    parent.fixture = getRestoredFixture(modelValue.fixture);
    parent.channel = getRestoredChannel(modelValue.channel, true);
  }

  await nextTick();
  emit('restore-complete');
}

import { nextTick, getCurrentInstance } from 'vue';

function getRestoredFixture(fixture: any) {
  const restoredFixture = Object.assign(getEmptyFixture(), fixture);

  for (const [index, link] of restoredFixture.links.entries()) {
    restoredFixture.links[index] = Object.assign(getEmptyLink(), link);
  }

  restoredFixture.physical = Object.assign(getEmptyPhysical(), restoredFixture.physical);

  for (const [index, mode] of restoredFixture.modes.entries()) {
    restoredFixture.modes[index] = Object.assign(getEmptyMode(), mode);
    restoredFixture.modes[index].physical = Object.assign(getEmptyPhysical(), mode.physical);
  }

  for (const channelKey of Object.keys(restoredFixture.availableChannels)) {
    restoredFixture.availableChannels[channelKey] = getRestoredChannel(restoredFixture.availableChannels[channelKey], false);
  }

  return restoredFixture;
}

function getRestoredChannel(channel: any, isChannelDialog: boolean) {
  if ('coarseChannelId' in channel) {
    return Object.assign(getEmptyFineChannel(), channel);
  }

  let emptyChannel = getEmptyChannel();
  if (!isChannelDialog) {
    emptyChannel = getSanitizedChannel(emptyChannel);
  }

  const restoredChannel = Object.assign(emptyChannel, channel);

  for (const [index, capability] of restoredChannel.capabilities.entries()) {
    restoredChannel.capabilities[index] = Object.assign(
      getEmptyCapability(),
      capability,
    );
  }

  if (isChannelDialog && 'wizard' in restoredChannel) {
    restoredChannel.wizard.templateCapability = Object.assign(
      getEmptyCapability(),
      restoredChannel.wizard.templateCapability,
    );
  }

  return restoredChannel;
}
</script>
