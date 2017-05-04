'use strict';

require('./polyfills');
var A11yDialog = require('a11y-dialog');
var Vue = require('vue/dist/vue');
var uuidV4 = require('uuid/v4');

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
      return this.value.lensDegreesMin !== '' || this.value.lensDegreesMax !== '';
    }
  }
});

Vue.component('fixture-mode', {
  template: '#template-mode',
  props: ['mode', 'fixture', 'channel'],
  methods: {
    getChannelName: function(chKey) {
      var channel = this.fixture.availableChannels[chKey];
      return channel.name;
    },
    editChannel: function(chKey) {
      this.channel.modeId = this.mode.uuid;
      this.channel.editMode = 'edit-?';
      this.channel.key = chKey;
      this.$emit('open-channel-dialog');
    },
    addChannel: function() {
      this.channel.modeId = this.mode.uuid;
      this.channel.editMode = 'add-existing';
      this.$emit('open-channel-dialog');
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

      if (prevCap) {
        if (isCapabilityChanged(prevCap)) {
          if (this.capability.start > this.startMin) {
            // add item before
            this.capabilities.splice(index, 0, getEmptyCapability());
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
      }
    },
    'capability.end': function() {
      var index = this.capabilities.indexOf(this.capability);
      var nextCap = this.capabilities[index + 1];

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
  }
});

function getEmptyFixture() {
  return {
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
    bulbType: '',
    bulbColorTemperature: '',
    bulbLumens: '',
    lensName: '',
    lensDegreesMin: '',
    lensDegreesMax: '',
    focusType: '',
    focusTypeNew: '',
    focusPanMax: '',
    focusTiltMax: ''
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
    key: '',
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
    honeypot: '',
    readyToAutoSave: false,
    openDialogs: {
      channel: false,
      chooseChannelEditMode: false,
      restore: false,
      submit: false
    }
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
      return Object.keys(this.fixture.availableChannels).filter(function(chKey) {
        return app.currentMode.channels.indexOf(chKey) === -1;
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
    }
  },
  watch: {
    fixture: {
      handler: function() {
        this.autoSave();
      },
      deep: true
    },
    channel: {
      handler: function() {
        this.autoSave();
        this.channelChanged = true;
      },
      deep: true
    }
  },
  mounted: function() {
    this.readyToAutoSave = true;
  },
  methods: {
    newManufacturer: function() {
      this.fixture.useExistingManufacturer = false;
    },
    existingManufacturer: function() {
      this.fixture.useExistingManufacturer = true;
    },
    addNewMode: function() {
      this.fixture.modes.push(getEmptyMode());
    },
    openChannelDialog: openChannelDialog,
    onChannelDialogClose: onChannelDialogClose,
    resetChannelForm: resetChannelForm,
    saveChannel: saveChannel,
    autoSave: autoSave,
    saveFixture: saveFixture
  }
});

function openChannelDialog(editMode) {
  this.openDialogs.chooseChannelEditMode = false;

  if (editMode) {
    this.channel.editMode = editMode;
  }

  if (this.channel.editMode === 'edit-?') {
    this.openDialogs.chooseChannelEditMode = true;
    return;
  }

  if (this.channel.editMode === 'add-existing' && this.currentModeUnchosenChannels.length === 0) {
    this.channel.editMode = 'create';
  }
  else if (this.channel.editMode === 'edit-all' || this.channel.editMode === 'edit-duplicate') {
    var channel = this.fixture.availableChannels[this.channel.key];
    for (var prop in channel) {
      if (channel.hasOwnProperty(prop)) {
        this.channel[prop] = clone(channel[prop]);
      }
    }
  }

  // open channel dialog after next DOM update to prevent focus confusion when chooseChannelEditMode dialog is still open
  Vue.nextTick(function() {
    app.channelChanged = false;
    app.openDialogs.channel = true;
  });
}

function onChannelDialogClose() {
  this.openDialogs.channel = false;

  if (this.channel.editMode === '') {
    // saving did already manage everything
    return;
  }

  if (this.channelChanged && !window.confirm('Do you want to lose the entered channel data?')) {
    Vue.nextTick(function() {
      app.openDialogs.channel = true;
    });
    return;
  }

  this.resetChannelForm();
}

function saveChannel() {
  if (this.channel.editMode === 'create') {
    var channelKey = getKeyFromName(this.channel.name, Object.keys(this.fixture.availableChannels));

    Vue.set(this.fixture.availableChannels, channelKey, getSanitizedChannel(this.channel));
    this.currentMode.channels.push(channelKey);
  }
  else if (this.channel.editMode === 'edit-all') {
    this.fixture.availableChannels[this.channel.key] = getSanitizedChannel(this.channel);
  }
  else if (this.channel.editMode === 'edit-duplicate') {
    var oldChannelKey = this.channel.key;

    var newChannelKey = getKeyFromName(this.channel.name, Object.keys(this.fixture.availableChannels));
    Vue.set(this.fixture.availableChannels, newChannelKey, getSanitizedChannel(this.channel));

    this.currentMode.channels = this.currentMode.channels.map(function(key) {
      if (key === oldChannelKey) {
        return newChannelKey;
      }
      return key;
    });
  }
  else if (this.channel.editMode === 'add-existing') {
    this.currentMode.channels.push(this.channel.key);
  }

  this.openDialogs.channel = false;
  this.resetChannelForm();
}

function resetChannelForm() {
  this.channel = getEmptyChannel();
  Vue.nextTick(function() {
    app.$refs.channelForm.reset();  // resets browser validation status
  });
}

function autoSave() {
  console.log('autoSave!', ' fixture:', JSON.parse(JSON.stringify(this.fixture, null, 2)), ' channel:', JSON.parse(JSON.stringify(this.channel, null, 2)));
}

function saveFixture() {
  if (this.honeypot) {
    alert('Do not fill the "Ignore" fields!');
    return;
  }
  console.log(this.fixture);
}


function getKeyFromName(name, uniqueInList, forceSanitize) {
  if (forceSanitize) {
    name = sanitize(name);
  }

  if (!uniqueInList) {
    return name;
  }

  var sanitizeRegex = forceSanitize ? '' : '|^' + sanitize(name) + '(?:\-\d+)?$';
  var nameRegexp = new RegExp('^' + name + '(?:\s+\d+)?' + sanitizeRegex +'$', 'i');
  var occurences = uniqueInList.filter(function(value) {
    return nameRegexp.test(value);
  }).length;

  if (occurences === 0) {
    return name;
  }

  return sanitize(name) + '-' + (occurences + 1);

  function sanitize(val) {
    return val.toLowerCase().replace(/[^a-z0-9\-]+/g, '-');
  }
}

function getSanitizedChannel(channel) {
  var retChannel = {};
  for (var prop in channel) {
    if (channel.hasOwnProperty(prop) && prop !== 'key' && prop !== 'editMode' && prop !== 'modeId') {
      retChannel[prop] = clone(channel[prop]);
    }
  }
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