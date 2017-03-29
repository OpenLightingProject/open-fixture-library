module.exports = function(options) {
  let str = '</div>'; // #content

  for (dialog of options.dialogs || []) {
    str += `<div class="dialog-container" id="${dialog.id}" aria-hidden="true">`;
    str += '  <div class="dialog-overlay" tabindex="-1" data-a11y-dialog-hide></div>';
    str += `  <div class="dialog card" aria-labelledby="${dialog.id}-title" role="dialog">`;
    str += '    <div role="document">';
    str += `      <h1 id="${dialog.id}-title" tabindex="0">${dialog.title}</h1>`;
    str += dialog.content;
    str += `      <button data-a11y-dialog-hide class="dialog-close" aria-label="Close this dialog window">&times;</button>`;
    str += '    </div>';  // div[role=document]
    str += '  </div>';  // .dialog
    str += '</div>';  // .dialog-container
  }

  str += '</body></html>';

  return str;
};