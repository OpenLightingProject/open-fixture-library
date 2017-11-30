'use strict';

require('details-polyfill');

var logo;
var searchInput;

window.addEventListener('load', function() {
  // this allows us to add CSS styles only if JS is enabled (.js) or disabled (:not(.js))
  document.querySelector('html').classList.add('js');

  // the logo beside the searchbar gets hidden when the input has focus or if it isn't empty
  // (only has effect on mobile due to CSS styles)
  logo = document.querySelector('#home-logo');
  searchInput = document.querySelector('#header input');
  searchInput.addEventListener('focus', hideLogo, true);
  searchInput.addEventListener('blur', checkSearchInput, true);
  checkSearchInput();

  // only a small focus improvement on download buttons
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
