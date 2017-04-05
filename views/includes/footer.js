module.exports = function(options) {
  let str = '</div>';  // #content

  for (dialog of options.dialogs || []) {
    str += `<div class="dialog-container" id="${dialog.id}" aria-hidden="true">`;
    str += `  <div class="dialog-overlay" tabindex="-1"${dialog.cancellable ? 'data-a11y-dialog-hide' : ''}></div>`;
    str += `  <div class="dialog card" aria-labelledby="${dialog.id}-title" role="dialog">`;
    str += '    <div role="document">';
    str += `      <h2 id="${dialog.id}-title" tabindex="0">${dialog.title}</h2>`;
    str += dialog.content;

    if (dialog.cancellable) {
      str += '      <a href="#_" data-a11y-dialog-hide class="close">';
      str += 'Close';
      str += require('./svg')({svgBasename: 'close'});
      str += '</a>';
    }

    str += '    </div>';  // div[role=document]
    str += '  </div>';  // .dialog
    str += '</div>';  // .dialog-container
  }

  str += '</body></html>';

  return str;
};