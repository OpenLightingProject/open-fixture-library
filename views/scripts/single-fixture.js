'use strict';

require('./polyfills.js');

window.addEventListener('load', function() {
  document.querySelectorAll('.matrix-pixelGroup').forEach(function(pixelGroup) {
    pixelGroup.addEventListener('mouseover', function(e) {
      togglePixels(this, true);
    }, true);

    pixelGroup.addEventListener('mouseout', function(e) {
      togglePixels(this, false);
    }, true);
  });
});

/**
 * Searches the pixels of the given pixelGroup and (un)highlights them.
 * @param {!HTMLElement} pixelGroup The HTML <section> containing the information about the pixelGroup.
 * @param {!boolean} highlight Whether or not to highlight the pixels.
 */
function togglePixels(pixelGroup, highlight) {
  var pixelGroupKey = pixelGroup.getAttribute('data-pixel-group');
  var pixels = document.querySelectorAll('.pixel[data-pixel-groups]');

  pixels.forEach(function(pixel) {
    var pixelGroups = JSON.parse(pixel.getAttribute('data-pixel-groups'));
    if (pixelGroups.indexOf(pixelGroupKey) !== -1) {
      if (highlight) {
        pixel.classList.add('highlight');
      }
      else {
        pixel.classList.remove('highlight');
      }
    }
  });
}