'use strict';

// modules
var A11yDialog = require('a11y-dialog');


// elements
var editorForm = document.getElementById('fixture-editor');
var manShortName = document.querySelector('.manufacturer-shortName');
var addManLink = manShortName.querySelector('.add-manufacturer');
var newMan = document.querySelector('.new-manufacturer');
var useExistingManLink = newMan.querySelector('.use-existing-manufacturer');
var physical = document.querySelector('.physical');
var modesContainer = document.querySelector('.fixture-modes');
var addModeLink = document.querySelector('a.fixture-mode');
var channelEditor;
var channelTypeSelect;


// templates
var templatePhysical = document.getElementById('template-physical');
var templateMode = document.getElementById('template-mode');


var dialogs = {
  'add-channel-to-mode': null,
  'channel-editor': null,
};
var dialogOpener = null;
var dialogClosingHandled = false;


window.addEventListener('load', function() {
  // initialize dialogs
  for (var key in dialogs) {
    var dialogElement = document.getElementById(key)
    dialogs[key] = new A11yDialog(dialogElement);
    addComboboxEventListeners(dialogElement);
  }
  dialogs['channel-editor'].on('hide', function() {
    if (!dialogClosingHandled) {
      var chData = getChannelFromEditor();
      if (JSON.stringify(chData) != '{}' && !window.confirm('Do you want to lose the entered channel data?')) {
        dialogs['channel-editor'].show();
        return false;
      }
    }

    channelEditor.reset();
    updateChannelColorVisibility();
  });

  // enable toggling between existing and new manufacturer
  addManLink.addEventListener('click', toggleManufacturer);
  useExistingManLink.addEventListener('click', toggleManufacturer);
  toggleManufacturer();

  // clone physical template into fixture
  physical.appendChild(document.importNode(templatePhysical.content, true));

  addComboboxEventListeners(editorForm);

  addModeLink.addEventListener('click', addMode);
  addMode();  // every fixture has at least one mode

  // add channel editor submit
  channelEditor = document.querySelector('#channel-editor form');
  channelEditor.addEventListener('submit', addChannel);

  // enable channel color only if the channel type is SingleColor
  channelTypeSelect = document.querySelector('#channel-editor .channel-type select');
  channelTypeSelect.addEventListener('change', updateChannelColorVisibility);
  updateChannelColorVisibility();

  // enable submit button
  editorForm.querySelector('.save-fixture').disabled = false;
});


function toggleManufacturer(event) {
  var toShow = manShortName;
  var toHide = newMan;

  if (newMan.hidden) {
    toShow = newMan;
    toHide = manShortName;
  }

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

function addComboboxEventListeners(element) {
  [].forEach.call(element.querySelectorAll('[data-allow-additions]'), function(select) {
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

function updateChannelColorVisibility(event) {
  var channelColor = document.querySelector('#channel-editor .channel-color');
  var colorEnabled = channelTypeSelect.value == 'SingleColor';
  channelColor.hidden = !colorEnabled;
  channelColor.querySelector('select').disabled = !colorEnabled;
}

function addMode(event) {
  var newMode = document.importNode(templateMode.content, true);
  modesContainer.insertBefore(
    newMode,
    addModeLink
  );
  newMode = addModeLink.previousSibling;

  var removeModeButton = newMode.querySelector('.close');
  removeModeButton.addEventListener('click', function(e) {
    e.preventDefault();
    newMode.remove();
  });

  var physicalOverride = newMode.querySelector('.physical-override');
  physicalOverride.appendChild(document.importNode(templatePhysical.content, true));
  addComboboxEventListeners(physicalOverride);

  var usePhysicalOverride = newMode.querySelector('.use-physical-override');
  usePhysicalOverride.addEventListener('change', function() {
    togglePhysicalOverride(usePhysicalOverride, physicalOverride);
  });
  togglePhysicalOverride(usePhysicalOverride, physicalOverride);

  var openChannelDialogLink = newMode.querySelector('a.show-dialog');
  openChannelDialogLink.addEventListener('click', openDialogFromLink);

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

function addChannel(event) {
  // browser validation has already caught the big mistakes

  event.preventDefault();

  var chData = getChannelFromEditor();
  var channelKey = chData.name;
  if (true) {  // TODO: if (!(channelKey in availableChannels))
    delete chData.name;
  }
  else {
    channelKey = getKeyFromName(channelKey, null); // TODO availableChannels
  }

  var newChannelItem = document.createElement('li');
  newChannelItem.textContent = ('name' in chData) ? chData.name : channelKey;
  dialogOpener.previousElementSibling.appendChild(newChannelItem);

  dialogClosingHandled = true;
  closeDialog();
}
function getChannelFromEditor() {
  var chData = {};

  readSingle(channelEditor, '.channel-name', chData, 'name');
  readSingleSelect(channelEditor, '.channel-type', chData, 'type');

  if (chData.type == 'SingleColor') {
    readSingleSelect(channelEditor, '.channel-color', chData, 'color');
  }

  readSingle(channelEditor, '.channel-defaultValue', chData, 'defaultValue');
  readSingle(channelEditor, '.channel-highlightValue', chData, 'highlightValue');
  readSingleSelect(channelEditor, '.channel-invert', chData, 'invert');
  readSingleSelect(channelEditor, '.channel-constant', chData, 'constant');
  readSingleSelect(channelEditor, '.channel-crossfade', chData, 'crossfade');
  readSingleSelect(channelEditor, '.channel-precedence', chData, 'precedence');

  return chData;
}


// Generate json data
editorForm.addEventListener('submit', function(event) {
  // browser validation has already caught the big mistakes

  event.preventDefault();

  var man;
  var manData = {};
  var fixData = {};

  if (!manShortName.hidden) {
    readSingleSelect(editorForm, '.manufacturer-shortName', manData, 'shortName');
  }
  else {
    readSingle(editorForm, '.new-manufacturer-shortName', manData, 'shortName');
    readSingle(editorForm, '.new-manufacturer-name', manData, 'name');
    readSingle(editorForm, '.new-manufacturer-website', manData, 'website');
    readSingle(editorForm, '.new-manufacturer-comment', manData, 'comment');
  }
  man = manData.shortName;
  delete manData.shortName;

  readSingle(editorForm, '.fixture-name', fixData, 'name');
  readSingle(editorForm, '.fixture-shortName', fixData, 'shortName');
  readMultiSelect(editorForm, '.categories', fixData, 'categories');
  readSingle(editorForm, '.comment', fixData, 'comment');
  readSingle(editorForm, '.manualURL', fixData, 'manualURL');

  readPhysical(editorForm, '.physical.card', fixData, 'physical')

  var modes = editorForm.querySelectorAll('section.fixture-mode');
  fixData.modes = [];
  modes.forEach(function(mode) {
    fixData.modes.push(readMode(mode));
  })

  console.log('\n### Generated data:');
  console.log(man);
  console.log(JSON.stringify(manData, null, 2));
  console.log(JSON.stringify(fixData, null, 2));
});

function readMode(modeContainer) {
  var modeData = {};

  readSingle(modeContainer, '.mode-name', modeData, 'name');
  readSingle(modeContainer, '.mode-shortName', modeData, 'shortName');

  var usePhysicalOverride = modeContainer.querySelector('.use-physical-override');
  if (usePhysicalOverride.checked) {
    readPhysical(modeContainer, '.physical-override', modeData, 'physical');
  }

  return modeData;
}

function readPhysical(container, selector, data, property) {
  readObject(function(physical) {
    var inputsContainer = container.querySelector(selector);

    readArray(inputsContainer,  '.physical-dimensions',   physical, 'dimensions');
    readSingle(inputsContainer, '.physical-weight',       physical, 'weight');
    readSingle(inputsContainer, '.physical-power',        physical, 'power');
    readSingle(inputsContainer, '.physical-DMXconnector', physical, 'DMXconnector');

    readObject(function(bulb) {
      readSingle(inputsContainer, '.physical-bulb-type',             bulb, 'type');
      readSingle(inputsContainer, '.physical-bulb-colorTemperature', bulb, 'colorTemperature');
      readSingle(inputsContainer, '.physical-bulb-lumens',           bulb, 'lumens');
    }, physical, 'bulb');

    readObject(function(lens) {
      readSingle(inputsContainer, '.physical-lens-name',    lens, 'name');
      readArray(inputsContainer,  '.physical-lens-degrees', lens, 'degreesMinMax');
    }, physical, 'lens');

    readObject(function(focus) {
      readSingle(inputsContainer, '.physical-focus-type',    focus, 'type');
      readSingle(inputsContainer, '.physical-focus-panMax',  focus, 'panMax');
      readSingle(inputsContainer, '.physical-focus-tiltMax', focus, 'tiltMax');
    }, physical, 'focus');
  }, data, property);
}

function readObject(parserFunction, data, property) {
  var obj = {};

  parserFunction(obj);

  if (JSON.stringify(obj) !== '{}') {
    data[property] = obj;
  }
}

function readSingle(container, selector, data, property) {
  var input = container.querySelector(selector + ' input, ' + selector + ' textarea');
  if (input.type === 'number') {
    if (!isNaN(input.valueAsNumber)) {
      data[property] = input.valueAsNumber;
    }
  }
  else {
    if (input.value != '') {
      data[property] = input.value;
    }
  }
}

function readArray(container, selector, data, property) {
  var inputs = container.querySelectorAll(selector + ' input, ' + selector + ' textarea');

  var array = [];
  var filled = false;
  [].forEach.call(inputs, function(input) {
    if (input.type === 'number') {
      if (!isNaN(input.valueAsNumber)) {
        filled = true;
        array.push(input.valueAsNumber);
      }
      else {
        array.push(0);
      }
    }
    else {
      if (input.value != '') {
        filled = true;
        array.push(input.value);
      }
      else {
        array.push('');
      }
    }
  });

  if (filled) {
    data[property] = array;
  }
}

function readMultiSelect(container, selector, data, property) {
  var select = container.querySelector(selector + ' select');
  if (select.selectedOptions.length > 0) {
    data[property] = [];
    for (var i = 0; i < select.selectedOptions.length; i++) {
      data[property].push(select.selectedOptions[i].value);
    }
  }
}

function readSingleSelect(container, selector, data, property) {
  var select = container.querySelector(selector + ' select');
  if (select.value != '') {
    if (select.className == 'boolean') {
      data[property] = select.value == 'true';
    }
    else {
      data[property] = select.value == '[add-value]' ? select.nextElementSibling.value : select.value;
    }
  }
}

function getKeyFromName(name, uniqueInList) {
  name = name.toLowerCase().replace(/[^a-z0-9\-]+/g, '-');

  if (!uniqueInList) {
    return name;
  }

  var nameRegexp = new RegExp('^' + name + '\s*\d+$');
  var occurences = uniqueInList.reduce(function(acc, value) {
    if (nameRegexp.test(value)) {
      return acc + 1;
    }
    return acc;
  }, 0);

  return name + ' ' + (occurences + 1);
}