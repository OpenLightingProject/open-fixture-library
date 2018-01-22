'use strict';

require('./polyfills.js');
var uuidV4 = require('uuid/v4.js');
var Vue = require('vue/dist/vue.js');
var validate = require('./validate.js');
var draggable = require('vuedraggable');

var utils = require('./fixture-editor-utils.js');

Vue._oflRestoreComplete = false;

validate.init(function(form) {
  if (form.id === 'fixture-form') {
    app.submitFixture();
  }
  else if (form.id === 'channel-form') {
    app.saveChannel();
  }
});

var sendObject = {
  fixtures: []
};


var storageAvailable = (function() {
  try {
    var x = '__storage_test__';
    localStorage.setItem(x, x);
    localStorage.removeItem(x);
    return true;
  }
  catch (e) {
    return false;
  }
})();

Vue.directive('focus', {
  inserted: function(el) {
    if (Vue._oflRestoreComplete) {
      el.focus();
    }
  }
});

Vue.component('draggable', draggable);

require('./components/a11y-dialog.js')(Vue);
require('./components/category-chooser.js')(Vue);
require('./components/physical-data.js')(Vue);
require('./components/fixture-mode.js')(Vue);
require('./components/channel-capability.js')(Vue);
require('./components/capability-wizard.js')(Vue);

var initFixture = utils.getEmptyFixture();
if ('oflPrefill' in window) {
  Object.keys(window.oflPrefill).forEach(function(key) {
    if (typeof initFixture[key] !== 'object') {
      initFixture[key] = window.oflPrefill[key];
    }
  });
}

var app = window.app = new Vue({
  el: '#fixture-editor',
  data: {
    fixture: initFixture,
    channel: utils.getEmptyChannel(),
    channelChanged: false,
    readyToAutoSave: false,
    honeypot: '',
    submit: {
      state: 'closed',
      pullRequestUrl: '',
      rawData: ''
    },
    restoredData: ''
  },
  computed: {
    currentMode: function() {
      var uuid = this.channel.modeId;
      var modeIndex = this.fixture.modes.findIndex(function(mode) {
        return mode.uuid === uuid;
      });
      return this.fixture.modes[modeIndex];
    },
    currentModeUnchosenChannels: function() {
      return Object.keys(this.fixture.availableChannels).filter(function(channelUuid) {
        if (app.currentMode.channels.indexOf(channelUuid) !== -1) {
          // already used
          return false;
        }

        var channel = app.fixture.availableChannels[channelUuid];
        if ('coarseChannelId' in channel) {
          // should we include this fine channel?

          if (app.currentMode.channels.indexOf(channel.coarseChannelId) === -1) {
            // its coarse channel is not yet in the mode
            return false;
          }

          var maxFoundFineness = 0;
          for (var i = 0; i < app.currentMode.channels.length; i++) {
            var ch = app.fixture.availableChannels[app.currentMode.channels[i]];

            if ('coarseChannelId' in ch && ch.coarseChannelId === channel.coarseChannelId) {
              maxFoundFineness = Math.max(maxFoundFineness, ch.fineness);
            }
          }
          if (maxFoundFineness < channel.fineness - 1) {
            // the finest channel currently used is not its next coarser channel
            return false;
          }
        }

        return true;
      });
    },
    currentModeDisplayName: function() {
      var modeName = '#' + (this.fixture.modes.indexOf(this.currentMode) + 1);
      if (this.currentMode.shortName) {
        modeName = '"' + this.currentMode.shortName + '"';
      }
      else if (this.currentMode.name) {
        modeName = '"' + this.currentMode.name + '"';
      }
      return modeName;
    },
    restoredDate: function() {
      if (this.restoredData === '') {
        return '';
      }
      return (new Date(this.restoredData.timestamp)).toLocaleString('en-US');
    }
  },
  watch: {
    fixture: {
      handler: function() {
        this.autoSave('fixture');
      },
      deep: true
    },
    channel: {
      handler: function() {
        this.autoSave('channel');
        this.channelChanged = true;
      },
      deep: true
    }
  },
  mounted: restoreAutoSave,
  methods: {
    addNewMode: function() {
      this.fixture.modes.push(utils.getEmptyMode());
    },
    switchManufacturer: switchManufacturer,
    onChannelDialogOpen: onChannelDialogOpen,
    onChannelDialogClose: onChannelDialogClose,
    onChooseChannelEditModeDialogOpen: onChooseChannelEditModeDialogOpen,
    chooseChannelEditMode: chooseChannelEditMode,
    capabilitiesScroll: capabilitiesScroll,
    resetChannelForm: resetChannelForm,
    saveChannel: saveChannel,
    addFineChannels: addFineChannels,
    removeChannel: removeChannel,
    autoSave: autoSave,
    clearAutoSave: clearAutoSave,
    discardRestored: discardRestored,
    applyRestored: applyRestored,
    submitFixture: submitFixture,
    getChannelName: function(channelUuid) {
      var channel = this.fixture.availableChannels[channelUuid];
      if ('coarseChannelId' in channel) {
        var name = this.getChannelName(channel.coarseChannelId) + ' fine';
        if (channel.fineness > 1) {
          name += '^' + channel.fineness;
        }
        return name;
      }
      return channel.name;
    },
    isChannelNameUnique: function(channelUuid) {
      var chName = this.getChannelName(channelUuid);
      for (var channelKey in this.fixture.availableChannels) {
        if (!Object.hasOwnProperty.call(this.fixture.availableChannels, channelKey)) {
          continue;
        }

        var cmpName = this.getChannelName(channelKey);
        if (cmpName === chName && channelKey !== channelUuid) {
          return false;
        }
      }
      return true;
    }
  }
});

function switchManufacturer(useExisting) {
  this.fixture.useExistingManufacturer = useExisting;
  Vue.nextTick(function() {
    app.$refs[useExisting ? 'existingManufacturerSelect' : 'newManufacturerNameInput'].focus();
  });
}

function onChannelDialogOpen() {
  if (this.channel.editMode === 'add-existing' && this.currentModeUnchosenChannels.length === 0) {
    this.channel.editMode = 'create';
  }
  else if (this.channel.editMode === 'edit-all' || this.channel.editMode === 'edit-duplicate') {
    var channel = this.fixture.availableChannels[this.channel.uuid];
    for (var prop in channel) {
      if (Object.hasOwnProperty.call(channel, prop)) {
        this.channel[prop] = utils.clone(channel[prop]);
      }
    }
  }

  // after dialog is opened
  Vue.nextTick(function() {
    app.channelChanged = false;
  });
}

function onChannelDialogClose() {
  if (this.channel.editMode === '') {
    // saving did already manage everything
    return;
  }

  var editMode = this.channel.editMode;
  this.channel.editMode = '';

  if (this.channelChanged && !window.confirm('Do you want to lose the entered channel data?')) {
    Vue.nextTick(function() {
      app.channel.editMode = editMode;
    });
    return;
  }

  this.resetChannelForm();
}

function onChooseChannelEditModeDialogOpen() {
  var channelUsedElsewhere = this.fixture.modes.some(function(mode) {
    return mode.uuid !== app.channel.modeId && mode.channels.indexOf(app.channel.uuid) !== -1;
  });

  if (channelUsedElsewhere) {
    // let user first choose if they want to edit all or a duplicate
    return;
  }

  // else duplicate makes no sense here -> continue directly
  this.chooseChannelEditMode('edit-all');
}

function chooseChannelEditMode(editMode) {
  this.channel.editMode = '';
  Vue.nextTick(function() {
    app.channel.editMode = editMode;
  });
}

function capabilitiesScroll(capabilityIndex) {
  var dialog = this.$refs.channelDialog.$el.querySelector('.dialog');
  console.log('scroll', dialog, capabilityIndex);
  Vue.nextTick(function() {
    dialog.scrollTop += dialog.querySelector('.capabilities li:nth-child(' + (capabilityIndex + 1) + ')').clientHeight;
  });
}

function saveChannel() {
  if (this.channel.editMode === 'create') {
    Vue.set(this.fixture.availableChannels, this.channel.uuid, utils.getSanitizedChannel(this.channel));
    this.currentMode.channels.push(this.channel.uuid);

    this.addFineChannels(this.channel, 1, true);
  }
  else if (this.channel.editMode === 'edit-all') {
    this.fixture.availableChannels[this.channel.uuid] = utils.getSanitizedChannel(this.channel);

    var maxFoundFineness = 0;
    for (var chId in this.fixture.availableChannels) {
      if (!Object.hasOwnProperty.call(this.fixture.availableChannels, chId)) {
        continue;
      }

      var fineChannel = this.fixture.availableChannels[chId];
      if ('coarseChannelId' in fineChannel && fineChannel.coarseChannelId === this.channel.uuid) {
        maxFoundFineness = Math.max(maxFoundFineness, fineChannel.fineness);
        if (fineChannel.fineness > this.channel.fineness) {
          this.removeChannel(chId);
        }
      }
    }

    this.addFineChannels(this.channel, maxFoundFineness + 1, false);
  }
  else if (this.channel.editMode === 'edit-duplicate') {
    var oldChannelKey = this.channel.uuid;

    var newChannelKey = uuidV4();
    var newChannel = utils.getSanitizedChannel(this.channel);
    newChannel.uuid = newChannelKey;
    Vue.set(this.fixture.availableChannels, newChannelKey, newChannel);

    this.addFineChannels(this.channel, 1, false);

    this.currentMode.channels = this.currentMode.channels.map(function(key) {
      if (key === oldChannelKey) {
        return newChannelKey;
      }
      return key;
    });
  }
  else if (this.channel.editMode === 'add-existing') {
    this.currentMode.channels.push(this.channel.uuid);
  }

  this.resetChannelForm();
}

/**
 * @param {!object} coarseChannel The channel object of the coarse channel.
 * @param {!number} offset At which fineness should be started.
 * @param {boolean} [addToMode] If true, the fine channel is pushed to the current mode's channels.
 */
function addFineChannels(coarseChannel, offset, addToMode) {
  for (var i = offset; i <= coarseChannel.fineness; i++) {
    var fineChannel = utils.getEmptyFineChannel(coarseChannel.uuid, i);
    Vue.set(this.fixture.availableChannels, fineChannel.uuid, utils.getSanitizedChannel(fineChannel));

    if (addToMode) {
      this.currentMode.channels.push(fineChannel.uuid);
    }
  }
}

/**
 * @param {!string} channelUuid The channel's uuid.
 * @param {?string} [modeUuid] The mode's uuid. If not supplied, remove channel everywhere.
 */
function removeChannel(channelUuid, modeUuid) {
  if (modeUuid) {
    // find mode
    var mode = this.fixture.modes.find(function(mode) {
      return mode.uuid === modeUuid;
    });

    // remove channel reference from mode
    mode.channels.splice(mode.channels.indexOf(channelUuid), 1);
    return;
  }

  // remove fine channels first
  for (var chId in this.fixture.availableChannels) {
    if (!Object.hasOwnProperty.call(this.fixture.availableChannels, chId)) {
      continue;
    }

    var channel = this.fixture.availableChannels[chId];
    if ('coarseChannelId' in channel && channel.coarseChannelId === channelUuid) {
      this.removeChannel(channel.uuid);
    }
  }

  // now remove all references from modes
  this.fixture.modes.forEach(function(mode) {
    app.removeChannel(channelUuid, mode.uuid);
  });

  // finally remove the channel itself
  delete this.fixture.availableChannels[channelUuid];
}

function resetChannelForm() {
  this.channel = utils.getEmptyChannel();
  Vue.nextTick(function() {
    app.$refs.channelForm.reset(); // resets browser validation status
  });
}

function autoSave(objectName) {
  if (!storageAvailable || !this.readyToAutoSave) {
    return;
  }

  if (objectName === 'fixture') {
    console.log('autoSave fixture:', JSON.parse(JSON.stringify(this.fixture, null, 2)));
  }
  else if (objectName === 'channel') {
    var channelChanged = Object.keys(this.channel).some(function(prop) {
      if (prop === 'uuid' || prop === 'editMode' || prop === 'modeId') {
        return false;
      }
      if (prop === 'capabilities') {
        return app.channel.capabilities.some(utils.isCapabilityChanged);
      }
      return app.channel[prop] !== '';
    });

    if (!channelChanged) {
      return;
    }

    console.log('autoSave channel:', JSON.parse(JSON.stringify(this.channel, null, 2)));
  }

  // use an array to be future-proof (maybe we want to support multiple browser tabs sometime)
  localStorage.setItem('autoSave', JSON.stringify([
    {
      fixture: this.fixture,
      channel: this.channel,
      timestamp: Date.now()
    }
  ]));
}

function clearAutoSave() {
  if (!storageAvailable) {
    return;
  }
  localStorage.removeItem('autoSave');
}

function restoreAutoSave() {
  if (!storageAvailable) {
    Vue._oflRestoreComplete = true;
    return;
  }

  try {
    this.restoredData = JSON.parse(localStorage.getItem('autoSave')).pop();

    if (this.restoredData === undefined) {
      throw new Error('this.restoredData is undefined.');
    }
  }
  catch (error) {
    this.readyToAutoSave = true;
    this.restoredData = '';
    return;
  }

  console.log('restore', JSON.parse(JSON.stringify(this.restoredData)));
}
function discardRestored() {
  // put all items except the last one back
  localStorage.setItem('autoSave', JSON.stringify(JSON.parse(localStorage.getItem('autoSave')).slice(0, -1)));

  this.restoredData = '';
  this.readyToAutoSave = true;
  Vue._oflRestoreComplete = true;
}
function applyRestored() {
  var restoredData = this.restoredData;

  // closes dialog
  this.restoredData = '';

  // restoring could open another dialog -> wait for DOM being up-to-date
  Vue.nextTick(function() {
    app.fixture = restoredData.fixture;
    app.channel = restoredData.channel;

    Vue.nextTick(function() {
      app.readyToAutoSave = true;
      Vue._oflRestoreComplete = true;
    });
  });
}

function submitFixture() {
  if (this.honeypot !== '') {
    alert('Do not fill the "Ignore" fields!');
    return;
  }

  this.submit.state = 'loading';

  sendObject.fixtures.push(this.fixture);

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    try {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 201) {
          var data = JSON.parse(xhr.responseText);

          if (!data.error) {
            app.submit.pullRequestUrl = data.pullRequestUrl;
            app.submit.state = 'success';
            app.clearAutoSave();
          }
          else {
            throw new Error(data.error);
          }
        }
        else {
          throw new Error('HTTP status not 201.');
        }
      }
    }
    catch (error) {
      console.error('There was a problem with the request. Error message: ' + error.message);
      app.submit.rawData += '\n\n' + error.message;
      app.submit.state = 'error';
    }
  };
  xhr.open('POST', '/ajax/add-fixtures');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(sendObject));

  this.submit.rawData = '```json\n' + JSON.stringify(sendObject, null, 2) + '\n```';
  console.log(this.submit.rawData);
}
