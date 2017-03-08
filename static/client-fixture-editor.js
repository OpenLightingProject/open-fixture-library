'use strict';

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