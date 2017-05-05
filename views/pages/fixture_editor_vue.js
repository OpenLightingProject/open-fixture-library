const path = require('path');
const properties = require(path.join(__dirname, '..', '..', 'fixtures', 'schema')).properties;
// console.log(properties);

module.exports = function(options) {
  options.title = 'Fixture Editor - Open Fixture Library';

  let str = require('../includes/header')(options);

  str += '<div id="fixture-editor">';
  str += '<h1>Fixture Editor</h1>';

  str += '<noscript>Please enable JavaScript to use the Fixture Editor!</noscript>';

  str += '<form action="#" @submit.prevent="submitFixture">';


  // Manufacturer
  str += '<section class="manufacturer card">';
  str += '<h2>Manufacturer</h2>';

  // Existing manufacturer
  str += '<section v-if="fixture.useExistingManufacturer">';
  str += '<label>';
  str += '<span class="label">Choose from list</span>';
  str += '<select required v-model="fixture.manufacturerShortName">';
  str += '<option value="">Please select a manufacturer</option>';
  for (const man in options.manufacturers) {
    str += `<option value="${man}">${options.manufacturers[man].name}</option>`;
  }
  str += '</select></label>';
  str += '<div class="button-bar">or <a href="#add-new-manufacturer" @click.prevent="newManufacturer">add a new manufacturer</a></div>';
  str += '</section>'; // [v-if="fixture.useExistingManufacturer"]

  // New manufacturer
  str += '<section v-else>';
  str += '<section class="new-manufacturer-name">';
  str += '<label>';
  str += '<span class="label">Name</span>';
  str += textInput('fixture.newManufacturerName', properties.manufacturer.name);
  str += '</label>';
  str += '</section>';

  str += '<section class="new-manufacturer-shortName">';
  str += '<label>';
  str += '<span class="label">Unique short name</span>';
  str += '<input type="text" required pattern="[a-z0-9\-]+" title="Use only lowercase letters, numbers and dashes." v-model="fixture.newManufacturerShortName" />';
  str += '</label>';
  str += '</section>';

  str += '<section class="new-manufacturer-website">';
  str += '<label>';
  str += '<span class="label">Website</span>';
  str += urlInput('fixture.newManufacturerWebsite', properties.manufacturer.website);
  str += '</label>';
  str += '</section>';

  str += '<section class="new-manufacturer-comment">';
  str += '<label>';
  str += '<span class="label">Comment</span>';
  str += textInput('fixture.newManufacturerComment', properties.manufacturer.comment);
  str += '</label>';
  str += '</section>';
  str += '<div class="button-bar">or <a href="#use-existing-manufacturer" @click.prevent="existingManufacturer">choose an existing manufacturer</a></div>';
  str += '</section>'; // [v-else]

  str += '</section>'; // .manufacturer


  // Fixture info
  str += '<section class="fixture-info card">';
  str += '<h2>Fixture info</h2>';

  str += '<section class="fixture-name">';
  str += '<label>';
  str += '<span class="label">Name</span>';
  str += textInput('fixture.name', properties.fixture.name);
  str += '</label>';
  str += '</section>';

  str += '<section class="fixture-shortName">';
  str += '<label>';
  str += '<span class="label">Unique short name</span>';
  str += textInput('fixture.shortName', properties.fixture.shortName, 'defaults to name');
  str += '</label>';
  str += '</section>';

  str += '<section class="categories">';
  str += '<label>';
  str += '<span class="label">Categories</span>';
  str += `<select multiple required size="${Object.keys(options.register.categories).length}" v-model="fixture.categories">`;
  for (const cat of properties.category.enum) {
    str += `<option value="${cat}">${cat}</option>`;
  }
  str += '</select></label>';
  str += '</section>';

  str += '<section class="comment">';
  str += '<label>';
  str += '<span class="label">Comment</span>';
  str += textareaInput('fixture.comment', properties.fixture.comment);
  str += '</label>';
  str += '</section>';

  str += '<section class="manualURL">';
  str += '<label>';
  str += '<span class="label">Manual URL</span>';
  str += urlInput('fixture.manualURL', properties.fixture.manualURL);
  str += '</label>';
  str += '</section>';

  str += '</section>'; // .fixture-info


  // Fixture physical
  str += '<section class="physical card">';
  str += '<h2>Physical data</h2>';
  str += '<physical-data v-model="fixture.physical"></physical-data>';
  str += '</section>';


  // Fixture modes
  str += '<section class="fixture-modes">';
  str += '<fixture-mode v-for="(mode, index) in fixture.modes" :mode="mode" :fixture="fixture" :channel="channel" :key="mode.uuid" @remove="fixture.modes.splice(index, 1)" @open-channel-dialog="openChannelDialog"></fixture-mode>';
  str += '<a class="fixture-mode card" href="#add-mode" @click.prevent="addNewMode">';
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
  str += '<input type="text" placeholder="e.g. Anonymous" required v-model="fixture.metaAuthor" />';
  str += '</label>';
  str += '</section>';

  str += '<section class="github-username">';
  str += '<label>';
  str += '<span class="label">GitHub username</span>';
  str += '<span class="value">';
  str += '<input type="text" v-model="fixture.metaGithubUsername" />';
  str += '<span class="hint">If you want to be mentioned in the pull request.</span>';
  str += '</span>';
  str += '</label>';
  str += '</section>';

  str += '<section class="honeypot" hidden aria-hidden="true">';
  str += '<label>';
  str += '<span class="label">Ignore this!</span>';
  str += '<span class="value">';
  str += '<input type="text" v-model="honeypot" />';
  str += '<span class="hint">Spammers are likely to fill this field. Leave it empty to show that you\'re a human.</span>';
  str += '</span>';
  str += '</label>';
  str += '</section>';

  str += '</section>'; // .user

  str += '<div class="button-bar right">';
  str += '<button type="submit" class="save-fixture primary">Create fixture</button>';
  str += '</div>';

  str += '</form>';

  str += getChannelDialogString();
  str += getChooseChannelEditModeDialogString();
  str += getRestoreDialogString();
  str += getSubmitDialogString();

  str += '</div>';

  str += getPhysicalTemplate();
  str += getModeTemplate();
  str += getCapabilityTemplate();
  str += getDialogTemplate();

  options.footerHtml = '<script type="text/javascript" src="/js/fixture-editor-vue.js" async></script>';

  str += require('../includes/footer')(options);

  return str;
};

function getPhysicalTemplate() {
  let str = '<script type="text/x-template" id="template-physical">';
  str += '<div>';

  str += '<section class="physical-dimensions">';
  str += '<span class="label">Dimensions</span>';
  str += '<span class="value">';
  str += numberInput('value.dimensionsWidth', properties.physical.dimensions.items, 'width', ' :required="dimensionRequired"') + ' &times; ';
  str += numberInput('value.dimensionsHeight', properties.physical.dimensions.items, 'height', ' :required="dimensionRequired"') + ' &times; ';
  str += numberInput('value.dimensionsDepth', properties.physical.dimensions.items, 'depth', ' :required="dimensionRequired"') + ' mm';
  str += '</span>';
  str += '</section>';

  str += '<section class="physical-weight">';
  str += '<label>';
  str += '<span class="label">Weight</span>';
  str += numberInput('value.weight', properties.physical.weight) + ' kg';
  str += '</label>';
  str += '</section>';

  str += '<section class="physical-power">';
  str += '<label>';
  str += '<span class="label">Power</span>';
  str += numberInput('value.power', properties.physical.power) + ' W';
  str += '</label>';
  str += '</section>';

  str += '<section class="physical-DMXconnector">';
  str += '<label>';
  str += '<span class="label">DMX connector</span>';
  str += selectInput('value.DMXconnector', properties.physical.DMXconnector, 'other DMX connector');
  str += '</label>';
  str += '</section>';

  str += '<h4>Bulb</h4>';

  str += '<section class="physical-bulb-type">';
  str += '<label>';
  str += '<span class="label">Bulb type</span>';
  str += textInput('value.bulb.type', properties.bulb.type, 'e.g. LED');
  str += '</label>';
  str += '</section>';

  str += '<section class="physical-bulb-colorTemperature">';
  str += '<label>';
  str += '<span class="label">Color temperature</span>';
  str += numberInput('value.bulb.colorTemperature', properties.bulb.colorTemperature) + ' K';
  str += '</label>';
  str += '</section>';

  str += '<section class="physical-bulb-lumens">';
  str += '<label>';
  str += '<span class="label">Lumens</span>';
  str += numberInput('value.bulb.lumens', properties.bulb.lumens) + ' lm';
  str += '</label>';
  str += '</section>';

  str += '<h4>Lens</h4>';

  str += '<section class="physical-lens-name">';
  str += '<label>';
  str += '<span class="label">Lens name</span>';
  str += textInput('value.lens.name', properties.lens.name);
  str += '</label>';
  str += '</section>';

  str += '<section class="physical-lens-degrees">';
  str += '<span class="label">Light cone</span>';
  str += '<span class="value">';
  str += numberInput('value.lens.degreesMin', properties.lens.degreesMinMax.items, 'min', ' :required="degreesRequired"') + ' .. ';
  str += numberInput('value.lens.degreesMax', properties.lens.degreesMinMax.items, 'max', ' :required="degreesRequired"') + ' °';
  str += '</span>';
  str += '</section>';

  str += '<h4>Focus</h4>';

  str += '<section class="physical-focus-type">';
  str += '<label>';
  str += '<span class="label">Focus type</span>';
  str += selectInput('value.focus.type', properties.focus.type, 'other focus type');
  str += '</label>';
  str += '</section>';

  str += '<section class="physical-focus-panMax">';
  str += '<label>';
  str += '<span class="label">Pan maximum</span>';
  str += numberInput('value.focus.panMax', properties.focus.panMax) + ' °';
  str += '</label>';
  str += '</section>';

  str += '<section class="physical-focus-tiltMax">';
  str += '<label>';
  str += '<span class="label">Tilt maximum</span>';
  str += numberInput('value.focus.tiltMax', properties.focus.tiltMax) + ' °';
  str += '</label>';
  str += '</section>';

  str += '</div>';
  str += '</script>'; // #template-physical

  return str;
}

function getModeTemplate() {
  let str = '<script type="text/x-template" id="template-mode">';
  str += '<section class="fixture-mode card">';

  str += '<a class="close" href="#remove-mode" @click.prevent="$emit(\'remove\')">';
  str += 'Remove mode';
  str += require('../includes/svg')({svgBasename: 'close'});
  str += '</a>';

  str += '<h2>Mode</h2>';

  str += '<section class="mode-name">';
  str += '<label>';
  str += '<span class="label">Name</span>';
  str += '<input type="text"' + getRequiredAttr(properties.mode.name) + ' pattern="^((?!mode)(?!Mode).)*$" title="The name must not contain the word \'mode\'." placeholder="e.g. Extended" v-model="mode.name" />';
  str += '</label>';
  str += '</section>';

  str += '<section class="mode-shortName">';
  str += '<label>';
  str += '<span class="label">Unique short name</span>';
  str += '<input type="text"' + getRequiredAttr(properties.mode.shortName) + ' pattern="^((?!mode)(?!Mode).)*$" title="The name must not contain the word \'mode\'." placeholder="e.g. ext; defaults to name" v-model="mode.shortName" />';
  str += '</label>';
  str += '</section>';

  str += '<h3>Physical override</h3>';

  str += '<label>';
  str += '<input type="checkbox" class="enable-physical-override" v-model="mode.enablePhysicalOverride" />';
  str += 'Enable physical override';
  str += '</label>';
  str += '<section class="physical-override">';
  str += '<physical-data v-model="mode.physical" v-if="mode.enablePhysicalOverride"></physical-data>';
  str += '</section>';

  str += '<h3>Channels</h3>';
  str += '<ol class="mode-channels">';
  str += '<li v-for="(chKey, index) in mode.channels">';
  str += '<span class="display-name">{{ getChannelName(chKey) }}</span>';
  str += '<a href="#remove" title="Remove channel" @click.prevent="mode.channels.splice(index, 1)">' + require('../includes/svg')({svgBasename: 'close'}) + '</a>';
  str += '<a href="#channel-editor" title="Edit channel" @click.prevent="editChannel(chKey)">' + require('../includes/svg')({svgBasename: 'pencil'}) + '</a>';
  str += '</li>';
  str += '</ol>';

  str += '<a href="#add-channel" class="button primary" @click.prevent="addChannel">add channel</a>';

  str += '</section>'; // .fixture-mode
  str += '</script>'; // #template-mode

  return str;
}

function getCapabilityTemplate() {
  let str = '<script type="text/x-template" id="template-capability">';
  str += '<li>';
  str += '<input type="number" :min="startMin" :max="startMax" placeholder="start" v-model.lazy.number="capability.start" :required="isChanged"> .. ';
  str += '<input type="number" :min="endMin" :max="endMax" placeholder="end" v-model.lazy.number="capability.end" :required="isChanged"> ';
  str += '<span class="value">';
  str += '<input type="text" placeholder="name" v-model="capability.name" class="name" :required="isChanged"><br/>';
  str += '<input type="text" placeholder="color" pattern="^#[0-9a-f]{6}$" title="#rrggbb" v-model="capability.color" class="color"> ';
  str += '<input type="text" placeholder="color 2" pattern="^#[0-9a-f]{6}$" title="#rrggbb" v-model="capability.color2" v-if="capability.color !== \'\'" class="color">';
  str += '</span>';
  str += '<a href="#remove" class="remove" title="Remove capability" v-if="isChanged" @click.prevent="remove">' + require('../includes/svg')({svgBasename: 'close'}) + '</a>';
  str += '</li>';
  str += '</script>'; // #template-capability

  return str;
}

function getDialogTemplate() {
  let str = '<script type="text/x-template" id="template-dialog">';

  str += '<div class="dialog-container" aria-hidden="true">';
  str += '  <div class="dialog-overlay" tabindex="-1" @click="overlayClick"></div>';
  str += '  <div class="dialog card" :aria-labelledby="id + \'-dialog-title\'" role="dialog">';
  str += '    <div role="document">';

  str += '      <a href="#close" @click.prevent="hide" class="close" v-if="cancellable">';
  str += 'Close';
  str += require('../includes/svg')({svgBasename: 'close'});
  str += '</a>';

  str += '      <h2 :id="id + \'-dialog-title\'" tabindex="0"><slot name="title"></slot></h2>';
  str += '      <slot></slot>';
  str += '    </div>';  // div[role=document]
  str += '  </div>';  // .dialog
  str += '</div>';  // .dialog-container

  str += '</script>';

  return str;
}


function getRestoreDialogString() {
  let str = '<a11y-dialog id="restore" :cancellable="false" :shown="openDialogs.restore" @show="openDialogs.restore = true" @hide="openDialogs.restore = false">';
  str += '<span slot="title">Auto-saved fixture data found</span>';

  str += 'Do you want to restore the data (auto-saved <time></time>) to continue to create the fixture?';
  str += '<div class="button-bar right">';
  str += '<button class="discard secondary">Discard data</button> ';
  str += '<button class="restore primary">Restore to continue work</button>';
  str += '</div>';

  str += '</a11y-dialog>';

  return str;
}

function getChannelDialogString() {
  let str = '<a11y-dialog id="channel" :cancellable="true" :shown="openDialogs.channel" @show="openDialogs.channel = true" @hide="onChannelDialogClose" ref="channelDialog">';
  str += '<span slot="title">{{ channel.editMode === "add-existing" ? "Add channel to mode " + currentModeDisplayName : channel.editMode === "create" ? "Create new channel for mode " + currentModeDisplayName : "Edit channel" }}</span>';

  str += '<form action="#" @submit.prevent="saveChannel" ref="channelForm">';

  str += '<div v-if="channel.editMode == \'add-existing\'">';
  str += '<select size="10" required v-model="channel.key">';
  str += '<option v-for="chKey in currentModeUnchosenChannels" :value="chKey">{{ chKey }}</option>';
  str += '</select>';
  str += ' or <a href="#create-channel" @click.prevent="channel.editMode = \'create\'">create a new channel</a>';
  str += '</div>';

  str += '<div v-else>';

  str += '<section class="channel-name">';
  str += '<label>';
  str += '<span class="label">Name</span>';
  str += '<input type="text" required v-model="channel.name" />';
  str += '</label>';
  str += '</section>';

  str += '<section class="channel-type">';
  str += '<label>';
  str += '<span class="label">Type</span>';
  str += selectInput('channel.type', properties.channel.type, 'other channel type');
  str += '</label>';
  str += '</section>';

  str += '<section class="channel-color" v-if="channel.type == \'SingleColor\'">';
  str += '<label>';
  str += '<span class="label">Color</span>';
  str += selectInput('channel.color', properties.channel.color, 'other channel color');
  str += '</label>';
  str += '</section>';

  str += '<h3>DMX values</h3>';

  // str += '<section class="channel-16bit">';
  // str += '<label>';
  // str += '<input type="checkbox" v-model="channel.16bit" disabled> <strike>Is 16-bit channel?</strike> (not yet implemented)';
  // str += '</label>';
  // str += '</section>';

  str += '<section class="channel-defaultValue">';
  str += '<label>';
  str += '<span class="label">Default</span>';
  str += numberInput('channel.defaultValue', properties.channel.defaultValue);
  str += '</label>';
  str += '</section>';

  str += '<section class="channel-highlightValue">';
  str += '<label>';
  str += '<span class="label">Highlight</span>';
  str += numberInput('channel.highlightValue', properties.channel.highlightValue);
  str += '</label>';
  str += '</section>';

  str += '<section class="channel-invert">';
  str += '<label>';
  str += '<span class="label">Invert?</span>';
  str += booleanInput('channel.invert', properties.channel.invert);
  str += '</label>';
  str += '</section>';

  str += '<section class="channel-constant">';
  str += '<label>';
  str += '<span class="label">Constant?</span>';
  str += booleanInput('channel.constant', properties.channel.constant);
  str += '</label>';
  str += '</section>';

  str += '<section class="channel-crossfade">';
  str += '<label>';
  str += '<span class="label">Crossfade?</span>';
  str += booleanInput('channel.crossfade', properties.channel.crossfade);
  str += '</label>';
  str += '</section>';

  str += '<section class="channel-precedence">';
  str += '<label>';
  str += '<span class="label">Precedence</span>';
  str += selectInput('channel.precedence', properties.channel.precedence, null, false);
  str += '</label>';
  str += '</section>';

  str += '<h3>Capabilities</h3>';
  str += '<ul class="capabilities">';
  str += '<channel-capability v-for="cap in channel.capabilities" :key="cap.uuid" :capability="cap" :capabilities="channel.capabilities" @scroll-item-inserted="capabilitiesScroll"></channel-capability>';
  str += '</ul>';

  str += '</div>';  // [v-else]

  str += '<div class="button-bar right">';
  str += '<button type="submit" class="primary">{{ channel.editMode === "add-existing" ? "Add channel" : channel.editMode === "create" ? "Create channel" : "Save changes" }}</button>';
  str += '</div>';

  str += '</form>';

  str += '</a11y-dialog>';
  return str;
}

function getChooseChannelEditModeDialogString() {
  let str = '<a11y-dialog id="chooseChannelEditMode" :cancellable="false" :shown="openDialogs.chooseChannelEditMode" @show="openDialogs.chooseChannelEditMode = true" @hide="openDialogs.chooseChannelEditMode = false">';
  str += '<span slot="title">Edit channel in all modes or just in this one?</span>';

  str += '<div class="button-bar right">';
  str += '<button class="secondary" @click.prevent="openChannelDialog(\'edit-duplicate\')">Only in this mode</button> ';
  str += '<button class="primary" @click.prevent="openChannelDialog(\'edit-all\')">In all modes</button>';
  str += '</div>';

  str += '</a11y-dialog>';

  return str;
}

function getSubmitDialogString() {
  let str = '<a11y-dialog id="submit" :cancellable="false" :shown="openDialogs.submit" @show="openDialogs.submit = true" @hide="openDialogs.submit = false">';
  str += '<span slot="title">{{ submit.state === \'loading\' ? \'Submitting your new fixture...\' : submit.state === \'success\' ? \'Upload complete\' : \'Upload failed\' }}</span>';

  str += '<div v-if="submit.state === \'loading\'">';
  str += 'Uploading...';
  str += '</div>';

  str += '<div v-if="submit.state === \'success\'">';
  str += 'Your fixture was successfully uploaded to GitHub (see the <a :href="submit.pullRequestUrl" target="_blank">pull request</a>). It will be now reviewed and then merged into the library. Thank you for your contribution!';
  str += '<div class="button-bar right">';
  str += '<a href="/" class="button secondary">Back to homepage</a> ';
  str += '<a href="/fixture-editor" class="button secondary">Create another fixture</a>';
  str += '<a :href="submit.pullRequestUrl" class="button primary" target="_blank">See pull request</a>';
  str += '</div>';
  str += '</div>';

  str += '<div v-if="submit.state === \'error\'">';
  str += 'Unfortunately, there was an error while uploading. Please copy the following data and <a href="https://github.com/FloEdelmann/open-fixture-library/issues/new" target="_blank">manually submit them to GitHub</a>.';
  str += '<pre>{{ submit.rawData }}</pre>';
  str += '<div class="button-bar right">';
  str += '<a href="/" class="button secondary">Back to homepage</a>';
  str += '<a href="https://github.com/FloEdelmann/open-fixture-library/issues/new" class="button primary" target="_blank">Submit manually</a>';
  str += '</div>';
  str += '</div>';

  // str += '<div v-if="submit.state === \'invalid\'">';
  // str += 'Unfortunately, the fixture you uploaded was invalid. Please correct the following mistakes before trying again.';
  // str += '<pre>{{ submit.mistakes }}</pre>';
  // str += '<div class="button-bar right">';
  // str += '<button class="primary" data-action="home">Back to homepage</button>';
  // str += '</div>';
  // str += '</div>';

  str += '</a11y-dialog>';

  return str;
}


function textInput(key, property, hint, id) {
  let html = '<input type="text"';
  html += getRequiredAttr(property);

  if (property.enum) {
    html += ` list="${id}-list"`;
  }

  html += getPlaceholderAttr(hint);
  html += ` v-model="${key}" />`;

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
  html += ` v-model="${key}" />`;
  return html;
}

function textareaInput(key, property, hint) {
  let html = '<textarea';
  html += getRequiredAttr(property);
  html += getPlaceholderAttr(hint);
  html += ` v-model="${key}"></textarea>`;
  return html;
}

function numberInput(key, property, hint, additionalAttributes='') {
  let html = '<input type="number"';
  html += getRequiredAttr(property);

  if (property.minimum !== undefined) {
    if (/max/i.test(key)) {
      const minKey = key.replace(/([mM])ax/, '$1in');
      html += ` :min="typeof ${minKey} === 'number' ? ${minKey} : ${property.minimum}"`;
    }
    else {
      html += ` min="${property.minimum}"`;
    }
  }

  if (property.maximum !== undefined) {
    if (/min/i.test(key)) {
      const maxKey = key.replace(/([mM])in/, '$1ax');
      html += ` :max="typeof ${maxKey} === 'number' ? ${maxKey} : ${property.maximum}"`;
    }
    else {
      html += ` max="${property.maximum}"`;
    }
  }

  html += ` step="${property.type === 'integer' ? '1' : 'any'}"`;

  html += getPlaceholderAttr(hint);
  html += additionalAttributes;
  html += ` v-model.number="${key}" />`;

  return html;
}

function selectInput(key, property, hint, allowAdditions=true, forceRequired=false) {
  let html = '<select';
  html += getRequiredAttr(property, forceRequired);
  html += allowAdditions ? ' data-allow-additions="true"' : '';
  html += ` v-model="${key}">`;

  html += '<option value="">unknown</option>';
  for (const item of property.enum) {
    html += `<option value="${item}">${item}</option>`;
  }

  html += allowAdditions ? `<option value="[add-value]">${hint}</option>` : '';

  html += '</select>';

  html += allowAdditions ? ` <input type="text" class="addition"${getPlaceholderAttr(hint)} v-if="${key} === '[add-value]'" required v-model="${key}New" />` : '';

  return html;
}

function booleanInput(key, property, hint) {
  let html = `<select${getRequiredAttr(property)} class="boolean" v-model="${key}">`;
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