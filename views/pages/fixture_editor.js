const path = require('path');
const properties = require(path.join(__dirname, '..', '..', 'fixtures', 'schema')).properties;
// console.log(properties);

module.exports = function(options) {
  options.title = 'Fixture Editor - Open Fixture Library';

  let str = require('../includes/header')(options);

  str += '<h1>Fixture Editor</h1>';

  str += '<noscript>Please enable JavaScript to use the Fixture Editor!</noscript>';

  str += '<form id="fixture-editor" action="#">';


  // Manufacturer
  str += '<section class="manufacturer card">';
  str += '<h2>Manufacturer</h2>';

  // Existing manufacturer
  str += '<section class="manufacturer-shortName">';
  str += '<label>';
  str += '<span class="label">Choose from list</span>';
  str += `<select required data-key="manufacturer-shortName">`;
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
  str += textInput('new-manufacturer-name', properties.manufacturer.name);
  str += '</label>';
  str += '</section>';

  str += '<section class="new-manufacturer-shortName">';
  str += '<label>';
  str += '<span class="label">Unique short name</span>';
  str += '<input type="text" required pattern="[a-z0-9\-]+" title="Use only lowercase letters, numbers and dashes." data-key="new-manufacturer-shortName" />';
  str += '</label>';
  str += '</section>';

  str += '<section class="new-manufacturer-website">';
  str += '<label>';
  str += '<span class="label">Website</span>';
  str += urlInput('new-manufacturer-website', properties.manufacturer.website);
  str += '</label>';
  str += '</section>';

  str += '<section class="new-manufacturer-comment">';
  str += '<label>';
  str += '<span class="label">Comment</span>';
  str += textInput('new-manufacturer-comment', properties.manufacturer.comment);
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
  str += textInput('name', properties.fixture.name);
  str += '</label>';
  str += '</section>';

  str += '<section class="fixture-shortName">';
  str += '<label>';
  str += '<span class="label">Unique short name</span>';
  str += textInput('shortName', properties.fixture.shortName, 'defaults to name');
  str += '</label>';
  str += '</section>';

  str += '<section class="categories">';
  str += '<label>';
  str += '<span class="label">Categories</span>';
  str += `<select multiple required size="${Object.keys(options.register.categories).length}" data-key="categories">`;
  for (const cat of properties.category.enum) {
    str += `<option value="${cat}">${cat}</option>`;
  }
  str += '</select></label>';
  str += '</section>';

  str += '<section class="comment">';
  str += '<label>';
  str += '<span class="label">Comment</span>';
  str += textareaInput('comment', properties.fixture.comment);
  str += '</label>';
  str += '</section>';

  str += '<section class="manualURL">';
  str += '<label>';
  str += '<span class="label">Manual URL</span>';
  str += urlInput('manualURL', properties.fixture.manualURL);
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
  str += '<h2>+ Add mode</h2>';
  str += '</a>';
  str += '<div class="clearfix"></div>';
  str += '</section>'; // .fixture-modes


  // User
  str += '<section class="user card">';
  str += '<h2>Author data</h2>';

  str += '<section class="author">';
  str += '<label>';
  str += '<span class="label">Your name</span>';
  str += '<span class="value">';
  str += '<input type="text" placeholder="e.g. Anonymous" required data-key="meta-author" />';
  str += '<span class="hint">You can instead enter your GitHub username to be mentioned in the pull request.</span>';
  str += '</span>';
  str += '</label>';
  str += '</section>';

  str += '<section class="honeypot" hidden aria-hidden="true">';
  str += '<label>';
  str += '<span class="label">Ignore this!</span>';
  str += '<span class="value">';
  str += '<input type="text" />';
  str += '<span class="hint">Spammers are likely to fill this field. Leave it empty to show that you\'re a human.</span>';
  str += '</span>';
  str += '</label>';
  str += '</section>';

  str += '</section>'; // .user



  // Physical template
  str += '<template id="template-physical">';

  str += '<section class="physical-dimensions">';
  str += '<span class="label">Dimensions</span>';
  str += '<span class="value">';
  str += numberInput('physical-dimensions-width', properties.physical.dimensions.items, 'width') + ' &times; ';
  str += numberInput('physical-dimensions-height', properties.physical.dimensions.items, 'height') + ' &times; ';
  str += numberInput('physical-dimensions-depth', properties.physical.dimensions.items, 'depth') + ' mm';
  str += '</span>';
  str += '</section>';

  str += '<section class="physical-weight">';
  str += '<label>';
  str += '<span class="label">Weight</span>';
  str += numberInput('physical-weight', properties.physical.weight) + ' kg';
  str += '</label>';
  str += '</section>';

  str += '<section class="physical-power">';
  str += '<label>';
  str += '<span class="label">Power</span>';
  str += numberInput('physical-power', properties.physical.power) + ' W';
  str += '</label>';
  str += '</section>';

  str += '<section class="physical-DMXconnector">';
  str += '<label>';
  str += '<span class="label">DMX connector</span>';
  str += selectInput('physical-DMXconnector', properties.physical.DMXconnector, 'other DMX connector', 'physical-DMXconnector');
  str += '</label>';
  str += '</section>';

  str += '<h4>Bulb</h4>';

  str += '<section class="physical-bulb-type">';
  str += '<label>';
  str += '<span class="label">Bulb type</span>';
  str += textInput('physical-bulb-type', properties.bulb.type, 'e.g. LED', 'physical-bulb-type');
  str += '</label>';
  str += '</section>';

  str += '<section class="physical-bulb-colorTemperature">';
  str += '<label>';
  str += '<span class="label">Color temperature</span>';
  str += numberInput('physical-bulb-colorTemperature', properties.bulb.colorTemperature) + ' K';
  str += '</label>';
  str += '</section>';

  str += '<section class="physical-bulb-lumens">';
  str += '<label>';
  str += '<span class="label">Lumens</span>';
  str += numberInput('physical-bulb-lumens', properties.bulb.lumens) + ' lm';
  str += '</label>';
  str += '</section>';

  str += '<h4>Lens</h4>';

  str += '<section class="physical-lens-name">';
  str += '<label>';
  str += '<span class="label">Lens name</span>';
  str += textInput('physical-lens-name', properties.lens.name);
  str += '</label>';
  str += '</section>';

  str += '<section class="physical-lens-degrees">';
  str += '<span class="label">Light cone</span>';
  str += '<span class="value">';
  str += numberInput('physical-lens-degrees-min', properties.lens.degreesMinMax.items, 'min') + ' .. ';
  str += numberInput('physical-lens-degrees-max', properties.lens.degreesMinMax.items, 'max') + ' °';
  str += '</span>';
  str += '</section>';

  str += '<h4>Focus</h4>';

  str += '<section class="physical-focus-type">';
  str += '<label>';
  str += '<span class="label">Focus type</span>';
  str += selectInput('physical-focus-type', properties.focus.type, 'other focus type', 'physical-focus-type');
  str += '</label>';
  str += '</section>';

  str += '<section class="physical-focus-panMax">';
  str += '<label>';
  str += '<span class="label">Pan maximum</span>';
  str += numberInput('physical-focus-panMax', properties.focus.panMax, '', 'physical-focus-panMax') + ' °';
  str += '</label>';
  str += '</section>';

  str += '<section class="physical-focus-tiltMax">';
  str += '<label>';
  str += '<span class="label">Tilt maximum</span>';
  str += numberInput('physical-focus-tiltMax', properties.focus.tiltMax, '', 'physical-focus-tiltMax') + ' °';
  str += '</label>';
  str += '</section>';

  str += '</template>'; // #template-physical


  // Mode template
  str += '<template id="template-mode">';
  str += '<section class="fixture-mode card">';

  str += '<a class="close" href="#">';
  str += 'Remove mode';
  str += require('../includes/svg')({svgBasename: 'close'});
  str += '</a>';

  str += '<h2>Mode</h2>';

  str += '<section class="mode-name">';
  str += '<label>';
  str += '<span class="label">Name</span>';
  str += '<input type="text"' + getRequiredAttr(properties.mode.name) + ' pattern="^((?!mode)(?!Mode).)*$" title="The name must not contain the word \'mode\'." placeholder="e.g. Extended" data-key="name" />';
  str += '</label>';
  str += '</section>';

  str += '<section class="mode-shortName">';
  str += '<label>';
  str += '<span class="label">Unique short name</span>';
  str += '<input type="text"' + getRequiredAttr(properties.mode.shortName) + ' pattern="^((?!mode)(?!Mode).)*$" title="The name must not contain the word \'mode\'." placeholder="e.g. ext; defaults to name" data-key="shortName" />';
  str += '</label>';
  str += '</section>';

  str += '<h3>Physical override</h3>';

  str += '<label>';
  str += '<input type="checkbox" class="enable-physical-override" data-key="enable-physical-override" />';
  str += 'Enable physical override';
  str += '</label>';
  str += '<section class="physical-override">';
  str += '</section>';

  str += '<h3>Channels</h3>';
  str += '<ol class="mode-channels"></ol>';
  str += '<a href="#channel-dialog" class="add-channel">add channel</a>';

  str += '</section>'; // .fixture-mode
  str += '</template>'; // #template-mode


  // Channel list item template
  str += '<template id="template-channel-li">';
  str += '<li data-channel-key="">';
  str += '<span class="display-name"></span>';
  str += '<a href="#remove" class="remove" title="Remove channel">' + require('../includes/svg')({svgBasename: 'close'}) + '</a>';
  str += '<a href="#channel-editor" class="edit" title="Edit channel">' + require('../includes/svg')({svgBasename: 'pencil'}) + '</a>';
  str += '</li>';
  str += '</template>'; // # template-channel-li


  str += '<div class="button-bar right">';
  str += '<button type="submit" class="save-fixture primary" disabled>Create fixture</button>';
  str += '</div>';

  str += '</form>';


  options.dialogs = [
    {
      id: 'channel-dialog',
      title: '<span data-edit-modes="add-existing">Add channel to mode </span><span data-edit-modes="create">Create new channel for mode </span><span class="mode-name" data-edit-modes="create add-existing"></span><span data-edit-modes="edit-all edit-duplicate">Edit channel</span>',
      content: getChannelDialogString(),
      cancellable: true
    },
    {
      id: 'choose-channel-edit-mode-dialog',
      title: 'Edit channel in all modes or just in this one?',
      content: getChooseChannelEditModeDialogString(),
      cancellable: false
    },
    {
      id: 'restore-dialog',
      title: 'Auto-saved fixture data found',
      content: getRestoreDialogString(),
      cancellable: false
    },
    {
      id: 'submit-dialog',
      title: 'Submitting your new fixture...',
      content: getSubmitDialogString(),
      cancellable: false
    }
  ];

  str += '<script type="text/javascript" src="/js/fixture-editor.js" async></script>';

  str += require('../includes/footer')(options);

  return str;
};

function getRestoreDialogString() {
  let str = 'Do you want to restore the data (auto-saved <time></time>) to continue to create the fixture?';
  str += '<div class="button-bar right">';
  str += '<button class="discard secondary">Discard data</button> ';
  str += '<button class="restore primary">Restore to continue work</button>';
  str += '</div>';

  return str;
}

function getChannelDialogString() {
  let str = '<form action="#">';

  str += '<div data-edit-modes="add-existing">';
  str += '<select size="10" required data-key="key"></select>';
  str += ' or <a href="#channel-dialog" class="create-channel">create a new channel</a>';
  str += '</div>';

  str += '<div data-edit-modes="create edit-all edit-duplicate">';

  str += '<section class="channel-name">';
  str += '<label>';
  str += '<span class="label">Name</span>';
  str += '<input type="text" required data-key="name" />';
  str += '</label>';
  str += '</section>';

  str += '<section class="channel-type">';
  str += '<label>';
  str += '<span class="label">Type</span>';
  str += selectInput('type', properties.channel.type, 'other channel type', 'channel-type');
  str += '</label>';
  str += '</section>';

  str += '<section class="channel-color">';
  str += '<label>';
  str += '<span class="label">Color</span>';
  str += selectInput('color', properties.channel.color, 'other channel color', 'channel-type', true);
  str += '</label>';
  str += '</section>';

  str += '<h3>DMX values</h3>';

  str += '<section class="channel-16bit">';
  str += '<label>';
  str += '<input type="checkbox" data-key="16bit" disabled> <strike>Is 16-bit channel?</strike> (not yet implemented)';
  str += '</label>';
  str += '</section>';

  str += '<section class="channel-defaultValue">';
  str += '<label>';
  str += '<span class="label">Default</span>';
  str += numberInput('defaultValue', properties.channel.defaultValue);
  str += '</label>';
  str += '</section>';

  str += '<section class="channel-highlightValue">';
  str += '<label>';
  str += '<span class="label">Highlight</span>';
  str += numberInput('highlightValue', properties.channel.highlightValue);
  str += '</label>';
  str += '</section>';

  str += '<section class="channel-invert">';
  str += '<label>';
  str += '<span class="label">Invert?</span>';
  str += booleanInput('invert', properties.channel.invert);
  str += '</label>';
  str += '</section>';

  str += '<section class="channel-constant">';
  str += '<label>';
  str += '<span class="label">Constant?</span>';
  str += booleanInput('constant', properties.channel.constant);
  str += '</label>';
  str += '</section>';

  str += '<section class="channel-crossfade">';
  str += '<label>';
  str += '<span class="label">Crossfade?</span>';
  str += booleanInput('crossfade', properties.channel.crossfade);
  str += '</label>';
  str += '</section>';

  str += '<section class="channel-precedence">';
  str += '<label>';
  str += '<span class="label">Precedence</span>';
  str += selectInput('precedence', properties.channel.precedence, null, false);
  str += '</label>';
  str += '</section>';

  str += '</div>';  // [data-edit-modes]

  str += '<div class="button-bar right">';
  str += '<button type="submit" class="primary"><span data-edit-modes="add-existing">Add channel</span><span data-edit-modes="create">Create channel</span><span data-edit-modes="edit-all edit-duplicate">Save changes</span></button>';
  str += '</div>';

  str += '</form>';

  return str;
}

function getChooseChannelEditModeDialogString() {
  let str = '<div class="button-bar right">';
  str += '<button class="secondary" data-action="edit-duplicate">Only in this mode</button> ';
  str += '<button class="primary" data-action="edit-all">In all modes</button>';
  str += '</div>';

  return str;
}

function getSubmitDialogString() {
  let str = '<div class="state loading">';
  str += 'Uploading...';
  str += '</div>';  // .loading

  str += '<div class="state success">';
  str += 'Your fixture was successfully uploaded to GitHub (see the <a href="#" class="pull-request-url" target="_blank">pull request</a>). It will be now reviewed and then merged into the library. Thank you for your contribution!';
  str += '<div class="button-bar right">';
  str += '<button class="primary" data-action="home">Back to homepage</button> ';
  str += '<button class="secondary" data-action="restart">Create another fixture</button>';
  str += '</div>';
  str += '</div>';  // .success

  str += '<div class="state error">';
  str += 'Unfortunately, there was an error while uploading. Please copy the following data and <a href="https://github.com/FloEdelmann/open-fixture-library/issues/new" target="_blank">manually submit them to GitHub</a>.';
  str += '<pre></pre>';
  str += '<div class="button-bar right">';
  str += '<button class="primary" data-action="home">Back to homepage</button>';
  str += '</div>';
  str += '</div>';  // .error

  str += '<div class="state invalid">';
  str += 'Unfortunately, the fixture you uploaded was invalid. Please correct the following mistakes before trying again.';
  str += '<pre></pre>';
  str += '<div class="button-bar right">';
  str += '<button class="primary" data-action="home">Back to homepage</button>';
  str += '</div>';
  str += '</div>';  // .invalid

  return str;
}


function textInput(key, property, hint, id) {
  let html = '<input type="text"';
  html += getRequiredAttr(property);

  if (property.enum) {
    html += ` list="${id}-list"`;
  }

  html += getPlaceholderAttr(hint);
  html += ` data-key="${key}" />`;

  if (property.enum) {
    html += `<datalist id="${id}-list">`;
    for (const item of property.enum) {
      html += `<option>${item}</option>`;
    }
    html += '</datalist>';
  }

  return html;
}

function urlInput(key, property, hint) {
  let html = '<input type="url"';
  html += getRequiredAttr(property);
  html += getPlaceholderAttr(hint);
  html += ` data-key="${key}" />`;
  return html;
}

function textareaInput(key, property, hint) {
  let html = '<textarea';
  html += getRequiredAttr(property);
  html += getPlaceholderAttr(hint);
  html += ` data-key="${key}"></textarea>`;
  return html;
}

function numberInput(key, property, hint) {
  let html = '<input type="number" step="any"';
  html += getRequiredAttr(property);

  if (property.minimum !== undefined) {
    html += ` min="${property.minimum}"`;
  }

  if (property.maximum !== undefined) {
    html += ` max="${property.maximum}"`;
  }

  html += getPlaceholderAttr(hint);
  html += ` data-key="${key}" />`;

  return html;
}

function selectInput(key, property, hint, allowAdditions=true, forceRequired=false) {
  let html = '<select';
  html += getRequiredAttr(property, forceRequired);
  html += allowAdditions ? ' data-allow-additions="true"' : '';
  html += ` data-key="${key}">`;

  html += '<option value="">unknown</option>';
  for (const item of property.enum) {
    html += `<option value="${item}">${item}</option>`;
  }

  html += allowAdditions ? `<option value="[add-value]">${hint}</option>` : '';

  html += '</select>';

  html += allowAdditions ? ` <input type="text" class="addition"${getPlaceholderAttr(hint)} required disabled data-key="${key}-new" />` : '';

  return html;
}

function booleanInput(key, property, hint) {
  let html = `<select${getRequiredAttr(property)} class="boolean" data-key="${key}">`;
  html += '<option value="">unknown</option>';
  html += '<option value="true">yes</option>';
  html += '<option value="false">no</option>';
  html += '</select>';

  return html;
}

function getRequiredAttr(property, forceRequired=false) {
  return forceRequired || property.required ? ' required' : '';
}
function getPlaceholderAttr(hint) {
  return hint ? ` placeholder="${hint}"` : '';
}