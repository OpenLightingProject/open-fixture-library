'use strict';

/* eslint no-var: off */
/* eslint prefer-arrow-callback: off */
/* eslint prefer-template: off */
/* eslint-env browser */

require('details-polyfill');

var logo;
var searchInput;

window.addEventListener('load', function() {
  document.querySelector('html').classList.add('js');

  logo = document.querySelector('#home-logo');
  searchInput = document.querySelector('#header input');

  checkSearchInput();

  searchInput.addEventListener('focus', hideLogo, true);
  searchInput.addEventListener('blur', checkSearchInput, true);

  var downloadButton = document.querySelector('.download-button');
  if (downloadButton) {
    var links = downloadButton.querySelectorAll('a');

    for (var i = 0; i < links.length; i++) {
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
  if (searchInput.value === undefined || searchInput.value.length === 0) {
    showLogo();
  }
  else {
    hideLogo();
  }
}

function showLogo() {
  logo.classList.remove('searchUsed');
}
