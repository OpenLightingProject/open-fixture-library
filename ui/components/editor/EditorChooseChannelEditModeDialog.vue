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
import A11yDialog from '../A11yDialog.vue';

interface Props {
  channel: object;
  fixture: object;
}

const props = defineProps<Props>();

function onChooseChannelEditModeDialogOpen() {
  const channelUsedElsewhere = props.fixture.modes.some(
    mode => mode.uuid !== props.channel.modeId && mode.channels.includes(props.channel.uuid),
  );

  if (channelUsedElsewhere) {
    return;
  }

  chooseChannelEditMode(`edit-all`);
}

async function chooseChannelEditMode(editMode: string) {
  props.channel.editMode = ``;

  await nextTick();

  props.channel.editMode = editMode;
}
</script>
