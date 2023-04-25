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

<script>
import { objectProp } from 'vue-ts-types';
import A11yDialog from '../A11yDialog.vue';

export default {
  components: {
    A11yDialog,
  },
  props: {
    channel: objectProp().required,
    fixture: objectProp().required,
  },
  methods: {
    onChooseChannelEditModeDialogOpen() {
      const channelUsedElsewhere = this.fixture.modes.some(
        mode => mode.uuid !== this.channel.modeId && mode.channels.includes(this.channel.uuid),
      );

      if (channelUsedElsewhere) {
        // let user first choose if they want to edit all or a duplicate
        return;
      }

      // else duplicate makes no sense here -> continue directly
      this.chooseChannelEditMode(`edit-all`);
    },
    async chooseChannelEditMode(editMode) {
      // close this dialog
      this.channel.editMode = ``;

      await this.$nextTick();

      // open channel dialog
      this.channel.editMode = editMode;
    },
  },
};
</script>
