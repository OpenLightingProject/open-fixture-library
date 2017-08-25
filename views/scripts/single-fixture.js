'use strict';

window.addEventListener('load', function() {
  var pixelGroups = document.querySelectorAll('.matrix-pixelGroup');
  if (pixelGroups.length > 0) {
    for (var i = 0; i < pixelGroups.length; i++) {
      pixelGroups[i].addEventListener('mouseover', function(e) {
        togglePixels(this, true);
      }, true);
      
      pixelGroups[i].addEventListener('mouseout', function(e) {
        togglePixels(this, false);
      }, true);
    }
  }
});

/**
 * Searches the pixels of the given pixelGroup and (un)highlights them.
 * @param {!Node} pixelGroup The HTML <section> containing the information about the pixelGroup.
 * @param {!boolean} highlight Whether or not to highlight the pixels.
 */
function togglePixels(pixelGroup, highlight) {
  var pixelGroupKey = pixelGroup.attributes['data-pixelGroup'].value;
  var pixels = document.querySelectorAll('.pixel[data-pixelGroups~="' + pixelGroupKey + '"]');

  for (var j = 0; j < pixels.length; j++) {
    if (highlight) {
      pixels[j].classList.add('highlight');
    }
    else {
      pixels[j].classList.remove('highlight');
    }
  }
}