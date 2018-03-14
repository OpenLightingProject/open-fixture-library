// constant
var dragOptions = {
  handle: '.drag-handle',
  group: {
    name: 'mode',
    pull: 'clone',
    put: function(to, from, dragElem, event) {
      if (from === to) {
        return false;
      }

      var channelUuid = dragElem.getAttribute('data-channel-uuid');
      var channelAlreadyExists = to.el.querySelectorAll('[data-channel-uuid="' + channelUuid + '"]').length > 0;

      return !channelAlreadyExists;
    },
    revertClone: true
  }
};

module.exports = function(Vue) {
  Vue.component('fixture-mode', {
    template: '#template-mode',
    props: ['mode', 'fixture', 'channel'],
    mounted: function() {
      if (Vue._oflRestoreComplete) {
        this.$refs.firstInput.focus();
      }
    },
    data: function() {
      return {
        dragOptions: dragOptions
      };
    },
    methods: {
      getChannelName: function(channelUuid) {
        return this.$parent.getChannelName(channelUuid);
      },
      editChannel: function(channelUuid) {
        this.channel.modeId = this.mode.uuid;
        this.channel.editMode = 'edit-?';
        this.channel.uuid = channelUuid;
      },
      addChannel: function() {
        this.channel.modeId = this.mode.uuid;
        this.channel.editMode = 'add-existing';
      },
      isChannelNameUnique: function(channelUuid) {
        return this.$parent.isChannelNameUnique(channelUuid);
      },
      isFineChannel: function(channelUuid) {
        return 'coarseChannelId' in this.fixture.availableChannels[channelUuid];
      },
      removeChannel: function(channelUuid) {
        var channel = this.fixture.availableChannels[channelUuid];

        // first remove the finer channels if any
        var coarseChannelId = channelUuid;
        var fineness = 0;
        if (this.isFineChannel(channelUuid)) {
          coarseChannelId = channel.coarseChannelId;
          fineness = channel.fineness;
        }

        for (var chId in this.fixture.availableChannels) {
          if (!Object.hasOwnProperty.call(this.fixture.availableChannels, chId)) {
            continue;
          }

          var ch = this.fixture.availableChannels[chId];
          if ('coarseChannelId' in ch && ch.coarseChannelId === coarseChannelId
            && ch.fineness > fineness) {
            this.$parent.removeChannel(ch.uuid, this.mode.uuid);
          }
        }

        // then remove the channel itself
        this.$parent.removeChannel(channelUuid, this.mode.uuid);
      }
    }
  });
};
