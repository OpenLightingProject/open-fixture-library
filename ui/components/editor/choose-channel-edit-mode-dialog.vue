<template>
  <a11y-dialog
    id="chooseChannelEditMode"
    :cancellable="false"
    :shown="channel.editMode === `edit-?`"
    title="Edit channel in all modes or just in this one?"
    @show="onChooseChannelEditModeDialogOpen">

    <div class="button-bar right">
      <button class="secondary" @click.prevent="chooseChannelEditMode(`edit-duplicate`)">Only in this mode</button>
      <button class="primary" @click.prevent="chooseChannelEditMode(`edit-all`)">In all modes</button>
    </div>

  </a11y-dialog>
</template>

<script>
import a11yDialog from '../a11y-dialog.vue';

export default {
  components: {
    'a11y-dialog': a11yDialog
  },
  props: {
    channel: {
      type: Object,
      required: true
    },
    fixture: {
      type: Object,
      required: true
    }
  },
  methods: {
    onChooseChannelEditModeDialogOpen() {
      const channelUsedElsewhere = this.fixture.modes.some(
        mode => mode.uuid !== this.channel.modeId && mode.channels.includes(this.channel.uuid)
      );

      if (channelUsedElsewhere) {
        // let user first choose if they want to edit all or a duplicate
        return;
      }

      // else duplicate makes no sense here -> continue directly
      this.chooseChannelEditMode(`edit-all`);
    },
    chooseChannelEditMode(editMode) {
      // close this dialog
      this.channel.editMode = ``;

      this.$nextTick(() => {
        // open channel dialog
        this.channel.editMode = editMode;
      });
    }
  }
};
</script>
