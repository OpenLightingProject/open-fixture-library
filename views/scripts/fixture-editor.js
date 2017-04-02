'use strict';

// modules
var A11yDialog = require('a11y-dialog');
var properties = properties = require('../../fixtures/schema').properties;


// elements
var editorForm = document.getElementById('fixture-editor');
var manShortName = document.querySelector('.manufacturer-shortName');
var addManLink = manShortName.querySelector('.add-manufacturer');
var newMan = document.querySelector('.new-manufacturer');
var useExistingManLink = newMan.querySelector('.use-existing-manufacturer');
var physical = document.querySelector('.physical');
var modesContainer = document.querySelector('.fixture-modes');
var addModeLink = document.querySelector('a.fixture-mode');
var channelForm;
var channelTypeSelect;


// templates
var templatePhysical = document.getElementById('template-physical');
var templateMode = document.getElementById('template-mode');


var dialogs = {
  'add-channel-to-mode': null,
  'channel-dialog': null,
};
var dialogOpener = null;
var dialogClosingHandled = false;


var out = {
  manufacturers: {},
  fixtures: {},
  warnings: {},
  errors: {}
};

// could be handed over by importer / localStorage
var currentFixture = {
  availableChannels: {},
  modes: []
};
var currentChannel = {};


window.addEventListener('load', function() {
  // initialize dialogs
  for (var key in dialogs) {
    var dialogElement = document.getElementById(key)
    dialogs[key] = new A11yDialog(dialogElement);
    initComboboxes(dialogElement);
    dialogElement.querySelector('.close').addEventListener('click', function(event) {
      event.preventDefault();
    });
  }
  dialogs['channel-dialog'].on('hide', function() {
    if (!dialogClosingHandled) {
      if (JSON.stringify(currentChannel) != '{}' && !window.confirm('Do you want to lose the entered channel data?')) {
        dialogs['channel-dialog'].show();
        return false;
      }
    }

    channelForm.reset();
    updateChannelColorVisibility();

    // clear currentChannel (resetting to {} would remove bindings)
    for (var key in currentChannel) {
      delete currentChannel[key];
    }
  });

  // enable toggling between existing and new manufacturer
  addManLink.addEventListener('click', toggleManufacturer);
  useExistingManLink.addEventListener('click', toggleManufacturer);
  toggleManufacturer();

  // clone physical template into fixture
  physical.appendChild(document.importNode(templatePhysical.content, true));

  initComboboxes(editorForm);
  bindValuesToObject(editorForm, currentFixture);

  addModeLink.addEventListener('click', addMode);
  addMode();  // every fixture has at least one mode

  // add channel editor submit
  channelForm = document.querySelector('#channel-dialog form');
  bindValuesToObject(channelForm, currentChannel);
  channelForm.addEventListener('submit', addChannel);

  // enable channel color only if the channel type is SingleColor
  channelTypeSelect = document.querySelector('#channel-dialog .channel-type select');
  channelTypeSelect.addEventListener('change', updateChannelColorVisibility);
  updateChannelColorVisibility();

  // enable submit button
  editorForm.addEventListener('submit', saveFixture);
  editorForm.querySelector('.save-fixture').disabled = false;
});


function toggleManufacturer(event) {
  var toShow = manShortName;
  var toHide = newMan;
  var newState = true;

  if (newMan.hidden) {
    toShow = newMan;
    toHide = manShortName;
    newState = false;
  }

  currentFixture.useExistingManufacturer = newState;
  autoSave();

  toHide.hidden = true;
  [].forEach.call(toHide.querySelectorAll('select, input'), function(element) {
    element.disabled = true;
  });

  toShow.hidden = false;
  [].forEach.call(toShow.querySelectorAll('select, input'), function(element, index) {
    element.disabled = false;
    if (index == 0) {
      element.focus();
    }
  });

  if (event) {
    event.preventDefault();
  }
}

function initComboboxes(container) {
  [].forEach.call(container.querySelectorAll('[data-allow-additions]'), function(select) {
    select.addEventListener('change', function() {
      updateCombobox(this, true);
    });
  });
}
function updateCombobox(select, updateFocus) {
  var addValue = select.value == '[add-value]';
  select.nextElementSibling.disabled = !addValue;
  if (addValue && updateFocus) {
    select.nextElementSibling.focus();
  }
}

function bindValuesToObject(container, context) {
  [].forEach.call(container.querySelectorAll('select, input, textarea'), function(element) {
    element.addEventListener('change', function() {
      var key = this.getAttribute('data-key');

      if (this.value != '') {
        if (this.type == 'select-multiple') {
          context[key] = [];
          for (var i = 0; i < this.selectedOptions.length; i++) {
            context[key].push(this.selectedOptions[i].value);
          }
        }
        else if (this.type == 'number') {
          context[key] = this.valueAsNumber;
        }
        else {
          context[key] = this.value;
        }
      }
      else {
        delete context[key];
      }

      autoSave();
    });
  });
}

function updateChannelColorVisibility(event) {
  var channelColor = channelForm.querySelector('.channel-color');
  var colorEnabled = channelTypeSelect.value == 'SingleColor';
  channelColor.hidden = !colorEnabled;
  channelColor.querySelector('select').disabled = !colorEnabled;
}

function addMode(event) {
  var newMode = document.importNode(templateMode.content, true);
  modesContainer.insertBefore(newMode, addModeLink);
  newMode = addModeLink.previousSibling;

  var removeModeButton = newMode.querySelector('.close');
  removeModeButton.addEventListener('click', function(e) {
    e.preventDefault();
    newMode.remove();
  });

  var physicalOverride = newMode.querySelector('.physical-override');
  physicalOverride.appendChild(document.importNode(templatePhysical.content, true));
  initComboboxes(physicalOverride);

  var usePhysicalOverride = newMode.querySelector('.enable-physical-override');
  usePhysicalOverride.addEventListener('change', function() {
    togglePhysicalOverride(usePhysicalOverride, physicalOverride);
  });
  togglePhysicalOverride(usePhysicalOverride, physicalOverride);

  var openChannelDialogLink = newMode.querySelector('a.show-dialog');
  openChannelDialogLink.addEventListener('click', openDialogFromLink);

  var modeCount = currentFixture.modes.push({
    channels: []
  });
  bindValuesToObject(newMode, currentFixture.modes[modeCount - 1]);
  autoSave();

  if (event) {
    event.preventDefault();
    newMode.querySelector('.mode-name input').focus();
  }
}
function togglePhysicalOverride(usePhysicalOverride, physicalOverride) {
  if (usePhysicalOverride.checked) {
    physicalOverride.hidden = false;
    [].forEach.call(physicalOverride.querySelectorAll('select, input'), function(element, index) {
      element.disabled = false;
      if (index == 0) {
        element.focus();
      }
    });
    [].forEach.call(physicalOverride.querySelectorAll('[data-allow-additions]'), function(select) {
      updateCombobox(select, false);
    });
  }
  else {
    physicalOverride.hidden = true;
    [].forEach.call(physicalOverride.querySelectorAll('select, input'), function(element) {
      element.disabled = true;
    });
  }
}

function addChannel(event) {
  // browser validation has already caught the big mistakes

  event.preventDefault();

  var channelKey = getKeyFromName(currentChannel.name, Object.keys(currentFixture.availableChannels));

  var newChannelItem = document.createElement('li');
  newChannelItem.textContent = ('name' in currentChannel) ? currentChannel.name : channelKey;
  dialogOpener.previousElementSibling.appendChild(newChannelItem);

  var currentMode = dialogOpener.parentNode;
  var allModes = Array.prototype.slice.call(currentMode.parentNode.children);
  var modeNumber = allModes.indexOf(currentMode);

  currentFixture.modes[modeNumber].channels.push(channelKey);
  currentFixture.availableChannels[channelKey] = JSON.parse(JSON.stringify(currentChannel));
  autoSave();

  dialogClosingHandled = true;
  closeDialog();
}

function openDialogFromLink(event) {
  event.preventDefault();

  dialogOpener = event.target;
  dialogClosingHandled = false;
  var key = event.target.getAttribute('href').slice(1);
  dialogs[key].show();
}
function closeDialog() {
  var key = dialogOpener.getAttribute('href').slice(1);
  dialogs[key].hide();
  dialogOpener = null;
}


function autoSave() {
  console.log(currentFixture, currentChannel);
}

function saveFixture(event) {
  // browser validation has already caught the big mistakes

  event.preventDefault();

  var manKey = currentFixture['manufacturer-shortName'];
  if (!currentFixture.useExistingManufacturer) {
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
  for (var key in out.fixtures) {
    if (key.indexOf(manKey) == 0) {
      otherFixtureKeys.push(key.slice(manKey.length + 1));
    }
  }

  var fixKey = manKey + '/' + getKeyFromName(currentFixture.name, otherFixtureKeys);

  out.fixtures[fixKey] = {};
  for (var key in properties.fixture) {
    if (key == 'physical') {
      savePhysical(out.fixtures[fixKey], currentFixture);
    }
    else if (key == 'meta') {
      var now = (new Date()).toISOString().replace(/T.*/, '');

      out.fixtures[fixKey].meta = {
        authors: [currentFixture['meta-author']],
        createDate: now,
        lastModifyDate: now
      };
    }
    else if (key == 'availableChannels') {
      out.fixtures[fixKey].availableChannels = {};
      for (var channelKey in currentFixture.availableChannels) {
        out.fixtures[fixKey].availableChannels[channelKey] = {};
        saveChannel(out.fixtures[fixKey].availableChannels[channelKey], currentFixture.availableChannels[channelKey]);
      }
    }
    else if (key == 'modes') {
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

  console.log(JSON.stringify(out, null, 2));
}

function savePhysical(to, from) {
  to.physical = {};

  for (var key in properties.physical) {
    if (key == 'dimensions' && 'physical-dimensions-width' in from) {
      to.physical.dimensions = [
        from['physical-dimensions-width'],
        from['physical-dimensions-height'],
        from['physical-dimensions-depth']
      ];
    }
    else if ('type' in properties.physical[key] && properties.physical[key].type == 'object') {
      to.physical[key] = {};

      for (var subKey in properties.physical[key].properties) {
        if (subKey == 'degreesMinMax' && 'physical-lens-degrees-min' in from) {
          to.physical.lens.degreesMinMax = [
            from['physical-lens-degrees-min'],
            from['physical-lens-degrees-max']
          ];
        }
        else if ('physical-' + key + '-' + subKey in from) {
          to.physical[key][subKey] = getCurrentFixtureValue('physical-' + key + '-' + subKey, from);
        }
      }

      if (JSON.stringify(to.physical[key]) == '{}') {
        delete to.physical[key];
      }
    }
    else if ('physical-' + key in from) {
      to.physical[key] = getCurrentFixtureValue('physical-' + key, from);
    }
  }

  if (JSON.stringify(to.physical) == '{}') {
    delete to.physical;
  }
}

function saveChannel(to, from) {
  for (var key in properties.channel) {
    if (key in from) {
      to[key] = from[key];
    }
  }
}

function saveMode(to, from) {
  for (var key in properties.mode) {
    if (key == 'physical') {
      savePhysical(to, from);
    }
    else if (key in from) {
      to[key] = from[key];
    }
  }
}

function getCurrentFixtureValue(key, from) {
  return from[key] == '[add-value]' && key + '-new' in from ? from[key + '-new'] : from[key];
}

function getKeyFromName(name, uniqueInList) {
  name = name.toLowerCase().replace(/[^a-z0-9\-]+/g, '-');

  if (!uniqueInList) {
    return name;
  }

  var nameRegexp = new RegExp('^' + name + '(?:\s+\d+)?$');
  var occurences = uniqueInList.reduce(function(acc, value) {
    if (nameRegexp.test(value)) {
      return acc + 1;
    }
    return acc;
  }, 0);

  if (occurences == 0) {
    return name;
  }

  return name + '-' + (occurences + 1);
}