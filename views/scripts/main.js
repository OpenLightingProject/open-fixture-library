'use strict';

require('./polyfills.js');

var logo;
var searchInput;

window.addEventListener('load', function() {
  var html = document.querySelector('html');
  html.classList.add('js');
  html.classList.remove('no-js');

  logo = document.querySelector('#home-logo');
  searchInput = document.querySelector('#header input');

  checkSearchInput();

  searchInput.addEventListener('focus', hideLogo, true);
  searchInput.addEventListener('blur', checkSearchInput, true);

  var downloadButton = document.querySelector('.download-button');
  if (downloadButton) {
    downloadButton.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        this.blur();
      }, false);
    });
  }

  document.querySelectorAll('.expand-all, .collapse-all').forEach(function(button) {
    button.addEventListener('click', function() {
      var open = this.classList.contains('expand-all');
      this.closest('.fixture-mode').querySelectorAll('details').forEach(function(details) {
        details.open = open;
      });
    }, false);
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
