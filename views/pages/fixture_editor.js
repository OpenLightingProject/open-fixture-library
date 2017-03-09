module.exports = function(options) {
  options.title = 'Fixture Editor - Open Fixture Library';

  let str = require('../includes/header')(options);

  str += '<h1>Fixture Editor</h1>';

  // Manufacturer
  str += '<section class="manufacturer card">';
  str += '<h2>Manufacturer</h2>';

  str += '<section class="manufacturer-shortname">';
  str += '<label>Choose from list</label>'
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


  // Fixture info
  str += '<section class="fixture-info card">';
  str += '<h2>Fixture info</h2>';

  str += '<section class="fixture-name">';
  str += '<label>Name</label>'
  str += '<input required />'
  str += '</section>'

  str += '<section class="fixture-shortname">';
  str += '<label>Unique short name</label>'
  str += '<input placeholder="Defaults to name" />'
  str += '</section>'

  str += '<section class="categories">';
  str += '<label>Category(s)</label>'
  str += `<select multiple required size="${Object.keys(options.register.categories).length}">`;
  for (const cat in options.register.categories) {
    str += `<option>${cat}</option>`;
  }
  str += '</select>';
  str += '</section>'

  str += '<section class="comment">';
  str += '<label>Comment</label>'
  str += '<textarea></textarea>'
  str += '</section>'

  str += '<section class="manual">';
  str += '<label>Manual URL</label>'
  str += '<input />'
  str += '</section>'

  str += '</section>'


  // Fixture physical
  str += '<section class="physical card">';
  str += '<h2>Physical data</h2>';
  str += '</section>';


  // Physical template
  str += '<template class="template-physical">';
  str += '<section class="power">';
  str += '<label>Power</label>'
  str += '<input />'
  str += '</section>'
  str += '</template>';


  str += '<button class="save-fixture">Save</button>'


  str += '<script src="/client-fixture-editor.js"></script>';

  str += require('../includes/footer')(options);

  return str;
};