'use strict';

require('./polyfills.js');

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
    downloadButton.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        this.blur();
      }, false);
    });
  }

  // expand all and collapse all buttons in fixture modes open / close all channels
  document.querySelectorAll('.expand-all, .collapse-all').forEach(function(button) {
    var detailsElems = button.closest('.fixture-mode').querySelectorAll('details');
    if (detailsElems.length > 0) {
      button.addEventListener('click', function() {
        var open = this.classList.contains('expand-all');
        detailsElems.forEach(function(details) {
          details.open = open;
        });
      }, false);
    }
    else {
      button.parentElement.removeChild(button);
    }
  });
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
