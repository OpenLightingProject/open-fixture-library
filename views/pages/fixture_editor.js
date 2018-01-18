const svg = require(`../includes/svg.js`);
const properties = require(`../../fixtures/schema.js`).properties;

module.exports = function(options) {
  options.title = `Fixture Editor - Open Fixture Library`;

  let str = require(`../includes/header.js`)(options);

  if (options.query.prefill) {
    try {
      const prefillObjectStr = JSON.stringify(JSON.parse(options.query.prefill));
      str += `<script type="text/javascript">window.oflPrefill = ${prefillObjectStr};</script>`;
    }
    catch (error) {
      console.log(`prefill query could not be parsed: `, options.query.prefill);
    }
  }

  str += `<div id="fixture-editor">`;
  str += `<h1>Fixture Editor</h1>`;

  str += `<noscript>Please enable JavaScript to use the Fixture Editor!</noscript>`;

  str += `<form action="#" id="fixture-form" data-validate>`;


  // Manufacturer
  str += `<section class="manufacturer card">`;
  str += `<h2>Manufacturer</h2>`;

  // Existing manufacturer
  str += `<section v-if="fixture.useExistingManufacturer">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Choose from list</span>`;
  str += `<span class="value">`;
  str += `<select required v-model="fixture.manufacturerShortName" :class="{ empty: fixture.manufacturerShortName === '' }" ref="existingManufacturerSelect">`;
  str += `<option value="">Please select a manufacturer</option>`;
  for (const man of Object.keys(options.manufacturers)) {
    str += `<option value="${man}">${options.manufacturers[man].name}</option>`;
  }
  str += `</select>`;
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `<div class="button-bar">or <a href="#add-new-manufacturer" @click.prevent="switchManufacturer(false)">add a new manufacturer</a></div>`;
  str += `</section>`; // [v-if="fixture.useExistingManufacturer"]

  // New manufacturer
  str += `<div v-else>`;
  str += `<section class="new-manufacturer-name">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Name</span>`;
  str += `<span class="value">`;
  str += textInput(`fixture.newManufacturerName`, properties.manufacturer.name, null, null, ` ref="newManufacturerNameInput"`);
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="new-manufacturer-shortName">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Unique short name</span>`;
  str += `<span class="value">`;
  str += `<input type="text" required pattern="[a-z0-9-]+" title="Use only lowercase letters, numbers and dashes." v-model="fixture.newManufacturerShortName" />`;
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="new-manufacturer-website">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Website</span>`;
  str += `<span class="value">`;
  str += urlInput(`fixture.newManufacturerWebsite`, properties.manufacturer.website);
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="new-manufacturer-comment">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Comment</span>`;
  str += `<span class="value">`;
  str += textInput(`fixture.newManufacturerComment`, properties.manufacturer.comment);
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="new-manufacturer-rdmId">`;
  str += `<label class="validate-group">`;
  str += `<span class="label"><abbr title="Remote Device Management">RDM</abbr> ID</span>`;
  str += `<span class="value">`;
  str += numberInput(`fixture.newManufacturerRdmId`, properties.manufacturer.rdmId);
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<div class="button-bar">or <a href="#use-existing-manufacturer" @click.prevent="switchManufacturer(true)">choose an existing manufacturer</a></div>`;
  str += `</div>`; // [v-else]

  str += `</section>`; // .manufacturer


  // Fixture info
  str += `<section class="fixture-info card">`;
  str += `<h2>Fixture info</h2>`;

  str += `<section class="fixture-name">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Name</span>`;
  str += `<span class="value">`;
  str += textInput(`fixture.name`, properties.fixture.name);
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="fixture-shortName">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Unique short name</span>`;
  str += `<span class="value">`;
  str += textInput(`fixture.shortName`, properties.fixture.shortName, `defaults to name`);
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  const fixtureCategories = JSON.stringify(properties.category.enum.map(
    cat => ({
      name: cat,
      icon: svg.getCategoryIcon(cat)
    })
  )).replace(/"/g, `'`);

  str += `<section class="categories validate-group">`;
  str += `<span class="label">Categories</span>`;
  str += `<span class="value">`;
  str += `<category-chooser :all-categories="${fixtureCategories}" v-model="fixture.categories"></category-chooser>`;
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</section>`;

  str += `<section class="comment">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Comment</span>`;
  str += `<span class="value">`;
  str += textareaInput(`fixture.comment`, properties.fixture.comment);
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="manualURL">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Manual URL</span>`;
  str += `<span class="value">`;
  str += urlInput(`fixture.manualURL`, properties.fixture.manualURL);
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="rdmModelId">`;
  str += `<label class="validate-group">`;
  str += `<span class="label"><abbr title="Remote Device Management">RDM</abbr> model ID</span>`;
  str += `<span class="value">`;
  str += numberInput(`fixture.rdmModelId`, properties.manufacturer.rdmId); // use manufacturer.rdmId's properties to prevent required attribute
  str += `<span class="error-message" hidden></span>`;
  str += `<span class="hint">The RDM manufacturer ID is saved per manufacturer.</span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="rdmSoftwareVersion" v-if="fixture.rdmModelId !== ''">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">RDM software version</span>`;
  str += `<span class="value">`;
  str += textInput(`fixture.rdmSoftwareVersion`, properties.fixture.rdm.properties.softwareVersion);
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `</section>`; // .fixture-info


  // Fixture physical
  str += `<section class="physical card">`;
  str += `<h2>Physical data</h2>`;
  str += `<physical-data v-model="fixture.physical"></physical-data>`;
  str += `</section>`;


  // Fixture modes
  str += `<section class="fixture-modes">`;
  str += `<fixture-mode v-for="(mode, index) in fixture.modes" :mode="mode" :fixture="fixture" :channel="channel" :key="mode.uuid" @remove="fixture.modes.splice(index, 1)"></fixture-mode>`;
  str += `<a class="fixture-mode card" href="#add-mode" @click.prevent="addNewMode">`;
  str += `<h2>+ Add mode</h2>`;
  str += `</a>`;
  str += `<div class="clearfix"></div>`;
  str += `</section>`; // .fixture-modes


  // User
  str += `<section class="user card">`;
  str += `<h2>Author data</h2>`;

  str += `<section class="author">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Your name</span>`;
  str += `<span class="value">`;
  str += `<input type="text" placeholder="e.g. Anonymous" required v-model="fixture.metaAuthor" />`;
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="github-username">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">GitHub username</span>`;
  str += `<span class="value">`;
  str += `<input type="text" v-model="fixture.metaGithubUsername" />`;
  str += `<span class="hint">If you want to be mentioned in the pull request.</span>`;
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="honeypot" hidden aria-hidden="true">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Ignore this!</span>`;
  str += `<span class="value">`;
  str += `<input type="text" v-model="honeypot" />`;
  str += `<span class="hint">Spammers are likely to fill this field. Leave it empty to show that you're a human.</span>`;
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `</section>`; // .user

  str += `<div class="button-bar right">`;
  str += `<button type="submit" class="save-fixture primary">Create fixture</button>`;
  str += `</div>`;

  str += `</form>`;

  str += getChannelDialogString();
  str += getChooseChannelEditModeDialogString();
  str += getRestoreDialogString();
  str += getSubmitDialogString();

  str += `</div>`;

  str += getPhysicalTemplate();
  str += getModeTemplate();
  str += getCapabilityTemplate();
  str += getDialogTemplate();

  options.footerHtml = `<script type="text/javascript" src="/js/fixture-editor.js" async></script>`;

  str += require(`../includes/footer.js`)(options);

  return str;
};

/**
 * @returns {!string} The Vue template for a <div> containing a fixture's or mode's physical information.
 */
function getPhysicalTemplate() {
  let str = `<script type="text/x-template" id="template-physical">`;
  str += `<div>`;

  str += `<section class="physical-dimensions validate-group">`;
  str += `<span class="label">Dimensions</span>`;
  str += `<span class="value">`;
  str += numberInput(`value.dimensionsWidth`, properties.physical.dimensions.items, `width`, ` :required="dimensionRequired" ref="firstInput"`);
  str += ` &times; `;
  str += numberInput(`value.dimensionsHeight`, properties.physical.dimensions.items, `height`, ` :required="dimensionRequired"`);
  str += ` &times; `;
  str += numberInput(`value.dimensionsDepth`, properties.physical.dimensions.items, `depth`, ` :required="dimensionRequired"`);
  str += ` mm`;
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</section>`;

  str += `<section class="physical-weight">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Weight</span>`;
  str += `<span class="value">`;
  str += numberInput(`value.weight`, properties.physical.weight);
  str += ` kg`;
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="physical-power">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Power</span>`;
  str += `<span class="value">`;
  str += numberInput(`value.power`, properties.physical.power);
  str += ` W`;
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="physical-DMXconnector">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">DMX connector</span>`;
  str += `<span class="value">`;
  str += selectInput(`value.DMXconnector`, properties.physical.DMXconnector, `other DMX connector`);
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<h4>Bulb</h4>`;

  str += `<section class="physical-bulb-type">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Bulb type</span>`;
  str += `<span class="value">`;
  str += textInput(`value.bulb.type`, properties.bulb.type, `e.g. LED`);
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="physical-bulb-colorTemperature">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Color temperature</span>`;
  str += `<span class="value">`;
  str += numberInput(`value.bulb.colorTemperature`, properties.bulb.colorTemperature);
  str += ` K`;
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="physical-bulb-lumens">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Lumens</span>`;
  str += `<span class="value">`;
  str += numberInput(`value.bulb.lumens`, properties.bulb.lumens);
  str += ` lm`;
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<h4>Lens</h4>`;

  str += `<section class="physical-lens-name">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Lens name</span>`;
  str += `<span class="value">`;
  str += textInput(`value.lens.name`, properties.lens.name);
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="physical-lens-degrees validate-group">`;
  str += `<span class="label">Light cone</span>`;
  str += `<span class="value">`;
  str += numberInput(`value.lens.degreesMin`, properties.lens.degreesMinMax.items, `min`, ` :required="degreesRequired"`);
  str += ` .. `;
  str += numberInput(`value.lens.degreesMax`, properties.lens.degreesMinMax.items, `max`, ` :required="degreesRequired"`);
  str += ` °`;
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</section>`;

  str += `<h4>Focus</h4>`;

  str += `<section class="physical-focus-type">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Focus type</span>`;
  str += `<span class="value">`;
  str += selectInput(`value.focus.type`, properties.focus.type, `other focus type`);
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="physical-focus-panMax">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Pan maximum</span>`;
  str += `<span class="value">`;
  str += numberInput(`value.focus.panMax`, properties.focus.panMax);
  str += ` °`;
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="physical-focus-tiltMax">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Tilt maximum</span>`;
  str += `<span class="value">`;
  str += numberInput(`value.focus.tiltMax`, properties.focus.tiltMax);
  str += ` °`;
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `</div>`;
  str += `</script>`; // #template-physical

  return str;
}

/**
 * @returns {!string} The Vue template for a mode card.
 */
function getModeTemplate() {
  let str = `<script type="text/x-template" id="template-mode">`;
  str += `<section class="fixture-mode card">`;

  str += `<a class="close" href="#remove-mode" @click.prevent="$emit('remove')">`;
  str += `Remove mode`;
  str += svg.getSvg(`close`);
  str += `</a>`;

  str += `<h2>Mode</h2>`;

  str += `<section class="mode-name">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Name</span>`;
  str += `<span class="value">`;
  str += `<input type="text"${getRequiredAttr(properties.mode.name)} pattern="^((?!mode)(?!Mode).)*$" title="The name must not contain the word 'mode'." placeholder="e.g. Extended" v-model="mode.name" ref="firstInput" />`;
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="mode-shortName">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Unique short name</span>`;
  str += `<span class="value">`;
  str += `<input type="text"${getRequiredAttr(properties.mode.shortName)} pattern="^((?!mode)(?!Mode).)*$" title="The name must not contain the word 'mode'." placeholder="e.g. ext; defaults to name" v-model="mode.shortName" />`;
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="mode-rdmPersonalityIndex" v-if="fixture.rdmModelId !== ''">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">RDM personality index</span>`;
  str += `<span class="value">`;
  str += numberInput(`mode.rdmPersonalityIndex`, properties.mode.rdmPersonalityIndex);
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<h3>Physical override</h3>`;

  str += `<label class="validate-group">`;
  str += `<input type="checkbox" class="enable-physical-override" v-model="mode.enablePhysicalOverride" />`;
  str += `Enable physical override`;
  str += `<span class="error-message" hidden></span>`;
  str += `</label>`;
  str += `<section class="physical-override">`;
  str += `<physical-data v-model="mode.physical" v-if="mode.enablePhysicalOverride"></physical-data>`;
  str += `</section>`;

  str += `<h3>Channels</h3>`;

  str += `<div class="validate-group mode-channels">`;
  str += `<draggable v-model="mode.channels" :options="dragOptions">`;
  str += `  <transition-group class="mode-channels" name="mode-channels" tag="ol">`;
  str += `    <li v-for="(channelUuid, index) in mode.channels" :key="channelUuid" :data-channel-uuid="channelUuid">`;
  str += `      <span class="channel-name">{{ getChannelName(channelUuid) }}</span> `;
  str += `      <code v-if="!isChannelNameUnique(channelUuid)" class="channel-uuid">{{ channelUuid }}</code>`;
  str += `      <a href="#remove" title="Remove channel" @click.prevent="removeChannel(channelUuid)">${svg.getSvg(`close`)}</a>`;
  str += `      <a href="#channel-editor" title="Edit channel" v-if="!isFineChannel(channelUuid)" @click.prevent="editChannel(channelUuid)">${svg.getSvg(`pencil`)}</a>`;
  str += `      <a href="#move" title="Drag to change channel order" class="drag-handle" @click.prevent="">${svg.getSvg(`move`)}</a>`;
  str += `    </li>`;
  str += `  </transition-group>`;
  str += `</draggable>`;
  str += `<span class="error-message" hidden></span>`;
  str += `</div>`;

  str += `<a href="#add-channel" class="button primary" @click.prevent="addChannel">add channel</a>`;

  str += `</section>`; // .fixture-mode
  str += `</script>`; // #template-mode

  return str;
}

/**
 * @returns {!string} The Vue template for a single capability.
 */
function getCapabilityTemplate() {
  let str = `<script type="text/x-template" id="template-capability">`;
  str += `<li class="capability validate-group">`;
  str += `  <input type="number" class="rangeStart" :min="startMin" :max="startMax" placeholder="start" v-model.number="capability.start" :required="isChanged">`;
  str += `  <span class="range-separator">…</span>`;
  str += `  <input type="number" class="rangeEnd" :min="endMin" :max="endMax" placeholder="end" v-model.number="capability.end" :required="isChanged">`;
  str += `  <span class="capability-data">`;
  str += `    <input type="text" placeholder="name" v-model="capability.name" class="name" :required="isChanged"><br/>`;
  str += `    <input type="text" placeholder="color" pattern="^#[0-9a-f]{6}$" title="#rrggbb" v-model="capability.color" class="color"> `;
  str += `    <input type="text" placeholder="color 2" pattern="^#[0-9a-f]{6}$" title="#rrggbb" v-model="capability.color2" v-if="capability.color !== ''" class="color">`;
  str += `  </span>`;
  str += `  <span class="buttons"><a href="#remove" class="remove" title="Remove capability" v-if="isChanged" @click.prevent="remove">${svg.getSvg(`close`)}</a></span>`;
  str += `  <span class="error-message" hidden></span>`;
  str += `</li>`;
  str += `</script>`; // #template-capability

  return str;
}

/**
 * @returns {!string} The Vue template for a dialog.
 */
function getDialogTemplate() {
  let str = `<script type="text/x-template" id="template-dialog">`;

  str += `<div class="dialog-container" aria-hidden="true">`;
  str += `  <div class="dialog-overlay" tabindex="-1" @click="overlayClick"></div>`;
  str += `  <div class="dialog card" :aria-labelledby="id + '-dialog-title'" role="dialog">`;
  str += `    <div role="document">`;

  str += `      <a href="#close" @click.prevent="hide" class="close" v-if="cancellable">`;
  str += `Close`;
  str += svg.getSvg(`close`);
  str += `</a>`;

  str += `      <h2 :id="id + '-dialog-title'" tabindex="0"><slot name="title"></slot></h2>`;
  str += `      <slot></slot>`;
  str += `    </div>`; // div[role=document]
  str += `  </div>`; // .dialog
  str += `</div>`; // .dialog-container

  str += `</script>`;

  return str;
}

/**
 * @returns {!string} The HTML for the restore dialog, using @see getDialogTemplate.
 */
function getRestoreDialogString() {
  let str = `<a11y-dialog id="restore" :cancellable="false" :shown="restoredData !== ''">`;
  str += `<span slot="title">Auto-saved fixture data found</span>`;

  str += `Do you want to restore the data (auto-saved <time>{{ restoredDate }}</time>) to continue to create the fixture?`;
  str += `<div class="button-bar right">`;
  str += `<button class="discard secondary" @click.prevent="discardRestored">Discard data</button> `;
  str += `<button class="restore primary" @click.prevent="applyRestored">Restore to continue work</button>`;
  str += `</div>`;

  str += `</a11y-dialog>`;

  return str;
}

/**
 * @returns {!string} The HTML for the channel editor dialog, using @see getDialogTemplate.
 */
function getChannelDialogString() {
  let str = `<a11y-dialog id="channel" :cancellable="true" :shown="channel.editMode !== '' && channel.editMode !== 'edit-?'" @show="onChannelDialogOpen" @hide="onChannelDialogClose" ref="channelDialog">`;
  str += `<span slot="title">{{ channel.editMode === "add-existing" ? "Add channel to mode " + currentModeDisplayName : channel.editMode === "create" ? "Create new channel" : "Edit channel" }}</span>`;

  str += `<form action="#" id="channel-form" data-validate ref="channelForm">`;

  str += `<div v-if="channel.editMode == 'add-existing'" class="validate-group">`;
  str += `<select size="10" required v-model="channel.uuid">`;
  str += `<option v-for="channelUuid in currentModeUnchosenChannels" :value="channelUuid">`;
  str += `{{ getChannelName(channelUuid) }}`;
  str += `</option>`;
  str += `</select>`;
  str += `<span class="error-message" hidden></span>`;
  str += ` or <a href="#create-channel" @click.prevent="channel.editMode = 'create'">create a new channel</a>`;
  str += `</div>`;

  str += `<div v-else>`;

  str += `<section class="channel-name">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Name</span>`;
  str += `<span class="value">`;
  str += `<input type="text" required v-model="channel.name" pattern="^[A-Z0-9]((?!\\bFine\\b)(?!\\bfine\\b)(?!\\d+(?:\\s|-|_)*[Bb]it)(?!MSB)(?!LSB).)*$" title="Please start with an uppercase letter or a number. Don't create fine channels here, set its resolution below instead." class="channelName" />`;
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="channel-type">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Type</span>`;
  str += `<span class="value">`;
  str += selectInput(`channel.type`, properties.channel.type, `other channel type`);
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="channel-color" v-if="channel.type == 'Single Color'">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Color</span>`;
  str += `<span class="value">`;
  str += selectInput(`channel.color`, properties.channel.color, `other channel color`, true);
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<h3>DMX values</h3>`;

  str += `<section class="channel-fineness">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Channel resolution</span>`;
  str += `<span class="value">`;
  str += `<select required v-model.number="channel.fineness">`;
  str += `<option value="0" selected>8 bit (No fine channels)</option>`;
  str += `<option value="1">16 bit (1 fine channel)</option>`;
  str += `<option value="2">24 bit (2 fine channels)</option>`;
  str += `</select>`;
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="channel-defaultValue">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Default</span>`;
  str += `<span class="value">`;
  str += `<input type="number" min="0" :max="Math.pow(256, channel.fineness+1)-1" step="1" v-model.number="channel.defaultValue" />`;
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="channel-highlightValue">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Highlight</span>`;
  str += `<span class="value">`;
  str += `<input type="number" min="0" :max="Math.pow(256, channel.fineness+1)-1" step="1" v-model.number="channel.highlightValue" />`;
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="channel-invert">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Invert?</span>`;
  str += `<span class="value">`;
  str += booleanInput(`channel.invert`, properties.channel.invert);
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="channel-constant">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Constant?</span>`;
  str += `<span class="value">`;
  str += booleanInput(`channel.constant`, properties.channel.constant);
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="channel-crossfade">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Crossfade?</span>`;
  str += `<span class="value">`;
  str += booleanInput(`channel.crossfade`, properties.channel.crossfade);
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section class="channel-precedence">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Precedence</span>`;
  str += `<span class="value">`;
  str += selectInput(`channel.precedence`, properties.channel.precedence, null);
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<h3>Capabilities</h3>`;

  str += `<section class="channel-cap-fineness" v-if="channel.fineness > 0">`;
  str += `<label class="validate-group">`;
  str += `<span class="label">Capability resolution</span>`;
  str += `<span class="value">`;
  str += `<select required v-model.number="channel.capFineness">`;
  str += `<option value="0" selected>8 bit (range 0 - 255)</option>`;
  str += `<option value="1" v-if="channel.fineness >= 1">16 bit (range 0 - 65535)</option>`;
  str += `<option value="2" v-if="channel.fineness >= 2">24 bit (range 0 - 16777215)</option>`;
  str += `</select>`;
  str += `<span class="error-message" hidden></span>`;
  str += `</span>`;
  str += `</label>`;
  str += `</section>`;

  str += `<section><button class="secondary" @click.prevent="channel.wizard.show = !channel.wizard.show">${svg.getSvg(`capability-wizard`)} {{ channel.wizard.show ? 'Close' : 'Open' }} Capability Wizard</button>`;

  str += `<capability-wizard v-if="channel.wizard.show" :wizard="channel.wizard" :capabilities="channel.capabilities" :fineness="Math.min(channel.fineness, channel.capFineness)" @close="channel.wizard.show = false"></capability-wizard>`;

  str += `<ul class="capability-editor" v-else>`;
  str += `  <channel-capability v-for="(cap, index) in channel.capabilities" :key="cap.uuid" v-model="channel.capabilities" :cap-index="index" :fineness="Math.min(channel.fineness, channel.capFineness)" @scroll-item-inserted="capabilitiesScroll"></channel-capability>`;
  str += `</ul>`;

  str += `</div>`; // [v-else]

  str += `<div class="button-bar right">`;
  str += `<button type="submit" class="primary" :disabled="channel.wizard.show">{{ channel.editMode === "add-existing" ? "Add channel" : channel.editMode === "create" ? "Create channel" : "Save changes" }}</button>`;
  str += `</div>`;

  str += `</form>`;

  str += `</a11y-dialog>`;
  return str;
}

/**
 * @returns {!string} The HTML for the "choose channel edit mode" dialog (allowing the user to choose if a channel should be edited in all modes or only the current mode), using @see getDialogTemplate.
 */
function getChooseChannelEditModeDialogString() {
  let str = `<a11y-dialog id="chooseChannelEditMode" :cancellable="false" :shown="this.channel.editMode === 'edit-?'" @show="onChooseChannelEditModeDialogOpen">`;
  str += `<span slot="title">Edit channel in all modes or just in this one?</span>`;

  str += `<div class="button-bar right">`;
  str += `<button class="secondary" @click.prevent="chooseChannelEditMode('edit-duplicate')">Only in this mode</button> `;
  str += `<button class="primary" @click.prevent="chooseChannelEditMode('edit-all')">In all modes</button>`;
  str += `</div>`;

  str += `</a11y-dialog>`;

  return str;
}

/**
 * @returns {!string} The HTML for the submit dialog, using @see getDialogTemplate.
 */
function getSubmitDialogString() {
  let str = `<a11y-dialog id="submit" :cancellable="false" :shown="submit.state !== 'closed'">`;
  str += `<span slot="title">{{ submit.state === 'loading' ? 'Submitting your new fixture...' : submit.state === 'success' ? 'Upload complete' : 'Upload failed' }}</span>`;

  str += `<div v-if="submit.state === 'loading'">`;
  str += `Uploading...`;
  str += `</div>`;

  str += `<div v-if="submit.state === 'success'">`;
  str += `Your fixture was successfully uploaded to GitHub (see the <a :href="submit.pullRequestUrl" target="_blank">pull request</a>). It will be now reviewed and then merged into the library. Thank you for your contribution!`;
  str += `<div class="button-bar right">`;
  str += `<a href="/" class="button secondary">Back to homepage</a> `;
  str += `<a href="/fixture-editor" class="button secondary">Create another fixture</a> `;
  str += `<a :href="submit.pullRequestUrl" class="button primary" target="_blank">See pull request</a>`;
  str += `</div>`;
  str += `</div>`;

  str += `<div v-if="submit.state === 'error'">`;
  str += `Unfortunately, there was an error while uploading. Please copy the following data and <a href="https://github.com/FloEdelmann/open-fixture-library/issues/new" target="_blank">manually submit them to GitHub</a>.`;
  str += `<pre>{{ submit.rawData }}</pre>`;
  str += `<div class="button-bar right">`;
  str += `<a href="/" class="button secondary">Back to homepage</a> `;
  str += `<a href="https://github.com/FloEdelmann/open-fixture-library/issues/new" class="button primary" target="_blank">Submit manually</a>`;
  str += `</div>`;
  str += `</div>`;

  // str += '<div v-if="submit.state === \'invalid\'">';
  // str += 'Unfortunately, the fixture you uploaded was invalid. Please correct the following mistakes before trying again.';
  // str += '<pre>{{ submit.mistakes }}</pre>';
  // str += '<div class="button-bar right">';
  // str += '<button class="primary" data-action="home">Back to homepage</button>';
  // str += '</div>';
  // str += '</div>';

  str += `</a11y-dialog>`;

  return str;
}


/**
 * @param {!string} key The key in Vue's data model that this text input element is bound to.
 * @param {*} property The JS Schema property that this input element has to obey.
 * @param {?string} hint A hint to the user that helps filling the right value into this input element.
 * @param {?string} id A unique HTML ID for this input element and related elements (like data lists). Only required if property.enum is true.
 * @param {!string} [additionalAttributes=''] Additional HTML attributes that shall be added to the input element.
 * @returns {!string} The input element HTML, possibly together with related elements.
 */
function textInput(key, property, hint, id, additionalAttributes = ``) {
  let html = `<input type="text"`;
  html += getRequiredAttr(property);

  if (property.enum) {
    html += ` list="${id}-list"`;
  }

  html += getPlaceholderAttr(hint);
  html += additionalAttributes;
  html += ` v-model="${key}" />`;

  if (property.enum) {
    html += `<datalist id="${id}-list">`;
    for (const item of property.enum) {
      html += `<option>${item}</option>`;
    }
    html += `</datalist>`;
  }

  return html;
}

/**
 * @param {!string} key The key in Vue's data model that this URL input element is bound to.
 * @param {*} property The JS Schema property that this input element has to obey.
 * @param {?string} hint A hint to the user that helps filling the right value into this input element.
 * @returns {!string} The input element HTML.
 */
function urlInput(key, property, hint) {
  let html = `<input type="url"`;
  html += getRequiredAttr(property);
  html += getPlaceholderAttr(hint);
  html += ` v-model="${key}" />`;
  return html;
}

/**
 * @param {!string} key The key in Vue's data model that this textarea element is bound to.
 * @param {*} property The JS Schema property that this textarea element has to obey.
 * @param {?string} hint A hint to the user that helps filling the right value into this textarea element.
 * @returns {!string} The textarea element HTML.
 */
function textareaInput(key, property, hint) {
  let html = `<textarea`;
  html += getRequiredAttr(property);
  html += getPlaceholderAttr(hint);
  html += ` v-model="${key}"></textarea>`;
  return html;
}

/**
 * @param {!string} key The key in Vue's data model that this number input element is bound to.
 * @param {*} property The JS Schema property that this input element has to obey.
 * @param {?string} hint A hint to the user that helps filling the right value into this input element.
 * @param {!string} [additionalAttributes=''] Additional HTML attributes that shall be added to the input element.
 * @returns {!string} The input element HTML.
 */
function numberInput(key, property, hint, additionalAttributes = ``) {
  let html = `<input type="number"`;
  html += getRequiredAttr(property);

  if (property.minimum !== undefined) {
    if (/max/i.test(key)) {
      const minKey = key.replace(/([mM])ax/, `$1in`);
      html += ` :min="typeof ${minKey} === 'number' ? ${minKey} : ${property.minimum}"`;
    }
    else {
      html += ` min="${property.minimum}"`;
    }
  }

  if (property.maximum !== undefined) {
    if (/min/i.test(key)) {
      const maxKey = key.replace(/([mM])in/, `$1ax`);
      html += ` :max="typeof ${maxKey} === 'number' ? ${maxKey} : ${property.maximum}"`;
    }
    else {
      html += ` max="${property.maximum}"`;
    }
  }

  html += ` step="${property.type === `integer` ? `1` : `any`}"`;

  html += getPlaceholderAttr(hint);
  html += additionalAttributes;
  html += ` v-model.number="${key}" />`;

  return html;
}

/**
 * @param {!string} key The key in Vue's data model that this select element is bound to.
 * @param {*} property The JS Schema property that this select element has to obey.
 * @param {?string} [additionName=null] If not null, the user is able to select an entry with this name, which allows them to enter a custom value in an input next to the select element. The input HTML is also generated here.
 * @param {!boolean} [forceRequired=false] Force this select element to be required, even if the property does not say so.
 * @returns {!string} The select element HTML.
 */
function selectInput(key, property, additionName = null, forceRequired = false) {
  const allowAdditions = additionName !== null;

  let html = `<select`;
  html += getRequiredAttr(property, forceRequired);
  html += allowAdditions ? ` data-allow-additions="true"` : ``;
  html += ` v-model="${key}"`;
  html += ` :class="{ empty: ${key} === '' }">`;

  html += `<option value="">unknown</option>`;
  for (const item of property.enum) {
    html += `<option value="${item}">${item}</option>`;
  }

  html += allowAdditions ? `<option value="[add-value]">${additionName}</option>` : ``;

  html += `</select>`;

  html += allowAdditions ? ` <input type="text" class="addition"${getPlaceholderAttr(additionName)} v-if="${key} === '[add-value]'" v-focus required v-model="${key}New" />` : ``;

  return html;
}

/**
 * There are various ways to represent a boolean input element. Here, a select element with the options "unknown", "yes" and "no" is returned.
 * @param {!string} key The key in Vue's data model that this boolean input element is bound to.
 * @param {*} property The JS Schema property that this boolean input element has to obey.
 * @returns {!string} The boolean input element HTML.
 */
function booleanInput(key, property) {
  let html = `<select`;
  html += getRequiredAttr(property);
  html += ` v-model="${key}"`;
  html += ` class="boolean" :class="{ empty: ${key} === '' }">`;
  html += `<option value="">unknown</option>`;
  html += `<option :value="true">yes</option>`;
  html += `<option :value="false">no</option>`;
  html += `</select>`;

  return html;
}

/**
 * Helper function to return the HTML "required" attribute if neccessary.
 * @param {*} property The JS Schema property that the input element has to obey.
 * @param {!boolean} [forceRequired=false] Force the input element to be required, even if the property does not say so.
 * @returns {!string} The HTML "required" attribute or an empty string.
 */
function getRequiredAttr(property, forceRequired = false) {
  return forceRequired || property.required ? ` required` : ``;
}

/**
 * Helper function to return the HTML "placeholder" attribute if neccessary.
 * @param {?string} hint A hint to the user that helps filling the right value into the input element or a falsey value.
 * @returns {!string} The HTML "placeholder" attribute with the hint or an empty string.
 */
function getPlaceholderAttr(hint) {
  return hint ? ` placeholder="${hint}"` : ``;
}
