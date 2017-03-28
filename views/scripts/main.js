'use strict';

var logo;
var searchInput;

window.addEventListener('load', function() {
  logo = document.querySelector('#home-logo');
  searchInput = document.querySelector('#header input');

  checkSearchInput();

  searchInput.addEventListener('focus', hideLogo, true);
  searchInput.addEventListener('blur', checkSearchInput, true);

  var downloadButton = document.querySelector('.download-button');
  if (downloadButton != null) {
    var links = downloadButton.querySelectorAll('a');

    for (var i=0; i<links.length; i++) {
      links[i].addEventListener('click', function() {
        this.blur();
      }, false);
    }
  }
}, false);

function hideLogo() {
  logo.classList.add('searchUsed');
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
  logo.classList.remove('searchUsed');
}