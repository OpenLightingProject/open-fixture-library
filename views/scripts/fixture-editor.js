'use strict';

require('./polyfills.js');
var Vue = require('vue/dist/vue.js');

var utils = require('./fixture-editor-utils.js');

Vue._oflRestoreComplete = false;

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
    readyToAutoSave: false,
    restoredData: ''
  },
  computed: {
    restoredDate: function() {
      if (this.restoredData === '') {
        return '';
      }
      return (new Date(this.restoredData.timestamp)).toLocaleString('en-US');
    }
  },
  mounted: restoreAutoSave,
  methods: {
    clearAutoSave: clearAutoSave,
    discardRestored: discardRestored,
    applyRestored: applyRestored
  }
});

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
