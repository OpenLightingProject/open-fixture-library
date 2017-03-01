"use strict";

var logo;
var searchInput;

window.addEventListener("load", function(event) {
  logo = document.querySelector("#home-logo");
  searchInput = document.querySelector("header input");

  checkSearchInput();


  searchInput.addEventListener("focus", hideLogo, true);
  searchInput.addEventListener("blur", checkSearchInput, true);
});

function hideLogo() {
  logo.classList.add("searchUsed");
}

function checkSearchInput() {
  if (searchInput.value === undefined || searchInput.value.length == 0) {
    showLogo();
  }
  else {
    hideLogo();
  }
}

function showLogo() {
  logo.classList.remove("searchUsed");
}