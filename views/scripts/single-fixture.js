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
 * @param {!Node} pixelGroup The HTML <section> containing the information about the pixelGroup.
 * @param {!boolean} highlight Whether or not to highlight the pixels.
 */
function togglePixels(pixelGroup, highlight) {
  var pixelGroupKey = pixelGroup.attributes['data-pixelGroup'].value;
  var pixels = document.querySelectorAll('.pixel[data-pixelGroups~="' + pixelGroupKey + '"]');

  pixels.forEach(function(pixel) {
    if (highlight) {
      pixel.classList.add('highlight');
    }
    else {
      pixel.classList.remove('highlight');
    }
  });
}