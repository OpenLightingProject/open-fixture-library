<template>
  <A11yDialog
    id="choose-channel-edit-mode-dialog"
    is-alert-dialog
    :shown="channel.editMode === `edit-?`"
    title="Edit channel in all modes or just in this one?"
    @show="onChooseChannelEditModeDialogOpen()">

    <div class="button-bar right">
      <button
        type="submit"
        class="secondary"
        @click.prevent="chooseChannelEditMode(`edit-duplicate`)">
        Only in this mode
      </button>
      <button
        type="submit"
        class="primary"
        @click.prevent="chooseChannelEditMode(`edit-all`)">
        In all modes
      </button>
    </div>

  </A11yDialog>
</template>

<script setup lang="ts">
import type { EditorChannel, EditorFixture } from '~/types/editor';
import A11yDialog from '../A11yDialog.vue';

interface Properties {
  channel: EditorChannel;
  fixture: EditorFixture;
}

const properties = defineProps<Properties>();

/**
 * Chooses an edit mode when a channel is not shared with another mode.
 */
function onChooseChannelEditModeDialogOpen() {
  const channelUsedElsewhere = properties.fixture.modes.some(
    (mode) => mode.uuid !== properties.channel.modeId && mode.channels.includes(properties.channel.uuid),
  );

  if (channelUsedElsewhere) {
    return;
  }

  chooseChannelEditMode('edit-all');
}

/**
 * Applies an edit mode after forcing the dialog to re-render.
 * @param editMode - The edit mode to apply.
 */
async function chooseChannelEditMode(editMode: string) {
  properties.channel.editMode = '';

  await nextTick();

  properties.channel.editMode = editMode;
}
</script>
