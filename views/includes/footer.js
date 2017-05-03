module.exports = function(options) {
  let str = '</div>';  // #content

  if ('footerHtml' in options) {
    str += options.footerHtml;
  }

  str += '</body></html>';

  return str;
};