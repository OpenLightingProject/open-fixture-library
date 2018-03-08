module.exports = function(options) {
  let str = ``;

  if (options.query.prefill) {
    try {
      const prefillObjectStr = JSON.stringify(JSON.parse(options.query.prefill));
      str += `<script type="text/javascript">window.oflPrefill = ${prefillObjectStr};</script>`;
    }
    catch (error) {
      console.log(`prefill query could not be parsed: `, options.query.prefill);
    }
  }

  str += getRestoreDialogString();

  options.footerHtml = `<script type="text/javascript" src="/js/fixture-editor.js" async></script>`;

  str += require(`../includes/footer.js`)(options);

  return str;
};

/**
 * @returns {!string} The HTML for the restore dialog, using @see getDialogTemplate.
 */
function getRestoreDialogString() {
  let str = `<a11y-dialog id="restore" :cancellable="false" :shown="restoredData !== ''">`;
  str += `<span slot="title">Auto-saved fixture data found</span>`;

  str += `Do you want to restore the data (auto-saved <time>{{ restoredDate }}</time>) to continue to create the fixture?`;
  str += `<div class="button-bar right">`;
  str += `<button class="discard secondary" @click.prevent="discardRestored">Discard data</button> `;
  str += `<button class="restore primary" @click.prevent="applyRestored">Restore to continue work</button>`;
  str += `</div>`;

  str += `</a11y-dialog>`;

  return str;
}
