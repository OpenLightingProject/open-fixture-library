window.addEventListener('load', function() {
  // only a small focus improvement on download buttons
  var downloadButton = document.querySelector('.download-button');
  if (downloadButton) {
    downloadButton.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        this.blur();
      }, false);
    });
  }
}, false);
