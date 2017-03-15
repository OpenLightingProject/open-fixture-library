const path = require("path");
const schemas = require(path.join(__dirname, '..', '..', 'fixtures', 'schema'));
const manProperties = schemas.Manufacturers.toJSON().additionalProperties.properties;
const fixProperties = schemas.Fixture.toJSON().properties;
const physProperties = fixProperties.physical.properties;

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
  str += textInput(manProperties.name);
  str += '</section>'

  str += '<section class="new-manufacturer-shortname">';
  str += '<label>Unique short name</label>'
  str += '<input required />'
  str += '</section>'

  str += '<section class="new-manufacturer-website">';
  str += '<label>Website</label>'
  str += textInput(manProperties.website);
  str += '</section>'

  str += '<section class="new-manufacturer-comment">';
  str += '<label>Comment</label>'
  str += textInput(manProperties.comment);
  str += '</section> or ';
  str += '<a href="#" class="use-existing-manufacturer">Use existing manufacturer</a>';
  str += '</section>'

  str += '</section>'


  // Fixture info
  str += '<section class="fixture-info card">';
  str += '<h2>Fixture info</h2>';

  str += '<section class="fixture-name">';
  str += '<label>Name</label>'
  str += textInput(fixProperties.name);
  str += '</section>'

  str += '<section class="fixture-shortname">';
  str += '<label>Unique short name</label>'
  str += textInput(fixProperties.name, "Defaults to name");
  str += '</section>'

  str += '<section class="categories">';
  str += '<label>Category(s)</label>'
  str += `<select multiple required size="${Object.keys(options.register.categories).length}">`;
  for (const cat of fixProperties.categories.items.enum) {
    str += `<option>${cat}</option>`;
  }
  str += '</select>';
  str += '</section>'

  str += '<section class="comment">';
  str += '<label>Comment</label>'
  str += '<textarea></textarea>'
  str += '</section>'

  str += '<section class="manualURL">';
  str += '<label>Manual URL</label>'
  str += '<input type="url" />'
  str += '</section>'

  str += '</section>'


  // Fixture physical
  str += '<section class="physical card">';
  str += '<h2>Physical data</h2>';
  str += '</section>';


  // Physical template
  str += '<template class="template-physical">';

  str += '<section class="physical-dimensions">';
  str += '<label>Dimensions</label>'
  str += '<div class="value">';
  str += numberInput(physProperties.dimensions.items, "width") + ' &times; ';
  str += numberInput(physProperties.dimensions.items, "height") + ' &times; ';
  str += numberInput(physProperties.dimensions.items, "depth") + ' mm';
  str += '</div>';
  str += '</section>'

  str += '<section class="physical-weight">';
  str += '<label>Weight</label>';
  str += numberInput(physProperties.weight) + ' kg';
  str += '</section>'

  str += '<section class="physical-power">';
  str += '<label>Power</label>';
  str += numberInput(physProperties.power) + ' W';
  str += '</section>'

  str += '<section class="physical-DMXconnector">';
  str += '<label>DMX connector</label>';
  str += '<input placeholder="e.g. 3-pin" />'
  str += '</section>'

  str += '<h3>Bulb</h3>';

  str += '<section class="physical-bulb-type">';
  str += '<label>Bulb type</label>';
  str += '<input />'
  str += '</section>'

  str += '<section class="physical-bulb-colorTemperature">';
  str += '<label>Color temperature</label>';
  str += '<input type="number" /> K'
  str += '</section>'

  str += '<section class="physical-bulb-lumens">';
  str += '<label>Lumens</label>';
  str += '<input type="number" /> lm'
  str += '</section>'

  str += '</template>';


  str += '<button class="save-fixture">Save</button>'


  str += '<script src="/client-fixture-editor.js"></script>';

  str += require('../includes/footer')(options);

  return str;
};

function textInput(property, hint) {
  const required = property.required ? ' required' : '';
  const placeholder = hint ? ` placeholder="${hint}"` : '';
  return `<input type="text" ${required}${placeholder} />`;
}

function suggestedTextInput(property, hint) {
  const required = property.required ? ' required' : '';
  const placeholder = hint ? ` placeholder="${hint}"` : '';
  return `<input type="text" ${required}${placeholder} />`;
}

function numberInput(property, hint) {
  console.log(property);
  const required = property.required !== undefined ? ' required' : '';
  const min = property.minimum !== undefined ? ` min="${property.minimum}"` : '';
  const max = property.maximum !== undefined ? ` min="${property.maximum}"` : '';
  const placeholder = hint ? ` placeholder="${hint}"` : '';

  return `<input type="number" ${required}${min}${max}${placeholder} step="any" />`;
}