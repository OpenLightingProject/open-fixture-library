'use strict';

var A11yDialog = require('a11y-dialog');

var dialogs = {
  'add-channel-to-mode': null
};

var editorForm = document.querySelector('#fixture-editor');

// Toggle between existing and new manufacturer
var manShortName = document.querySelector('.manufacturer-shortName');
var addManLink = manShortName.querySelector('.add-manufacturer');

var newMan = document.querySelector('.new-manufacturer');
var useExistingManLink = newMan.querySelector('.use-existing-manufacturer');

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
addManLink.addEventListener('click', toggleManufacturer);
useExistingManLink.addEventListener('click', toggleManufacturer);
toggleManufacturer(); // initialize by only showing manShortName


// Clone physical template into fixture 
var templatePhysical = document.querySelector('.template-physical');
var physical = document.querySelector('.physical');
physical.appendChild(document.importNode(templatePhysical.content, true));


// Allow select additions
function addSelectAdditionEventListeners(element) {
  [].forEach.call(element.querySelectorAll('[data-allow-additions]'), function(select) {
    select.addEventListener('change', function() {
      updateSelectAddition(this, true);
    }, false);
  });
}
function updateSelectAddition(select, updateFocus) {
  var addValue = select.value == '[add-value]';
  select.nextElementSibling.disabled = !addValue;
  if (addValue && updateFocus) {
    select.nextElementSibling.focus();
  }
}
addSelectAdditionEventListeners(editorForm);

// Enable mode adding
var templateMode = document.querySelector('.template-mode');
var modesContainer = document.querySelector('.fixture-modes');
var addModeLink = document.querySelector('a.fixture-mode');

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
  addSelectAdditionEventListeners(physicalOverride);

  var usePhysicalOverride = newMode.querySelector('.use-physical-override');
  usePhysicalOverride.addEventListener('change', function() {
    togglePhysicalOverride(usePhysicalOverride, physicalOverride);
  });
  togglePhysicalOverride(usePhysicalOverride, physicalOverride);

  var openChannelDialogLink = newMode.querySelector('a.show-dialog');
  openChannelDialogLink.addEventListener('click', openDialog, false);

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
      updateSelectAddition(select, false);
    });
  }
  else {
    physicalOverride.hidden = true;
    [].forEach.call(physicalOverride.querySelectorAll('select, input'), function(element) {
      element.disabled = true;
    });
  }
}
addModeLink.addEventListener('click', addMode);
addMode(); // all fixtures have at least one mode


function openDialog(event) {
  event.preventDefault();

  var key = event.target.getAttribute('href').slice(1);
  dialogs[key].show();
}

// initialize dialogs
window.addEventListener('load', function() {
  for (var key in dialogs) {
    dialogs[key] = new A11yDialog(document.getElementById(key));
  }
}, false);


// Generate json data
editorForm.addEventListener('submit', function() {
  // browser validation has already happened
  // -> all inputs are valid

  var man;
  var manData = {};
  var fixData = {};

  if (!manShortName.hidden) {
    readSelect(document, '.manufacturer-shortName',     manData, 'shortName');
  }
  else {
    readSingle(document, '.new-manufacturer-shortName', manData, 'shortName');
    readSingle(document, '.new-manufacturer-name',      manData, 'name');
    readSingle(document, '.new-manufacturer-website',   manData, 'website');
    readSingle(document, '.new-manufacturer-comment',   manData, 'comment');
  }
  man = manData.shortName;
  delete manData.shortName;

  readSingle(document, '.fixture-name',      fixData, 'name');
  readSingle(document, '.fixture-shortName', fixData, 'shortName');
  readSelect(document, '.categories',        fixData, 'categories');
  readSingle(document, '.comment',           fixData, 'comment');
  readSingle(document, '.manualURL',         fixData, 'manualURL');

  readPhysical(document, '.physical.card', fixData, 'physical')

  var modes = document.querySelectorAll('section.fixture-mode');
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

  readSingle(modeContainer, '.mode-name',      modeData, 'name');
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
    }, physical, "bulb");

    readObject(function(lens) {
      readSingle(inputsContainer, '.physical-lens-name',    lens, 'name');
      readArray(inputsContainer,  '.physical-lens-degrees', lens, 'degreesMinMax');
    }, physical, "lens");

    readObject(function(focus) {
      readSingle(inputsContainer, '.physical-focus-type',    focus, 'type');
      readSingle(inputsContainer, '.physical-focus-panMax',  focus, 'panMax');
      readSingle(inputsContainer, '.physical-focus-tiltMax', focus, 'tiltMax');
    }, physical, "focus");
  }, data, property);
}

function readObject(parserFunction, data, property) {
  var obj = {};

  parserFunction(obj);

  if (JSON.stringify(obj) !== "{}") {
    data[property] = obj;
  }
}

function readSingle(container, selector, data, property) {
  var input = container.querySelector(selector + ' input, ' + selector + ' textarea');
  if (input.type === "number") {
    if (!isNaN(input.valueAsNumber)) {
      data[property] = input.valueAsNumber;
    }
  }
  else {
    if (input.value != "") {
      data[property] = input.value;
    }
  }
}

function readArray(container, selector, data, property) {
  var inputs = container.querySelectorAll(selector + ' input, ' + selector + ' textarea');

  var array = [];
  var filled = false;
  [].forEach.call(inputs, function(input) {
    if (input.type === "number") {
      if (!isNaN(input.valueAsNumber)) {
        filled = true;
        array.push(input.valueAsNumber);
      }
      else {
        array.push(0);
      }
    }
    else {
      if (input.value != "") {
        filled = true;
        array.push(input.value);
      }
      else {
        array.push("");
      }
    }
  });

  if (filled) {
    data[property] = array;
  }
}

function readSelect(container, selector, data, property) {
  var select = container.querySelector(selector + ' select');
  if (select.selectedOptions.length > 0) {
    data[property] = [];
    for (var i = 0; i < select.selectedOptions.length; i++) {
      data[property].push(select.selectedOptions[i].value);
    }
  }
}