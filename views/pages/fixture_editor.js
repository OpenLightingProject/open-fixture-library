module.exports = function(options) {
  options.title = 'Fixture Editor - Open Fixture Library';

  let str = require('../includes/header')(options);

  str += '<h1>Fixture Editor</h1>';

  str += '<section class="manufacturer">';
  str += '<h3>Manufacturer</h3>';

  str += '<section class="manufacturer-shortname">';
  str += `<select required>`;
  for (const man in options.manufacturers) {
    str += `<option value="${man}">${options.manufacturers[man].name}</option>`;
  }
  str += '</select> or ';
  str += '<a href="#" class="add-manufacturer">+ Add manufacturer</a>';
  str += '</section>'

  str += '<section class="new-manufacturer" hidden>';
  str += '<section class="new-manufacturer-name">';
  str += '<label>Name</label>'
  str += '<input required />'
  str += '</section>'

  str += '<section class="new-manufacturer-shortname">';
  str += '<label>Unique short name</label>'
  str += '<input required />'
  str += '</section>'

  str += '<section class="new-manufacturer-website">';
  str += '<label>Website</label>'
  str += '<input />'
  str += '</section>'

  str += '<section class="new-manufacturer-comment">';
  str += '<label>Comment</label>'
  str += '<input />'
  str += '</section> or ';
  str += '<a href="#" class="use-existing-manufacturer">Use existing manufacturer</a>';
  str += '</section>'

  str += '</section>'

  str += '<script src="/client-fixture-editor.js"></script>';

  str += require('../includes/footer')(options);

  return str;
};