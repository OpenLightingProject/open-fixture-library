const path = require('path');
const properties = require(path.join(__dirname, '..', '..', 'fixtures', 'schema')).properties;
// console.log(properties);

module.exports = function(options) {
  options.title = 'Fixture Editor - Open Fixture Library';

  let str = require('../includes/header')(options);

  str += '<h1>Fixture Editor</h1>';

  str += '<form id="fixture-editor" action="#">'; // for now

  // Manufacturer
  str += '<section class="manufacturer card">';
  str += '<h2>Manufacturer</h2>';

  str += '<section class="manufacturer-shortname">';
  str += '<label>Choose from list</label>';
  str += `<select required>`;
  for (const man in options.manufacturers) {
    str += `<option value="${man}">${options.manufacturers[man].name}</option>`;
  }
  str += '</select> or ';
  str += '<a href="#" class="add-manufacturer">+ Add manufacturer</a>';
  str += '</section>'; // Existing manufacturer

  str += '<section class="new-manufacturer">';
  str += '<section class="new-manufacturer-name">';
  str += '<label>Name</label>';
  str += textInput(properties.manufacturer.name);
  str += '</section>';

  str += '<section class="new-manufacturer-shortname">';
  str += '<label>Unique short name</label>';
  str += '<input required pattern="[a-z0-9\-]+" />';
  str += '</section>';

  str += '<section class="new-manufacturer-website">';
  str += '<label>Website</label>';
  str += textInput(properties.manufacturer.website);
  str += '</section>';

  str += '<section class="new-manufacturer-comment">';
  str += '<label>Comment</label>';
  str += textInput(properties.manufacturer.comment);
  str += '</section> or ';
  str += '<a href="#" class="use-existing-manufacturer">Use existing manufacturer</a>';
  str += '</section>'; // New manufacturer

  str += '</section>'; // Manufacturer


  // Fixture info
  str += '<section class="fixture-info card">';
  str += '<h2>Fixture info</h2>';

  str += '<section class="fixture-name">';
  str += '<label>Name</label>';
  str += textInput(properties.fixture.name);
  str += '</section>';

  str += '<section class="fixture-shortname">';
  str += '<label>Unique short name</label>';
  str += textInput(properties.fixture.name, "Defaults to name");
  str += '</section>';

  str += '<section class="categories">';
  str += '<label>Category(s)</label>';
  str += `<select multiple required size="${Object.keys(options.register.categories).length}">`;
  for (const cat of properties.category.enum) {
    str += `<option>${cat}</option>`;
  }
  str += '</select>';
  str += '</section>';

  str += '<section class="comment">';
  str += '<label>Comment</label>';
  str += textareaInput(properties.fixture.comment);
  str += '</section>';

  str += '<section class="manualURL">';
  str += '<label>Manual URL</label>';
  str += urlInput(properties.fixture.manualURL);
  str += '</section>';

  str += '</section>'; // Fixture info


  // Fixture physical
  str += '<section class="physical card">';
  str += '<h2>Physical data</h2>';
  str += '</section>';


  // Physical template
  str += '<template class="template-physical">';

  str += '<section class="physical-dimensions">';
  str += '<label>Dimensions</label>';
  str += '<div class="value">';
  str += numberInput(properties.physical.dimensions.items, 'width') + ' &times; ';
  str += numberInput(properties.physical.dimensions.items, 'height') + ' &times; ';
  str += numberInput(properties.physical.dimensions.items, 'depth') + ' mm';
  str += '</div>';
  str += '</section>';

  str += '<section class="physical-weight">';
  str += '<label>Weight</label>';
  str += numberInput(properties.physical.weight) + ' kg';
  str += '</section>';

  str += '<section class="physical-power">';
  str += '<label>Power</label>';
  str += numberInput(properties.physical.power) + ' W';
  str += '</section>';

  str += '<section class="physical-DMXconnector">';
  str += '<label>DMX connector</label>';
  str += textInput(properties.physical.DMXconnector, 'e.g. 3-pin', 'physical-DMXconnector');
  str += '</section>';

  str += '<h4>Bulb</h4>';

  str += '<section class="physical-bulb-type">';
  str += '<label>Bulb type</label>';
  str += textInput(properties.bulb.type, 'e.g. LED', 'physical-bulb-type');
  str += '</section>';

  str += '<section class="physical-bulb-colorTemperature">';
  str += '<label>Color temperature</label>';
  str += numberInput(properties.bulb.colorTemperature) + ' K';
  str += '</section>';

  str += '<section class="physical-bulb-lumens">';
  str += '<label>Lumens</label>';
  str += numberInput(properties.bulb.lumens) + ' lm';
  str += '</section>';

  str += '<h4>Lens</h4>';

  str += '<section class="physical-lens-name">';
  str += '<label>Lens name</label>';
  str += textInput(properties.lens.name);
  str += '</section>';

  str += '<section class="physical-lens-degrees">';
  str += '<label>Light cone</label>';
  str += '<div class="value">';
  str += numberInput(properties.lens.degreesMinMax.items, 'min') + ' .. ';
  str += numberInput(properties.lens.degreesMinMax.items, 'max') + ' °';
  str += '</div>';
  str += '</section>';

  str += '<h4>Focus</h4>';

  str += '<section class="physical-focus-type">';
  str += '<label>Focus type</label>';
  str += textInput(properties.focus.type, '', 'physical-focus-type');
  str += '</section>';

  str += '<section class="physical-focus-panMax">';
  str += '<label>Pan maximum</label>';
  str += numberInput(properties.focus.panMax, '', 'physical-focus-panMax') + ' °';
  str += '</section>';

  str += '<section class="physical-focus-tiltMax">';
  str += '<label>Tilt maximum</label>';
  str += numberInput(properties.focus.tiltMax, '', 'physical-focus-tiltMax') + ' °';
  str += '</section>';

  str += '</template>'; // Physical template


  str += '<button class="save-fixture">Save</button>';

  str += '</form>';


  str += '<script src="/client-fixture-editor.js"></script>';

  str += require('../includes/footer')(options);

  return str;
};


function textInput(property, hint, id) {
  let html = '<input type="text" ';
  html += getRequiredAttr(property);

  if (property.enum) {
    html += `list="${id}-list"`;
  }

  html += getPlaceholderAttr(hint);
  html += '/>';

  if (property.enum) {
    html += `<datalist id="${id}-list">`;
    for (const item of property.enum) {
      html += `<option>${item}</option>`;
    }
    html += '</datalist>';
  }

  return html;
}

function urlInput(property, hint) {
  let html = '<input type="url" ';
  html += getRequiredAttr(property);
  html += getPlaceholderAttr(hint);
  html += '/>';
  return html;
}

function textareaInput(property, hint) {
  let html = '<textarea ';
  html += getRequiredAttr(property);
  html += getPlaceholderAttr(hint);
  html += '></textarea>';
  return html;
}

function numberInput(property, hint) {
  let html = '<input type="number" step="any" ';
  html += getRequiredAttr(property);

  if (property.minimum !== undefined) {
    html += ` min="${property.minimum}"`;
  }

  if (property.maximum !== undefined) {
    html += ` max="${property.maximum}"`;
  }

  html += getPlaceholderAttr(hint);
  html += '/>';

  return html;
}

function getRequiredAttr(property) {
  return property.required ? 'required ' : '';
}
function getPlaceholderAttr(hint) {
  return hint ? `placeholder="${hint}" ` : '';
}