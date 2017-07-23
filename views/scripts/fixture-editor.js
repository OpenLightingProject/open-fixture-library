'use strict';

require('./polyfills.js');
var A11yDialog = require('a11y-dialog');
var uuidV4 = require('uuid/v4');
var Vue = require('vue/dist/vue');

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
    el.focus();
  }
});

Vue.component('a11y-dialog', {
  template: '#template-dialog',
  props: ['id', 'cancellable', 'shown'],
  watch: {
    shown: function() {
      this[this.shown ? 'show' : 'hide']();
    }
  },
  mounted: function() {
    var self = this;
    this.dialog = new A11yDialog(this.$el, '#header, #fixture-editor > form');
    this.dialog.on('show', function(node) {
      node.querySelector('h2').focus();
      self.$emit('show');
    });
    this.dialog.on('hide', function(node) {
      self.$emit('hide');
    });
  },
  methods: {
    show: function() {
      this.dialog.show();
    },
    hide: function() {
      this.dialog.hide();
    },
    overlayClick: function() {
      if (this.cancellable) {
        this.hide();
      }
    }
  }
});

Vue.component('physical-data', {
  template: '#template-physical',
  props: ['value'],
  computed: {
    dimensionRequired: function() {
      return this.value.dimensionsWidth !== '' || this.value.dimensionsHeight !== '' || this.value.dimensionsDepth !== '';
    },
    degreesRequired: function() {
      return this.value.lens.degreesMin !== '' || this.value.lens.degreesMax !== '';
    }
  },
  mounted: function() {
    this.$refs.firstInput.focus();
  }
});

Vue.component('fixture-mode', {
  template: '#template-mode',
  props: ['mode', 'fixture', 'channel'],
  mounted: function() {
    this.$refs.firstInput.focus();
  },
  methods: {
    getChannel: function(channelUuid) {
      return this.fixture.availableChannels[channelUuid];
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
      return app.isChannelNameUnique(channelUuid);
    }
  }
});

Vue.component('channel-capability', {
  template: '#template-capability',
  props: ['capability', 'capabilities'],
  data: function() {
    return {
      dmxMin: 0,
      dmxMax: 255
    };
  },
  computed: {
    isChanged: function() {
      return isCapabilityChanged(this.capability);
    },
    startMin: function() {
      var min = this.dmxMin;
      var index = this.capabilities.indexOf(this.capability) - 1;
      while (index >= 0) {
        var cap = this.capabilities[index];
        if (cap.end !== '') {
          min = cap.end + 1;
          break;
        }
        if (cap.start !== '') {
          min = cap.start + 1;
          break;
        }
        index--;
      }
      return min;
    },
    startMax: function() {
      return this.capability.end !== '' ? this.capability.end : this.endMax;
    },
    endMin: function() {
      return this.capability.start !== '' ? this.capability.start : this.startMin;
    },
    endMax: function() {
      var max = this.dmxMax;
      var index = this.capabilities.indexOf(this.capability) + 1;
      while (index < this.capabilities.length) {
        var cap = this.capabilities[index];
        if (cap.start !== '') {
          max = cap.start - 1;
          break;
        }
        if (cap.end !== '') {
          max = cap.end - 1;
          break;
        }
        index++;
      }
      return max;
    }
  },
  watch: {
    'capability.start': function() {
      var index = this.capabilities.indexOf(this.capability);
      var prevCap = this.capabilities[index - 1];

      if (typeof this.capability.start !== 'number') {
        if (!this.isChanged) {
          this.collapseWithNeighbors();
        }
        return;
      }

      if (prevCap) {
        if (isCapabilityChanged(prevCap)) {
          if (this.capability.start > this.startMin) {
            // add item before
            this.capabilities.splice(index, 0, getEmptyCapability());
            this.$emit('scroll-item-inserted', index);
          }
        }
        else if (this.capability.start <= this.startMin) {
          // remove previous item
          this.capabilities.splice(index - 1, 1);
        }
      }
      else if (this.capability.start > this.dmxMin) {
        // add item before
        this.capabilities.splice(index, 0, getEmptyCapability());
        this.$emit('scroll-item-inserted', index);
      }
    },
    'capability.end': function() {
      var index = this.capabilities.indexOf(this.capability);
      var nextCap = this.capabilities[index + 1];

      if (typeof this.capability.end !== 'number') {
        if (!this.isChanged) {
          this.collapseWithNeighbors();
        }
        return;
      }

      if (nextCap) {
        if (isCapabilityChanged(nextCap)) {
          if (this.capability.end < this.endMax) {
            // add item after
            this.capabilities.splice(index + 1, 0, getEmptyCapability());
          }
        }
        else if (this.capability.end >= this.endMax) {
          // remove next item
          this.capabilities.splice(index + 1, 1);
        }
      }
      else if (this.capability.end < this.dmxMax) {
        // add item after
        this.capabilities.splice(index + 1, 0, getEmptyCapability());
      }
    }
  },
  methods: {
    remove: function() {
      this.capability = getEmptyCapability();
      this.collapseWithNeighbors();
    },
    collapseWithNeighbors: function() {
      var index = this.capabilities.indexOf(this.capability);
      var prevCap = this.capabilities[index - 1];
      var nextCap = this.capabilities[index + 1];

      if (prevCap && !isCapabilityChanged(prevCap)) {
        if (nextCap && !isCapabilityChanged(nextCap)) {
          // remove previous and current item
          this.capabilities.splice(index - 1, 2);
        }
        else {
          // remove previous item
          this.capabilities.splice(index - 1, 1);
        }
      }
      else if (nextCap && !isCapabilityChanged(nextCap)) {
        // remove next item
        this.capabilities.splice(index + 1, 1);
      }
    }
  }
});

function getEmptyFixture() {
  return {
    key: '[new]',
    useExistingManufacturer: true,
    manufacturerShortName: '',
    newManufacturerName: '',
    newManufacturerShortName: '',
    newManufacturerWebsite: '',
    newManufacturerComment: '',
    name: '',
    shortName: '',
    categories: [],
    comment: '',
    manualURL: '',
    physical: getEmptyPhysical(),
    modes: [getEmptyMode()],
    metaAuthor: '',
    metaGithubUsername: '',
    availableChannels: {}
  };
}

function getEmptyPhysical() {
  return {
    dimensionsWidth: '',
    dimensionsHeight: '',
    dimensionsDepth: '',
    weight: '',
    power: '',
    DMXconnector: '',
    DMXconnectorNew: '',
    bulb: {
      type: '',
      colorTemperature: '',
      lumens: ''
    },
    lens: {
      name: '',
      degreesMin: '',
      degreesMax: ''
    },
    focus: {
      type: '',
      typeNew: '',
      panMax: '',
      tiltMax: ''
    }
  };
}

function getEmptyMode() {
  return {
    uuid: uuidV4(),
    name: '',
    shortName: '',
    enablePhysicalOverride: false,
    physical: getEmptyPhysical(),
    channels: []
  };
}

function getEmptyChannel() {
  return {
    uuid: uuidV4(),
    editMode: '',
    modeId: '',
    name: '',
    type: '',
    color: '',
    defaultValue: '',
    highlightValue: '',
    invert: '',
    constant: '',
    crossfade: '',
    precedence: '',
    capabilities: [getEmptyCapability()]
  };
}

function getEmptyCapability() {
  return {
    uuid: uuidV4(),
    start: '',
    end: '',
    name: '',
    color: '',
    color2: ''
  };
}

var app = window.app = new Vue({
  el: '#fixture-editor',
  data: {
    fixture: getEmptyFixture(),
    channel: getEmptyChannel(),
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
        return app.currentMode.channels.indexOf(channelUuid) === -1;
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
      this.fixture.modes.push(getEmptyMode());
    },
    switchManufacturer: switchManufacturer,
    onChannelDialogOpen: onChannelDialogOpen,
    onChannelDialogClose: onChannelDialogClose,
    onChooseChannelEditModeDialogOpen: onChooseChannelEditModeDialogOpen,
    chooseChannelEditMode: chooseChannelEditMode,
    capabilitiesScroll: capabilitiesScroll,
    resetChannelForm: resetChannelForm,
    saveChannel: saveChannel,
    autoSave: autoSave,
    clearAutoSave: clearAutoSave,
    discardRestored: discardRestored,
    applyRestored: applyRestored,
    submitFixture: submitFixture,
    isChannelNameUnique: function(channelUuid) {
      var chName = this.fixture.availableChannels[channelUuid].name;
      for (var channelKey in this.fixture.availableChannels) {
        var cmpName = this.fixture.availableChannels[channelKey].name;
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
      if (channel.hasOwnProperty(prop)) {
        this.channel[prop] = clone(channel[prop]);
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
    Vue.set(this.fixture.availableChannels, this.channel.uuid, getSanitizedChannel(this.channel));
    this.currentMode.channels.push(this.channel.uuid);
  }
  else if (this.channel.editMode === 'edit-all') {
    this.fixture.availableChannels[this.channel.uuid] = getSanitizedChannel(this.channel);
  }
  else if (this.channel.editMode === 'edit-duplicate') {
    var oldChannelKey = this.channel.uuid;

    var newChannelKey = uuidV4();
    var newChannel = getSanitizedChannel(this.channel);
    newChannel.uuid = newChannelKey;
    Vue.set(this.fixture.availableChannels, newChannelKey, newChannel);

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

function resetChannelForm() {
  this.channel = getEmptyChannel();
  Vue.nextTick(function() {
    app.$refs.channelForm.reset();  // resets browser validation status
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
        return app.channel.capabilities.some(isCapabilityChanged);
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

  console.log('restore', this.restoredData);
}
function discardRestored() {
  // put all items except the last one back
  localStorage.setItem('autoSave', JSON.stringify(JSON.parse(localStorage.getItem('autoSave')).slice(0, -1)));

  this.restoredData = '';
  this.readyToAutoSave = true;
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

  this.submit.rawData = '```\n' + JSON.stringify(sendObject, null, 2) + '\n```';
  console.log(this.submit.rawData);
}


// HELPER FUNCTIONS

function getSanitizedChannel(channel) {
  var retChannel = clone(channel);
  delete retChannel.editMode;
  delete retChannel.modeId;

  return retChannel;
}

function isCapabilityChanged(cap) {
  return Object.keys(cap).some(function(prop) {
    if (prop === 'uuid') {
      return false;
    }
    return cap[prop] !== '';
  });
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
