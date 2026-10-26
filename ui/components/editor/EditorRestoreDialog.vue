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
import { computed, nextTick } from 'vue';
import {
  getEmptyCapability,
  getEmptyChannel,
  getEmptyFineChannel,
  getEmptyFixture,
  getEmptyLink,
  getEmptyMode,
  getEmptyPhysical,
  getSanitizedChannel,
  toPlainData,
} from '@/assets/scripts/editor-utilities.js';
import { getStoredItem, setStoredItem } from '~/utils/storage';

interface Properties {
  modelValue?: {
    timestamp: number;
    fixture: any;
    channel?: any;
  };
}

const properties = defineProps<Properties>();
const emit = defineEmits<{
  'update:model-value': [value: undefined];
  'restore': [value: { fixture: any; channel: any }];
  'restore-complete': [];
}>();

const restoredDate = computed(() => {
  return properties.modelValue === undefined ? undefined : (new Date(properties.modelValue.timestamp)).toISOString().replace(/\..*$/, '').replace('T', ', ');
});

/**
 * Removes the pending auto-save entry and dismisses the dialog.
 */
function discardRestored() {
  // put all items except the last one back; a corrupt/foreign auto-save value
  // must not make Discard un-dismissable
  let autoSaveItems: unknown[] = [];
  try {
    const parsed = JSON.parse(getStoredItem('autoSave') || '[]');
    if (Array.isArray(parsed)) {
      autoSaveItems = parsed;
    }
  }
  catch {
    // Fall back to an empty list and still dismiss the dialog.
  }
  setStoredItem('autoSave', JSON.stringify(autoSaveItems.slice(0, -1)));

  emit('update:model-value', undefined);
  emit('restore-complete');
}

/**
 * Emits the sanitized auto-save data and closes the dialog.
 */
async function applyRestored() {
  const modelValue = toPlainData(properties.modelValue) as {
    fixture: any;
    channel?: any;
  };

  emit('update:model-value', undefined);

  await nextTick();

  emit('restore', {
    fixture: getRestoredFixture(modelValue.fixture),
    channel: getRestoredChannel(modelValue.channel, true),
  });

  await nextTick();
  emit('restore-complete');
}

/**
 * Merges stored fixture data with the current fixture defaults.
 * @param fixture - The stored fixture data.
 * @returns The restored fixture.
 */
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

/**
 * Merges stored channel data with the current channel defaults.
 * @param channel - The stored channel data.
 * @param isChannelDialog - Whether the channel is restored into the channel dialog.
 * @returns The restored channel.
 */
function getRestoredChannel(channel: any, isChannelDialog: boolean) {
  if ('coarseChannelId' in channel) {
    return Object.assign(getEmptyFineChannel(channel.coarseChannelId, channel.resolution), channel);
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
