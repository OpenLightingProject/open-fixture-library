'use strict';

// modules
require('./polyfills');
var A11yDialog = require('a11y-dialog');
var properties = properties = require('../../fixtures/schema').properties;
var uuidV4 = require('uuid/v4');


// elements
var editorForm = document.getElementById('fixture-editor');
var manShortName = editorForm.querySelector('.manufacturer-shortName');
var newMan = editorForm.querySelector('.new-manufacturer');
var addModeLink = editorForm.querySelector('a.fixture-mode');
var submitButton = editorForm.querySelector('.save-fixture');
var channelForm = document.querySelector('#channel-dialog form');
var channelTypeSelect = document.querySelector('#channel-dialog .channel-type select');
var channelDialogScrollElement = document.querySelector('#channel-dialog .dialog');


// templates
var templatePhysical = document.getElementById('template-physical');
var templateMode = document.getElementById('template-mode');
var templateChannelLi = document.getElementById('template-channel-li');
var templateCapability = document.getElementById('template-capability');


var dialogs = {
  channel: 'channel-dialog',
  chooseChannelEditMode: 'choose-channel-edit-mode-dialog',
  restore: 'restore-dialog',
  submit: 'submit-dialog'
};


var out = {
  manufacturers: {},
  fixtures: {}
};

// could be handed over by importer / localStorage
var currentFixture = {
  availableChannels: {},
  modes: []
};
var currentChannel = {};


var storageAvailable;
var readyToAutoSave = false;
try {
  var x = '__storage_test__';
  localStorage.setItem(x, x);
  localStorage.removeItem(x);
  storageAvailable = true;
}
catch (e) {
  storageAvailable = false;
}


window.addEventListener('load', function() {
  initDialogs();

  window.onpopstate = function(event) {
    if (!event.state && dialogs.channel.shown) {
      dialogs.channel.hide();
    }
  };

  // enable toggling between existing and new manufacturer
  manShortName.querySelector('.add-manufacturer').addEventListener('click', toggleManufacturer);
  newMan.querySelector('.use-existing-manufacturer').addEventListener('click', toggleManufacturer);
  toggleManufacturer(null, true);

  // clone physical template into fixture
  injectPhysical(editorForm.querySelector('.physical'));

  bindValuesToObject(editorForm, currentFixture);

  addModeLink.addEventListener('click', addMode);
  addMode();  // every fixture has at least one mode

  // add channel editor submit
  bindValuesToObject(channelForm, currentChannel);
  channelForm.addEventListener('submit', function(event) {
    event.preventDefault();
    editChannel();
  });

  // enable channel color only if the channel type is SingleColor
  channelTypeSelect.addEventListener('change', updateChannelColorVisibility);

  restoreAutoSave();

  // enable submit button
  editorForm.addEventListener('submit', saveFixture);
  submitButton.disabled = false;
});

function initDialogs() {
  for (var key in dialogs) {
    dialogs[key] = new A11yDialog(document.getElementById(dialogs[key]));
    dialogs[key].on('show', function(node) {
      node.querySelector('h2').focus();
    });
  }


  // channel dialog
  initComboboxes(dialogs.channel.node);

  dialogs.channel.node.querySelector('.close').addEventListener('click', function(event) {
    event.preventDefault();
  });

  dialogs.channel.node.querySelector('.create-channel').addEventListener('click', function(event) {
    event.preventDefault();
    openChannelDialog('create');
  });

  dialogs.channel.on('show', function() {
    dialogs.channel.closingHandled = false;

    if ('pushState' in history) {
      history.pushState('channel-dialog', '');
    }
  });

  dialogs.channel.on('hide', function() {
    if ('pushState' in history && history.state === 'channel-dialog') {
      // return from the newly created state
      history.back();
    }

    if (dialogs.channel.closingHandled || !currentChannel.changed) {
      clear(currentChannel);
      channelForm.reset();
    }
    else if (currentChannel.editMode === 'add-existing' || window.confirm('Do you want to lose the entered channel data?')) {
      clear(currentChannel);
      channelForm.reset();
      autoSave();
    }
    else {
      dialogs.channel.show();  // closing was a mistake -> show it again
    }
  });


  // channel edit dialog
  dialogs.chooseChannelEditMode.node.querySelectorAll('button').forEach(function(button) {
    button.addEventListener('click', function() {
      dialogs.chooseChannelEditMode.hide();
      openChannelDialog(this.getAttribute('data-action'));
    });
  });


  // submit dialog
  dialogs.submit.setState = function(newState) {
    this.node.querySelectorAll('.state:not(.' + newState + ')').forEach(function(state) {
      setHidden(state, true);
    });
    setHidden(this.node.querySelector('.state.' + newState), false);
  };

  dialogs.submit.node.querySelectorAll('[data-action="home"]').forEach(function(button) {
    button.addEventListener('click', function() {
      location.href = '/';
    });
  });

  dialogs.submit.node.querySelector('[data-action="restart"]').addEventListener('click', function() {
    location.reload();
  });
}

function toggleManufacturer(event, init) {
  var toShow = manShortName;
  var toHide = newMan;
  var newState = true;

  if (!init) {
    if (!('useExistingManufacturer' in currentFixture) || currentFixture.useExistingManufacturer) {
      toShow = newMan;
      toHide = manShortName;
      newState = false;
    }

    currentFixture.useExistingManufacturer = newState;
    autoSave();
  }

  setHidden(toHide, true);
  toHide.querySelectorAll('select, input').forEach(function(element) {
    element.disabled = true;
  });

  setHidden(toShow, false);
  toShow.querySelectorAll('select, input').forEach(function(element, index) {
    element.disabled = false;
    if (index === 0) {
      element.focus();
    }
  });

  if (event) {
    event.preventDefault();
  }
}

function injectPhysical(container) {
  container.appendChild(document.importNode(templatePhysical.content, true));

  initComboboxes(container);
  fillTogether(container.querySelectorAll('.physical-dimensions input'));
  fillTogether(container.querySelectorAll('.physical-lens-degrees input'));
  initRangeInputs(container.querySelectorAll('.physical-lens-degrees input'));
}

function fillTogether(inputNodeList) {
  inputNodeList.forEach(function(input) {
    input.addEventListener('change', updateRequired);
  });
  updateRequired();

  function updateRequired() {
    var required = [].some.call(inputNodeList, function(input) {
      return input.value !== '';
    });

    inputNodeList.forEach(function(input) {
      input.required = required;
    });
  }
}

function initRangeInputs(inputNodeList) {
  inputNodeList[0].addEventListener('change', function() {
    updateRangeInputs(inputNodeList);
  });
  inputNodeList[1].addEventListener('change', function() {
    updateRangeInputs(inputNodeList);
  });
  inputNodeList[0].setAttribute('data-max', inputNodeList[0].max);
  inputNodeList[1].setAttribute('data-min', inputNodeList[1].min);

  updateRangeInputs(inputNodeList);
}
function updateRangeInputs(inputNodeList) {
  inputNodeList[1].min = (inputNodeList[0].value === '') ? inputNodeList[1].getAttribute('data-min') : inputNodeList[0].value;
  inputNodeList[0].max = (inputNodeList[1].value === '') ? inputNodeList[0].getAttribute('data-max') : inputNodeList[1].value;
}

function initComboboxes(container) {
  container.querySelectorAll('[data-allow-additions]').forEach(function(select) {
    select.addEventListener('change', function() {
      updateCombobox(this, true);
    });
  });
}
function updateCombobox(select, updateFocus) {
  var addValue = select.value === '[add-value]';
  select.nextElementSibling.disabled = !addValue;
  if (addValue && updateFocus) {
    select.nextElementSibling.focus();
  }
}

function bindValuesToObject(container, context) {
  container.querySelectorAll('select, input, textarea').forEach(function(element) {
    element.addEventListener('change', function() {
      var key = this.getAttribute('data-key');

      if (this.value !== '') {
        if (this.type === 'select-multiple') {
          context[key] = [];
          for (var i = 0; i < this.selectedOptions.length; i++) {
            context[key].push(this.selectedOptions[i].value);
          }
        }
        else if (this.type === 'checkbox') {
          context[key] = this.checked;
        }
        else if (this.type === 'number' && this.getAttribute('step') === 'any') {
          context[key] = parseFloat(this.value.replace(',', '.'));
        }
        else if (this.type === 'number') {
          context[key] = parseInt(this.value);
        }
        else if (this.className === 'boolean') {
          context[key] = this.value === 'true';
        }
        else {
          context[key] = this.value;
        }
      }
      else {
        delete context[key];
      }

      context.changed = true;

      autoSave();
    });
  });
}

function updateChannelColorVisibility() {
  var channelColor = channelForm.querySelector('.channel-color');
  var colorEnabled = channelTypeSelect.value === 'SingleColor';
  setHidden(channelColor, !colorEnabled);
  channelColor.querySelector('select').disabled = !colorEnabled;
}

function addMode(event) {
  var modeId = uuidV4();

  var newMode = document.importNode(templateMode.content, true).firstElementChild;
  newMode.setAttribute('data-uuid', modeId);
  editorForm.querySelector('.fixture-modes').insertBefore(newMode, addModeLink);

  var physicalOverride = newMode.querySelector('.physical-override');
  injectPhysical(physicalOverride);

  var usePhysicalOverride = newMode.querySelector('.enable-physical-override');
  usePhysicalOverride.addEventListener('change', function() {
    updatePhysicalOverrideVisibility(usePhysicalOverride, physicalOverride);
  });
  updatePhysicalOverrideVisibility(usePhysicalOverride, physicalOverride);

  var length = currentFixture.modes.push({
    uuid: modeId,
    channels: []
  });

  bindValuesToObject(newMode, currentFixture.modes[length - 1]);

  newMode.querySelector('.close').addEventListener('click', function(e) {
    e.preventDefault();
    removeUuidObjectFromArray(newMode.getAttribute('data-uuid'), currentFixture.modes);
    newMode.remove();

    autoSave();
  });

  newMode.querySelector('.add-channel').addEventListener('click', function(e) {
    e.preventDefault();
    currentChannel.modeIndex = getUuidObjectIndexInArray(newMode.getAttribute('data-uuid'), currentFixture.modes);
    openChannelDialog('add-existing');
  });

  if (event) {
    event.preventDefault();
    newMode.querySelector('.mode-name input').focus();
  }
}
function updatePhysicalOverrideVisibility(usePhysicalOverride, physicalOverride) {
  if (usePhysicalOverride.checked) {
    setHidden(physicalOverride, false);
    physicalOverride.querySelectorAll('select, input').forEach(function(element, index) {
      element.disabled = false;
      if (index === 0) {
        element.focus();
      }
    });
    physicalOverride.querySelectorAll('[data-allow-additions]').forEach(function(select) {
      updateCombobox(select, false);
    });
  }
  else {
    setHidden(physicalOverride, true);
    physicalOverride.querySelectorAll('select, input').forEach(function(element) {
      element.disabled = true;
    });
  }
}

function openChannelDialog(editMode) {
  currentChannel.editMode = editMode;

  if (editMode === 'add-existing') {
    var unchosenChannels = Object.keys(currentFixture.availableChannels).filter(function(key) {
      return currentFixture.modes[currentChannel.modeIndex].channels.indexOf(key) === -1;
    });

    if (unchosenChannels.length === 0) {
      currentChannel.editMode = editMode = 'create';
    }
    else {
      var options = '';
      unchosenChannels.forEach(function(key) {
        options += '<option value="' + key + '">' + key + '</option>';
      });
      dialogs.channel.node.querySelector('[data-key="key"]').innerHTML = options;
    }
  }

  dialogs.channel.node.querySelectorAll('[data-edit-modes]').forEach(function(element) {
    var hidden = element.getAttribute('data-edit-modes').indexOf(editMode) === -1;
    setHidden(element, hidden);

    element.querySelectorAll('[required]').forEach(function(input) {
      if (hidden) {
        input.disabled = true;
      }
      else if (input.className === 'addition') {
        updateCombobox(input.previousElementSibling, false);
      }
      else {
        input.disabled = false;
      }
    });
  });

  if ((editMode === 'edit-all' || editMode === 'edit-duplicate') && !('changed' in currentChannel)) {
    for (var key in currentFixture.availableChannels[currentChannel.key]) {
      currentChannel[key] = clone(currentFixture.availableChannels[currentChannel.key][key]);
    }

    if (!('name' in currentChannel)) {
      currentChannel.name = currentChannel.key;
    }

    prefillFormElements(dialogs.channel.node, currentChannel);
  }
  else if (editMode === 'create' || editMode === 'add-existing') {
    var modeName = '#' + (currentChannel.modeIndex + 1);

    if ('shortName' in currentFixture.modes[currentChannel.modeIndex]) {
      modeName = '"' + currentFixture.modes[currentChannel.modeIndex].shortName + '"';
    }
    else if ('name' in currentFixture.modes[currentChannel.modeIndex]) {
      modeName = '"' + currentFixture.modes[currentChannel.modeIndex].name + '"';
    }
    dialogs.channel.node.querySelector('.mode-name').textContent = modeName;
  }

  if (editMode !== 'add-existing') {
    updateChannelColorVisibility();

    var capabilitiesContainer = dialogs.channel.node.querySelector('.capabilities');
    capabilitiesContainer.innerHTML = '';  // it could be non-empty when the dialog was already opened before

    if ('capabilities' in currentChannel && currentChannel.capabilities.length > 0) {
      currentChannel.capabilities.forEach(function(cap, index) {
        var newCapItem = addCapabilityToUI(capabilitiesContainer, cap);
        setMinMax(newCapItem, getMinCapabilityBound(index), getMaxCapabilityBound(index));
      });
    }
    else {
      currentChannel.capabilities = [];
      addCapability(capabilitiesContainer);
    }
  }

  dialogs.channel.show();

  function addCapability(container, beforeElement) {
    var object = {};

    if (!beforeElement) {
      currentChannel.capabilities.push(object);
    }
    else {
      var index = getUuidObjectIndexInArray(beforeElement.getAttribute('data-uuid'), currentChannel.capabilities);
      currentChannel.capabilities.splice(index, 0, object);
    }

    return addCapabilityToUI(container, object, beforeElement);
  }
  function addCapabilityToUI(container, object, beforeElement) {
    var capabilityId = uuidV4();
    object.uuid = capabilityId;

    var capabilityItem = document.importNode(templateCapability.content, true).firstElementChild;
    capabilityItem.setAttribute('data-uuid', capabilityId);

    if (isChanged(object)) {
      capabilityItem.classList.add('changed');
    }

    bindValuesToObject(capabilityItem, object);
    prefillFormElements(capabilityItem, object);

    initRangeInputs(capabilityItem.querySelectorAll('[type="number"]'));
    fillTogether(capabilityItem.querySelectorAll('[type="number"], [data-key="name"]'));

    capabilityItem.querySelector('.remove').addEventListener('click', function(event) {
      event.preventDefault();

      var capItem = this.parentElement;
      var index = getUuidObjectIndexInArray(capItem.getAttribute('data-uuid'), currentChannel.capabilities);

      // reset capability
      capItem.querySelectorAll('input').forEach(function(input) {
        input.value = '';
        input.required = false;
        delete currentChannel.capabilities[index][input.getAttribute('data-key')];
      });
      updateRangeInputs(capItem.querySelectorAll('[type="number"]'));
      setHidden(capItem.querySelector('[data-key="color2"]'), true);
      capItem.classList.remove('changed');

      collapseEmptyCapabilityWithNeighbors(capItem);

      autoSave();
    });

    capabilityItem.querySelectorAll('input').forEach(function(input) {
      input.addEventListener('change', function(event) {
        // enable "cancel" confirmation
        currentChannel.changed = true;

        var capabilityItem = input.closest('li');
        var changed = [].some.call(capabilityItem.querySelectorAll('input'), function(input) {
          return input.value !== '';
        });
        capabilityItem.classList[changed ? 'add' : 'remove']('changed');

        if (!changed) {
          collapseEmptyCapabilityWithNeighbors(capabilityItem);
        }
      });
    });

    capabilityItem.querySelector('.start').addEventListener('change', function(event) {
      if (!this.checkValidity() || this.value === '') {
        // don't let invalid inputs change other field's min / max attributes
        return;
      }

      var index = getUuidObjectIndexInArray(this.parentElement.getAttribute('data-uuid'), currentChannel.capabilities);

      var previousCapabilityItem = this.parentElement.previousElementSibling;
      var value = parseInt(this.value);

      if (!previousCapabilityItem) {
        if (value === 0) {
          // do nothing
        }
        else {
          var newItem = addCapability(container, this.parentElement);
          setMinMax(newItem, 0, value - 1);
        }
      }
      else {
        if (!isChanged(previousCapabilityItem)) {
          if (value === getMinCapabilityBound(index)) {
            removeUuidObjectFromArray(previousCapabilityItem.getAttribute('data-uuid'), currentChannel.capabilities);
            previousCapabilityItem.remove();
          }
          else {
            setMinMax(previousCapabilityItem, null, value - 1);
          }
        }
        else {
          var min = getMinCapabilityBound(index);

          if (value === min) {
            setMinMax(previousCapabilityItem, null, value - 1);
          }
          else {
            var newItem = addCapability(container, this.parentElement);
            setMinMax(newItem, min, value - 1);

            channelDialogScrollElement.scrollTop += newItem.clientHeight;
          }
        }
      }
    });
    capabilityItem.querySelector('.end').addEventListener('change', function(event) {
      if (!this.checkValidity() || this.value === '') {
        // don't let invalid inputs change other field's min / max attributes
        return;
      }

      var index = getUuidObjectIndexInArray(this.parentElement.getAttribute('data-uuid'), currentChannel.capabilities);

      var nextCapabilityItem = this.parentElement.nextElementSibling;
      var value = parseInt(this.value);

      if (!nextCapabilityItem) {
        if (value === 255) {
          // do nothing
        }
        else {
          var newItem = addCapability(container);
          setMinMax(newItem, value + 1, 255);
        }
      }
      else {
        if (!isChanged(nextCapabilityItem)) {
          if (value === getMaxCapabilityBound(index)) {
            removeUuidObjectFromArray(nextCapabilityItem.getAttribute('data-uuid'), currentChannel.capabilities);
            nextCapabilityItem.remove();
          }
          else {
            setMinMax(nextCapabilityItem, value + 1, null);
          }
        }
        else {
          var max = getMaxCapabilityBound(index);

          if (value === max) {
            setMinMax(nextCapabilityItem, value + 1, null);
          }
          else {
            var newItem = addCapability(container, nextCapabilityItem);
            setMinMax(newItem, value + 1, max);
          }
        }
      }
    });

    capabilityItem.querySelector('[data-key="color"]').addEventListener('change', function(event) {
      setHidden(capabilityItem.querySelector('[data-key="color2"]'), this.value === '');
    });
    setHidden(capabilityItem.querySelector('[data-key="color2"]'), capabilityItem.querySelector('[data-key="color"]').value === '');

    if (beforeElement === undefined) {
      container.appendChild(capabilityItem);
    }
    else {
      container.insertBefore(capabilityItem, beforeElement);
    }

    return capabilityItem;
  }

  function isChanged(capability) {
    if (capability instanceof HTMLElement) {
      return capability.classList.contains('changed');
    }

    return Object.keys(capability).some(function(key) {
      return key !== 'uuid' && key !== 'changed';
    });
  }

  function setMinMax(capability, min, max) {
    if (typeof min === 'number') {
      capability.querySelector('.start').min = min;
    }
    if (typeof max === 'number') {
      capability.querySelector('.end').max = max;
    }
  }

  function getMinCapabilityBound(index) {
    index--;

    while (index >= 0) {
      if ('end' in currentChannel.capabilities[index]) {
        return currentChannel.capabilities[index].end + 1;
      }
      if ('start' in currentChannel.capabilities[index]) {
        return currentChannel.capabilities[index].start + 1;
      }
      index--;
    }

    return 0;
  }

  function getMaxCapabilityBound(index) {
    index++;

    while (index < currentChannel.capabilities.length) {
      if ('start' in currentChannel.capabilities[index]) {
        return currentChannel.capabilities[index].start - 1;
      }
      if ('end' in currentChannel.capabilities[index]) {
        return currentChannel.capabilities[index].end - 1;
      }
      index++;
    }

    return 255;
  }

  function collapseEmptyCapabilityWithNeighbors(capabilityItem) {
    var previousCapabilityItem = capabilityItem.previousElementSibling;
    var nextCapabilityItem = capabilityItem.nextElementSibling;

    if (previousCapabilityItem && !isChanged(previousCapabilityItem)) {
      setMinMax(capabilityItem, parseInt(previousCapabilityItem.querySelector('.start').min) || 0, null);
      removeUuidObjectFromArray(previousCapabilityItem.getAttribute('data-uuid'), currentChannel.capabilities);
      previousCapabilityItem.remove();
    }
    if (nextCapabilityItem && !isChanged(nextCapabilityItem)) {
      setMinMax(capabilityItem, null, parseInt(nextCapabilityItem.querySelector('.end').max) || 255);
      removeUuidObjectFromArray(nextCapabilityItem.getAttribute('data-uuid'), currentChannel.capabilities);
      nextCapabilityItem.remove();
    }
  }
}

function editChannel() {
  // browser validation has already caught the big mistakes

  var channelKey = currentChannel.key;
  var modeIndex = currentChannel.modeIndex;

  if (currentChannel.editMode === 'create') {
    channelKey = getKeyFromName(currentChannel.name, Object.keys(currentFixture.availableChannels));

    // update UI
    var modeElem = editorForm.querySelector('.fixture-modes > .fixture-mode:nth-child(' + (modeIndex + 1) + ')');
    createChannelLi(modeElem, channelKey, modeIndex);

    // update model
    currentFixture.modes[modeIndex].channels.push(channelKey);
  }
  else if (currentChannel.editMode === 'edit-all') {
    // update UI
    editorForm.querySelectorAll(':not(a).fixture-mode').forEach(function(modeElem) {
      var channelItem = modeElem.querySelector('.mode-channels > [data-channel-key="' + channelKey + '"]');
      channelItem.querySelector('.display-name').textContent = getChannelName();
    });
  }
  else if (currentChannel.editMode === 'edit-duplicate') {
    var oldChannelKey = channelKey;
    channelKey = getKeyFromName(currentChannel.name, Object.keys(currentFixture.availableChannels));

    // update UI
    var modeElem = editorForm.querySelector('.fixture-modes > .fixture-mode:nth-child(' + (currentChannel.modeIndex + 1) + ')');
    var channelItem = modeElem.querySelector('.mode-channels > [data-channel-key="' + oldChannelKey + '"]');
    channelItem.setAttribute('data-channel-key', channelKey);
    channelItem.querySelector('.display-name').textContent = getChannelName();

    // update model
    currentFixture.modes[modeIndex].channels = currentFixture.modes[modeIndex].channels.map(function(key) {
      if (key === oldChannelKey) {
        return channelKey;
      }
      return key;
    });
  }
  else if (currentChannel.editMode === 'add-existing') {
    // update UI
    var modeElem = editorForm.querySelector('.fixture-modes > .fixture-mode:nth-child(' + (modeIndex + 1) + ')');
    createChannelLi(modeElem, channelKey, modeIndex);

    // update model
    currentFixture.modes[modeIndex].channels.push(channelKey);
  }

  if (currentChannel.editMode !== 'add-existing') {
    // add or update current channel
    delete currentChannel.key;
    delete currentChannel.modeIndex;
    delete currentChannel.changed;
    delete currentChannel.editMode;

    if (channelKey === currentChannel.name) {
      delete currentChannel.name;
    }

    currentFixture.availableChannels[channelKey] = clone(currentChannel);
  }

  clear(currentChannel);
  autoSave();

  dialogs.channel.closingHandled = true;
  dialogs.channel.hide();

  function createChannelLi(modeElem, channelKey, modeIndex) {
    var channelItem = document.importNode(templateChannelLi.content, true).firstElementChild;
    channelItem.setAttribute('data-channel-key', channelKey);

    channelItem.querySelector('.edit').addEventListener('click', function(event) {
      event.preventDefault();
      currentChannel.key = channelItem.getAttribute('data-channel-key');
      currentChannel.modeIndex = modeIndex;

      var channelUsages = currentFixture.modes.filter(function(mode) {
        return mode.channels.indexOf(channelItem.getAttribute('data-channel-key')) !== -1;
      }).length;

      if (channelUsages > 1) {
        dialogs.chooseChannelEditMode.show();
      }
      else {
        openChannelDialog('edit-all');
      }
    });

    channelItem.querySelector('.remove').addEventListener('click', function(event) {
      event.preventDefault();

      var channels = currentFixture.modes[modeIndex].channels;
      channels.splice(channels.indexOf(channelItem.getAttribute('data-channel-key')), 1);
      channelItem.remove();

      autoSave();
    });

    channelItem.querySelector('.display-name').textContent = getChannelName();

    modeElem.querySelector('.mode-channels').appendChild(channelItem);
  }

  function getChannelName() {
    if ('name' in currentChannel) {
      return currentChannel.name;
    }

    if ('name' in currentFixture.availableChannels[channelKey]) {
      return currentFixture.availableChannels[channelKey].name;
    }

    return channelKey;
  }
}

function autoSave() {
  if (!storageAvailable || !readyToAutoSave) {
    return;
  }

  // use an array to be future-proof (maybe we want to support multiple browser tabs)
  localStorage.setItem('autoSave', JSON.stringify([
    {
      currentFixture: currentFixture,
      currentChannel: currentChannel,
      timestamp: Date.now()
    }
  ]));

  console.log('autoSave!', currentFixture, currentChannel);
}

function clearAutoSave() {
  if (!storageAvailable || !readyToAutoSave) {
    return;
  }

  // use an array to be future-proof (maybe we want to support multiple browser tabs)
  localStorage.removeItem('autoSave');
}

function restoreAutoSave() {
  if (!storageAvailable) {
    return;
  }

  var autoSaved = localStorage.getItem('autoSave');
  if (!autoSaved) {
    editorForm.reset();
    readyToAutoSave = true;
    return;
  }

  autoSaved = JSON.parse(autoSaved);
  if (autoSaved.length === 0) {
    editorForm.reset();
    readyToAutoSave = true;
    return;
  }

  var latestData = autoSaved.pop();
  console.log('restore', latestData);

  dialogs.restore.node.querySelector('time').textContent = (new Date(latestData.timestamp)).toLocaleString('en-US');

  dialogs.restore.node.querySelector('.restore').addEventListener('click', function() {
    dialogs.restore.hide();

    for (var key in latestData.currentFixture) {
      if (!(key in currentFixture)) {
        currentFixture[key] = latestData.currentFixture[key];
      }
    }

    currentFixture.availableChannels = clone(latestData.currentFixture.availableChannels);

    prefillFormElements(editorForm, latestData.currentFixture);
    updateRangeInputs(editorForm.querySelectorAll('.physical-lens-degrees input'));

    latestData.currentFixture.modes.forEach(function(mode, index) {
      if (index > 0) {
        addMode();
      }

      for (var key in mode) {
        if (!(key in currentFixture.modes[index])) {
          currentFixture.modes[index][key] = mode[key];
        }
      }

      var modeElem = editorForm.querySelector('.fixture-modes > .fixture-mode:nth-child(' + (index+1) + ')');
      prefillFormElements(modeElem, mode);
      updateRangeInputs(modeElem.querySelectorAll('.physical-lens-degrees input'));

      var physicalOverride = modeElem.querySelector('.physical-override');
      var usePhysicalOverride = modeElem.querySelector('.enable-physical-override');
      updatePhysicalOverrideVisibility(usePhysicalOverride, physicalOverride);

      mode.channels.forEach(function(channelKey) {
        for (var key in latestData.currentFixture.availableChannels[channelKey]) {
          currentChannel[key] = latestData.currentFixture.availableChannels[channelKey][key];
        }
        currentChannel.key = channelKey;
        currentChannel.modeIndex = index;
        currentChannel.editMode = 'add-existing';
        editChannel();
      });
    });

    if (latestData.currentFixture.useExistingManufacturer === false) {
      toggleManufacturer();
    }

    if (JSON.stringify(latestData.currentChannel) !== '{}') {
      for (var key in latestData.currentChannel) {
        currentChannel[key] = latestData.currentChannel[key];
      }
      prefillFormElements(dialogs.channel.node, currentChannel);
      openChannelDialog(currentChannel.editMode);
    }

    readyToAutoSave = true;
  });

  dialogs.restore.node.querySelector('.discard').addEventListener('click', function() {
    editorForm.reset();
    channelForm.reset();
    dialogs.restore.hide();

    // last element was popped before
    localStorage.setItem('autoSave', JSON.stringify(autoSaved));

    readyToAutoSave = true;
  });

  dialogs.restore.show();
}

function prefillFormElements(container, object) {
  for (var key in object) {
    var formElem = container.querySelector('[data-key="' + key + '"]');
    if (formElem) {
      if (formElem.type === 'select-multiple') {
        object[key].forEach(function(selectedOption) {
          formElem.querySelector('option[value="' + selectedOption + '"]').selected = true;
        });
      }
      else if (formElem.type === 'checkbox') {
        formElem.checked = object[key];
      }
      else {
        formElem.value = object[key];
      }

      if (formElem.matches('[data-allow-additions]')) {
        updateCombobox(formElem, false);
      }
    }
  }
}

function saveFixture(event) {
  // browser validation has already caught the big mistakes
  event.preventDefault();

  if (editorForm.querySelector('.honeypot input').value !== '') {
    alert('Do not fill the "Ignore" fields!');
    return;
  }

  submitButton.disabled = true;
  dialogs.submit.setState('loading');
  dialogs.submit.show();

  var manKey = currentFixture['manufacturer-shortName'];
  if (currentFixture.useExistingManufacturer === false) {
    manKey = currentFixture['new-manufacturer-shortName'];
    out.manufacturers[manKey] = {
      name: currentFixture['new-manufacturer-name']
    };

    if ('new-manufacturer-comment' in currentFixture) {
      out.manufacturers[manKey].comment = currentFixture['new-manufacturer-comment'];
    }

    if ('new-manufacturer-website' in currentFixture) {
      out.manufacturers[manKey].website = currentFixture['new-manufacturer-website'];
    }
  }

  var otherFixtureKeys = [];
  for (var fKey in out.fixtures) {
    if (fKey.indexOf(manKey) === 0) {
      otherFixtureKeys.push(fKey.slice(manKey.length + 1));
    }
  }

  var fixKey = manKey + '/' + getKeyFromName(currentFixture.name, otherFixtureKeys, true);

  out.fixtures[fixKey] = {};
  for (var key in properties.fixture) {
    if (key === 'physical') {
      savePhysical(out.fixtures[fixKey], currentFixture);
    }
    else if (key === 'meta') {
      var now = (new Date()).toISOString().replace(/T.*/, '');

      out.fixtures[fixKey].meta = {
        authors: [currentFixture['meta-author']],
        createDate: now,
        lastModifyDate: now
      };
    }
    else if (key === 'availableChannels') {
      out.fixtures[fixKey].availableChannels = {};
      for (var channelKey in currentFixture.availableChannels) {
        out.fixtures[fixKey].availableChannels[channelKey] = {};
        saveChannel(out.fixtures[fixKey].availableChannels[channelKey], currentFixture.availableChannels[channelKey]);
      }
    }
    else if (key === 'modes') {
      out.fixtures[fixKey].modes = [];
      currentFixture.modes.forEach(function(mode) {
        var modeNumber = out.fixtures[fixKey].modes.push({});
        saveMode(out.fixtures[fixKey].modes[modeNumber - 1], mode);
      });
    }
    else if (key in currentFixture) {
      out.fixtures[fixKey][key] = currentFixture[key];
    }
  }

  if ('meta-github-username' in currentFixture) {
    out.submitter = currentFixture['meta-github-username'];
  }

  var sendObject = {
    out: out
  };

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    try {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 201) {
          var data = JSON.parse(xhr.responseText);

          if (!data.error) {
            dialogs.submit.node.querySelector('.pull-request-url').href = data.pullRequestUrl;
            dialogs.submit.setState('success');
            clearAutoSave();
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
      dialogs.submit.node.querySelector('.error pre').textContent = JSON.stringify(out, null, 2) + '\n\n' + error.message;
      dialogs.submit.setState('error');
    }
  };
  xhr.open('POST', '/ajax/add-fixtures');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(sendObject));

  console.log(JSON.stringify(out, null, 2));

  function savePhysical(to, from) {
    to.physical = {};

    for (var key in properties.physical) {
      if (key === 'dimensions' && 'physical-dimensions-width' in from) {
        to.physical.dimensions = [
          from['physical-dimensions-width'],
          from['physical-dimensions-height'],
          from['physical-dimensions-depth']
        ];
      }
      else if ('type' in properties.physical[key] && properties.physical[key].type === 'object') {
        to.physical[key] = {};

        for (var subKey in properties.physical[key].properties) {
          if (subKey === 'degreesMinMax' && 'physical-lens-degrees-min' in from) {
            to.physical.lens.degreesMinMax = [
              from['physical-lens-degrees-min'],
              from['physical-lens-degrees-max']
            ];
          }
          else if ('physical-' + key + '-' + subKey in from) {
            to.physical[key][subKey] = getCurrentFixtureValue('physical-' + key + '-' + subKey, from);
          }
        }

        if (JSON.stringify(to.physical[key]) === '{}') {
          delete to.physical[key];
        }
      }
      else if ('physical-' + key in from) {
        to.physical[key] = getCurrentFixtureValue('physical-' + key, from);
      }
    }

    if (JSON.stringify(to.physical) === '{}') {
      delete to.physical;
    }
  }

  function saveChannel(to, from) {
    for (var key in properties.channel) {
      if (key === 'capabilities') {
        to.capabilities = [];

        from.capabilities.forEach(function(cap) {
          if (!('start' in cap)) {
            return;
          }

          var capability = {
            range: [cap.start, cap.end]
          };

          for (var key in properties.capability) {
            if (key in cap) {
              capability[key] = cap[key];
            }
          }

          to.capabilities.push(capability);
        });

        if (to.capabilities.length === 0) {
          delete to.capabilities;
        }
      }
      else if (key in from) {
        to[key] = from[key];
      }
    }
  }

  function saveMode(to, from) {
    for (var key in properties.mode) {
      if (key === 'physical') {
        savePhysical(to, from);
      }
      else if (key in from) {
        to[key] = from[key];
      }
    }
  }

  function getCurrentFixtureValue(key, from) {
    return from[key] === '[add-value]' && key + '-new' in from ? from[key + '-new'] : from[key];
  }
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

function getUuidObjectIndexInArray(uuid, array) {
  var index = array.findIndex(function(element) {
    return 'uuid' in element && element.uuid === uuid;
  });

  if (index === -1) {
    throw new Error('uuid "' + uuid + '" was not found in array');
  }

  return index;
}

function removeUuidObjectFromArray(uuid, array) {
  array.splice(getUuidObjectIndexInArray(uuid, array), 1);
}

function clear(obj) {
  for (var key in obj) {
    delete obj[key];
  }
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// dumb bug in Edge
function setHidden(element, hidden) {
  element.style.display = hidden ? 'none' : '';
}