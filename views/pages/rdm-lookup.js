module.exports = function(options) {
  options.title = 'RDM Lookup - Open Fixture Library';

  let str = require('../includes/header.js')(options);

  str += '<h1>RDM Lookup</h1>';

  str += '<p>Find a fixture definition or manufacturer by entering its RDM IDs.</p>';

  str += '<form action="/rdm" method="get">';
  str += '<section><label>';
  str += '  <span class="label">Manufacturer ID</span>';
  str += '  <span class="value"><input type="number" name="manufacturerId" min="0" step="1" required /></span>';
  str += '</label></section>';
  str += '<section><label>';
  str += '  <span class="label">Model ID</span>';
  str += '  <span class="value"><input type="number" name="modelId" min="0" step="1" /><span class="hint">Leave this field empty to find the manufacturer.</span></span>';
  str += '</label></section>';
  str += '<div class="button-bar">';
  str += '  <button type="submit" class="primary">Lookup fixture / manufacturer</button>';
  str += '</div>';
  str += '</form>';

  str += require('../includes/footer.js')(options);

  return str;
};
