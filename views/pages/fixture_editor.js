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

  return str;
};
