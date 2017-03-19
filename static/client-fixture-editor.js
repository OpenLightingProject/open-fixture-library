'use strict';

// Toggle between existing and new manufacturer
var manShortname = document.querySelector('.manufacturer-shortname');
var addManLink = manShortname.querySelector('.add-manufacturer');

var newMan = document.querySelector('.new-manufacturer');
var useExistingManLink = newMan.querySelector('.use-existing-manufacturer');

function addManufacturer() {
  manShortname.hidden = true;
  manShortname.querySelectorAll('select, input').forEach(function(element) {
    element.disabled = true;
  });

  newMan.hidden = false;
  newMan.querySelectorAll('select, input').forEach(function(element) {
    element.disabled = false;
  });
}
function useExistingManufacturer() {
  manShortname.hidden = false;
  manShortname.querySelectorAll('select, input').forEach(function(element) {
    element.disabled = false;
  });

  newMan.hidden = true;
  newMan.querySelectorAll('select, input').forEach(function(element) {
    element.disabled = true;
  });
}
addManLink.addEventListener('click', addManufacturer);
useExistingManLink.addEventListener('click', useExistingManufacturer);
useExistingManufacturer(); // this should be shown at the start


// Clone physical template into fixture 
var templatePhysical = document.querySelector('.template-physical');
var physical = document.querySelector('.physical');
physical.appendChild(document.importNode(templatePhysical.content, true));


// Enable mode adding
var templateMode = document.querySelector('.template-mode');
var modesContainer = document.querySelector('.fixture-modes');
var addModeLink = document.querySelector('a.fixture-mode');
addModeLink.addEventListener('click', function(e) {
  e.preventDefault();

  var newMode = document.importNode(templateMode.content, true);
  modesContainer.insertBefore(
    newMode,
    addModeLink
  );
  newMode = addModeLink.previousSibling;

  var newModeName = newMode.querySelector('.mode-name > input');
  newModeName.focus();

  var removeModeButton = newMode.querySelector('.remove-mode');
  removeModeButton.addEventListener('click', function(e) {
    e.preventDefault();
    newMode.remove();
  });
});


// Generate json file(s)
var editorForm = document.querySelector('#fixture-editor');
editorForm.addEventListener('submit', function() {
  // browser validation has already happened
  // -> all inputs are valid

  var man;
  var manData = {};
  var fixData = {};

  if (!manShortname.hidden) {
    man = readSingle('.manufacturer-shortname select');
  }
  else {
    man = readSingle('.new-manufacturer-shortname input');
    readSingle('.new-manufacturer-name input',    manData, 'name');
    readSingle('.new-manufacturer-website input', manData, 'website');
    readSingle('.new-manufacturer-comment input', manData, 'comment');
  }

  readSingle('.fixture-name input',      fixData, 'name');
  readSingle('.fixture-shortname input', fixData, 'shortname');
  readMultiple('.categories select',     fixData, 'categories');
  readSingle('.comment textarea',        fixData, 'comment');
  readSingle('.manualURL input',         fixData, 'manualURL');

  console.log('\n### Generated data:');
  console.log(man);
  console.log(JSON.stringify(manData, null, 2));
  console.log(JSON.stringify(fixData, null, 2));
});


function readSingle(selector, data, property) {
  var input = document.querySelector(selector);
  if (input.value) {
    if (data && property) {
      data[property] = input.value;
    }
    else {
      return input.value;
    }
  }
}

function readMultiple(selector, data, property) {
  var select = document.querySelector(selector);
  if (select.selectedOptions.length > 0) {
    var output = [];
    for (var option of select.selectedOptions) {
      output.push(option.value);
    }

    if (data && property) {
      data[property] = output;
    }
    else {
      return output;
    }
  }
}