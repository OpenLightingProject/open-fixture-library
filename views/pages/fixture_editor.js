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

  // Existing manufacturer
  str += '<section class="manufacturer-shortName">';
  str += '<label>';
  str += '<span class="label">Choose from list</span>';
  str += `<select required>`;
  str += `<option value="">Please select a manufacturer</option>`;
  for (const man in options.manufacturers) {
    str += `<option value="${man}">${options.manufacturers[man].name}</option>`;
  }
  str += '</select></label>';
  str += '<div class="button-bar">or <a href="#" class="add-manufacturer">add a new manufacturer</a></div>';
  str += '</section>'; // .manufacturer-shortName (existing manufacturer)

  // New manufacturer
  str += '<section class="new-manufacturer">';
  str += '<section class="new-manufacturer-name">';
  str += '<label>';
  str += '<span class="label">Name</span>';
  str += textInput(properties.manufacturer.name);
  str += '</label>';
  str += '</section>';

  str += '<section class="new-manufacturer-shortName">';
  str += '<label>';
  str += '<span class="label">Unique short name</span>';
  str += '<input type="text" required pattern="[a-z0-9\-]+" />';
  str += '</label>';
  str += '</section>';

  str += '<section class="new-manufacturer-website">';
  str += '<label>';
  str += '<span class="label">Website</span>';
  str += urlInput(properties.manufacturer.website);
  str += '</label>';
  str += '</section>';

  str += '<section class="new-manufacturer-comment">';
  str += '<label>';
  str += '<span class="label">Comment</span>';
  str += textInput(properties.manufacturer.comment);
  str += '</label>';
  str += '</section>';
  str += '<div class="button-bar">or <a href="#" class="use-existing-manufacturer">choose an existing manufacturer</a></div>';
  str += '</section>'; // .new-manufacturer

  str += '</section>'; // .manufacturer


  // Fixture info
  str += '<section class="fixture-info card">';
  str += '<h2>Fixture info</h2>';

  str += '<section class="fixture-name">';
  str += '<label>';
  str += '<span class="label">Name</span>';
  str += textInput(properties.fixture.name);
  str += '</label>';
  str += '</section>';

  str += '<section class="fixture-shortName">';
  str += '<label>';
  str += '<span class="label">Unique short name</span>';
  str += textInput(properties.fixture.shortName, 'defaults to name');
  str += '</label>';
  str += '</section>';

  str += '<section class="categories">';
  str += '<label>';
  str += '<span class="label">Categories</span>';
  str += `<select multiple required size="${Object.keys(options.register.categories).length}">`;
  for (const cat of properties.category.enum) {
    str += `<option>${cat}</option>`;
  }
  str += '</select></label>';
  str += '</section>';

  str += '<section class="comment">';
  str += '<label>';
  str += '<span class="label">Comment</span>';
  str += textareaInput(properties.fixture.comment);
  str += '</label>';
  str += '</section>';

  str += '<section class="manualURL">';
  str += '<label>';
  str += '<span class="label">Manual URL</span>';
  str += urlInput(properties.fixture.manualURL);
  str += '</label>';
  str += '</section>';

  str += '</section>'; // .fixture-info


  // Fixture physical
  str += '<section class="physical card">';
  str += '<h2>Physical data</h2>';
  str += '</section>';


  // Fixture modes
  str += '<section class="fixture-modes">';
  str += '<a class="fixture-mode card" href="#">';
  str += '<h2>+ Add mode</h2>'
  str += '</a>';
  str += '<div class="clearfix"></div>';
  str += '</section>'; // .fixture-modes



  // Physical template
  str += '<template class="template-physical">';

  str += '<section class="physical-dimensions">';
  str += '<span class="label">Dimensions</span>';
  str += '<div class="value">';
  str += numberInput(properties.physical.dimensions.items, 'width') + ' &times; ';
  str += numberInput(properties.physical.dimensions.items, 'height') + ' &times; ';
  str += numberInput(properties.physical.dimensions.items, 'depth') + ' mm';
  str += '</div>';
  str += '</section>';

  str += '<section class="physical-weight">';
  str += '<label>';
  str += '<span class="label">Weight</span>';
  str += numberInput(properties.physical.weight) + ' kg';
  str += '</label>';
  str += '</section>';

  str += '<section class="physical-power">';
  str += '<label>';
  str += '<span class="label">Power</span>';
  str += numberInput(properties.physical.power) + ' W';
  str += '</label>';
  str += '</section>';

  str += '<section class="physical-DMXconnector">';
  str += '<label>';
  str += '<span class="label">DMX connector</span>';
  str += selectInput(properties.physical.DMXconnector, 'other DMX connector', 'physical-DMXconnector');
  str += '</label>';
  str += '</section>';

  str += '<h4>Bulb</h4>';

  str += '<section class="physical-bulb-type">';
  str += '<label>';
  str += '<span class="label">Bulb type</span>';
  str += textInput(properties.bulb.type, 'e.g. LED', 'physical-bulb-type');
  str += '</label>';
  str += '</section>';

  str += '<section class="physical-bulb-colorTemperature">';
  str += '<label>';
  str += '<span class="label">Color temperature</span>';
  str += numberInput(properties.bulb.colorTemperature) + ' K';
  str += '</label>';
  str += '</section>';

  str += '<section class="physical-bulb-lumens">';
  str += '<label>';
  str += '<span class="label">Lumens</span>';
  str += numberInput(properties.bulb.lumens) + ' lm';
  str += '</label>';
  str += '</section>';

  str += '<h4>Lens</h4>';

  str += '<section class="physical-lens-name">';
  str += '<label>';
  str += '<span class="label">Lens name</span>';
  str += textInput(properties.lens.name);
  str += '</label>';
  str += '</section>';

  str += '<section class="physical-lens-degrees">';
  str += '<span class="label">Light cone</span>';
  str += '<div class="value">';
  str += numberInput(properties.lens.degreesMinMax.items, 'min') + ' .. ';
  str += numberInput(properties.lens.degreesMinMax.items, 'max') + ' °';
  str += '</div>';
  str += '</section>';

  str += '<h4>Focus</h4>';

  str += '<section class="physical-focus-type">';
  str += '<label>';
  str += '<span class="label">Focus type</span>';
  str += selectInput(properties.focus.type, 'other focus type', 'physical-focus-type');
  str += '</label>';
  str += '</section>';

  str += '<section class="physical-focus-panMax">';
  str += '<label>';
  str += '<span class="label">Pan maximum</span>';
  str += numberInput(properties.focus.panMax, '', 'physical-focus-panMax') + ' °';
  str += '</label>';
  str += '</section>';

  str += '<section class="physical-focus-tiltMax">';
  str += '<label>';
  str += '<span class="label">Tilt maximum</span>';
  str += numberInput(properties.focus.tiltMax, '', 'physical-focus-tiltMax') + ' °';
  str += '</label>';
  str += '</section>';

  str += '</template>'; // .template-physical


  // Mode template
  str += '<template class="template-mode">';
  str += '<section class="fixture-mode card">';

  str += '<a class="remove-mode" href="#">';
  str += 'Remove mode';
  str += require('../includes/svg')({svgBasename: 'close'});
  str += '</a>';

  str += '<h2>Mode</h2>'

  str += '<section class="mode-name">';
  str += '<label>';
  str += '<span class="label">Name</span>';
  str += textInput(properties.mode.name);
  str += '</label>';
  str += '</section>';

  str += '<section class="mode-shortName">';
  str += '<label>';
  str += '<span class="label">Unique short name</span>';
  str += textInput(properties.mode.shortName, 'defaults to name');
  str += '</label>';
  str += '</section>';

  str += '<h3>Physical override</h3>';

  str += '<label>';
  str += '<input type="checkbox" class="use-physical-override" />';
  str += 'Enable physical override';
  str += '</label>';
  str += '<section class="physical-override">';
  str += '</section>';

  str += '</section>'; // .fixture-mode
  str += '</template>'; // .template-mode


  str += '<div class="button-bar">';
  str += '<button class="save-fixture">Save</button>';
  str += '</div>';

  str += '</form>';


  str += '<script src="/js/fixture-editor.js"></script>';

  str += require('../includes/footer')(options);

  return str;
};


function textInput(property, hint, id) {
  let html = '<input type="text"';
  html += getRequiredAttr(property);

  if (property.enum) {
    html += ` list="${id}-list"`;
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
  let html = '<input type="url"';
  html += getRequiredAttr(property);
  html += getPlaceholderAttr(hint);
  html += '/>';
  return html;
}

function textareaInput(property, hint) {
  let html = '<textarea';
  html += getRequiredAttr(property);
  html += getPlaceholderAttr(hint);
  html += '></textarea>';
  return html;
}

function numberInput(property, hint) {
  let html = '<input type="number" step="any"';
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

function selectInput(property, hint, allowAdditions=true) {
  let html = '<select';
  html += getRequiredAttr(property);
  html += allowAdditions ? ' data-allow-additions="true"' : '';
  html += '>';

  html += '<option value="">unknown</option>';
  for (const item of property.enum) {
    html += `<option value="${item}">${item}</option>`;
  }

  html += allowAdditions ? `<option value="[add-value]">${hint}</option>` : '';

  html += '</select>';

  html += allowAdditions ? ' <input type="text" class="addition"' + getPlaceholderAttr(hint) + ' required disabled />' : '';

  return html;
}

function getRequiredAttr(property) {
  return property.required ? ' required' : '';
}
function getPlaceholderAttr(hint) {
  return hint ? ` placeholder="${hint}"` : '';
}