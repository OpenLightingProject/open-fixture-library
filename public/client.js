"use strict";

var logo;
var searchInput;

window.addEventListener("load", function(event) {
  logo = document.querySelector("#home-logo");
  searchInput = document.querySelector("header input");

  checkSearchInput();

  searchInput.addEventListener("focus", function(event) {
    showLogo();
  }, true);
  searchInput.addEventListener("blur", function(event) {
    checkSearchInput();
  }, true);
});

function showLogo() {
  logo.classList.add("searchUsed");
}

function checkSearchInput() {
  if (searchInput.value.length == 0) {
    hideLogo();
  }
  else {
    showLogo();
  }
}

function hideLogo() {
  logo.classList.remove("searchUsed");
}