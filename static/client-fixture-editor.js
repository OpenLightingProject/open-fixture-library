'use strict';

// Toggle between existing and new manufacturer
var manShortname = document.querySelector(".manufacturer-shortname");
var addMan = manShortname.querySelector(".add-manufacturer");

var newMan = document.querySelector(".new-manufacturer");
var useExistingMan = newMan.querySelector(".use-existing-manufacturer");

addMan.addEventListener("click", function() {
  manShortname.hidden = true;
  newMan.hidden = false;
});

useExistingMan.addEventListener("click", function() {
  manShortname.hidden = false;
  newMan.hidden = true;
});


// Generate json file(s)
var saveButton = document.querySelector('.save-fixture');
saveButton.addEventListener("click", function() {
  var man;
  var manData;
  var fixData = {};

  if (!manShortname.hidden) {
    man = manShortname.querySelector("select").value;
  }
  else {
    man = newMan.querySelector(".new-manufacturer-shortname input").value;
    manData = {
      name: newMan.querySelector(".new-manufacturer-name input").value,
      website: newMan.querySelector(".new-manufacturer-website input").value,
      comment: newMan.querySelector(".new-manufacturer-comment input").value,
    };
  }

  readInput('.fixture-name input',      fixData, "name");
  readInput('.fixture-shortname input', fixData, "shortname");
  readSelect('.categories select',      fixData, "categories");
  readInput('.comment textarea',        fixData, "comment");
  readInput('.manual input',            fixData, "manualURL");

  console.log("\n### Generated data:");
  console.log(man);
  console.log(JSON.stringify(manData, null, 2));
  console.log(JSON.stringify(fixData, null, 2));
});


function readInput(selector, data, property) {
  var input = document.querySelector(selector);
  if (input.value == '') {
    if (input.required) {
      console.error(selector + ' is required and is empty');
    }
  }
  else {
    data[property] = input.value;
  }
}

function readSelect(selector, data, property) {
  var select = document.querySelector(selector);

  for (var option of select.selectedOptions) {
    if (data[property] === undefined) {
      data[property] = [];
    }
    data[property].push(option.value);
  }

  if (data[property] === undefined && select.required) {
    console.error(selector + ' is required and is empty');
  }
}