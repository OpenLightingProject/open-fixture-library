const url = require('url');

const svg = require('../includes/svg.js');
const exportPlugins = require('../../plugins/plugins.js').export;

const Fixture = require('../../lib/model/Fixture.js');
const NullChannel = require('../../lib/model/NullChannel.js');
const FineChannel = require('../../lib/model/FineChannel.js');
const SwitchingChannel = require('../../lib/model/SwitchingChannel.js');

let fixture;

/**
 * Generates the HTML of a single fixture page.
 * @param {!object} options Object containing page options like manufacturer key and fixture key.
 * @returns {!string} The HTML string.
 */
module.exports = function handleFixture(options) {
  const {man, fix} = options;

  fixture = Fixture.fromRepository(man, fix);

  options.title = `${fixture.manufacturer.name} ${fixture.name} fixture definition - Open Fixture Library`;
  options.structuredDataItems.push(getStructuredProductModel(options));
  options.structuredDataItems.push(getStructuredBreadCrumbList(options));

  const githubRepoPath = `https://github.com/${process.env.TRAVIS_REPO_SLUG || 'FloEdelmann/open-fixture-library'}`;
  const branch = process.env.TRAVIS_PULL_REQUEST_BRANCH || process.env.TRAVIS_BRANCH || 'master';

  let str = require('../includes/header.js')(options);

  str += '<header class="fixture-header">';

  str += '<div class="title">';
  str += `<h1><a href="/${man}">${fixture.manufacturer.name}</a> ${fixture.name}`;
  if (fixture.hasShortName) {
    str += ` <code>${fixture.shortName}</code>`;
  }
  str += '</h1>';
  str += '<section class="fixture-meta">';
  str += `<span class="last-modify-date">Last modified:&nbsp;${getDateString(fixture.meta.lastModifyDate)}</span>`;
  str += `<span class="create-date">Created:&nbsp;${getDateString(fixture.meta.createDate)}</span>`;
  str += `<span class="authors">Author${fixture.meta.authors.length === 1 ? '' : 's'}:&nbsp;${fixture.meta.authors.join(', ')}</span>`;
  str += `<span class="source"><a href="${githubRepoPath}/blob/${branch}/fixtures/${man}/${fix}.json">Source</a></span>`;
  str += `<span class="revisions"><a href="${githubRepoPath}/commits/${branch}/fixtures/${man}/${fix}.json">Revisions</a></span>`;
  str += '</section>';
  str += '</div>';

  str += '<div class="download-button">';
  str += '<a href="#" class="title">Download as &hellip;</a>';
  str += '<ul>';
  for (const plugin of Object.keys(exportPlugins)) {
    str += `<li><a href="/${man}/${fix}.${plugin}" title="Download ${exportPlugins[plugin].name} fixture definition">${exportPlugins[plugin].name}</a></li>`;
  }
  str += '</ul>';
  str += '</div>';

  str += '</header>';


  str += '<section class="fixture-info card">';
  str += handleFixtureInfo();
  str += '</section>';

  str += '<section class="fixture-modes">';
  str += fixture.modes.map(handleMode).join('');
  str += '<div class="clearfix"></div>';
  str += '</section>'; // .fixture-modes

  str += '<section>';
  str += '<h2>Something wrong with this fixture definition?</h2>';
  str += '<p>It does not work in your lighting software or you see another problem? Then please help correct it!</p>';
  str += '<div class="grid list">';
  str += `<a href="https://github.com/FloEdelmann/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Atype-bug" rel="nofollow" class="card">${svg.getSvg('bug', ['left'])}<span>Report issue on GitHub</span></a>`;
  str += `<a href="/about#contact" class="card">${svg.getSvg('email', ['left'])}<span>Contact</span></a>`;
  str += '</div>';
  str += '</section>';

  str += require('../includes/footer.js')(options);

  return str;
};

/**
 * Creates a ProductModel as structured data for SEO
 * @param {!object} options Global options
 * @returns {!object} The JSON-LD data
 */
function getStructuredProductModel(options) {
  const data = {
    '@context': 'http://schema.org',
    '@type': 'ProductModel',
    'name': fixture.name,
    'category': fixture.mainCategory,
    'manufacturer': {
      'url': url.resolve(options.url, '..')
    }
  };

  if (fixture.hasComment) {
    data.description = fixture.comment;
  }

  if (fixture.physical !== null && fixture.physical.dimensions !== null) {
    data.depth = fixture.physical.depth;
    data.width = fixture.physical.width;
    data.height = fixture.physical.height;
  }

  return data;
}

/**
 * Creates a BreadCrumbList as structured data for SEO
 * @param {!object} options Global options
 * @returns {!object} The JSON-LD data
 */
function getStructuredBreadCrumbList(options) {
  return {
    '@context': 'http://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'item': {
          '@id': url.resolve(options.url, '/manufacturers'),
          'name': 'Manufacturers'
        }
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'item': {
          '@id': url.resolve(options.url, '..'),
          'name': fixture.manufacturer.name
        }
      }
    ]
  };
}

/**
 * Format a date to display as a <time> HTML tag.
 * @param {!Date} date The Date object to format.
 * @returns {!string} The <time> HTML tag.
 */
function getDateString(date) {
  return `<time datetime="${date.toISOString()}" title="${date.toISOString()}">${date.toISOString().replace(/T.*?$/, '')}</time>`;
}

/**
 * @param {!Channel} channel Channel to get the heading for.
 * @returns {!string} The channel name including a <code> tag with the channel key if necessary.
 */
function getChannelHeading(channel) {
  if (channel === null) {
    return 'Error: Channel not found';
  }

  if (channel instanceof NullChannel) {
    return `${channel.name} <code class="channel-key">null</code>`;
  }

  return channel.name + (channel.key !== channel.name ? ` <code class="channel-key">${channel.key}</code>` : '');
}

/**
 * Get HTML for a color circle with one or two colors.
 * @param {!string} color1 First color string.
 * @param {?string} [color2] Second color string.
 * @param {?string} [title] Text for the title attribute. If this parameter is not given, no title tag will be added.
 * @returns {!string} The HTML for displaying the color circle.
 */
function getColorCircle(color1, color2, title) {
  const titleAttribute = title ? ` title="${title}"` : '';

  if (color2) {
    return `<span class="icon color-circle"${titleAttribute}><span style="background-color: ${color1}"><span style="background-color: ${color2}"></span></span></span>`;
  }

  return `<span class="icon color-circle"${titleAttribute}><span style="background-color: ${color1}"></span></span>`;
}

/**
 * Get the channel icon (or color circle for Single Color channels).
 * @param {!Channel} channel Channel to get the heading for.
 * @returns {!string} The inline SVG or HTML displaying the channel icon.
 */
function getChannelTypeIcon(channel) {
  if (channel instanceof NullChannel) {
    return svg.getChannelTypeIcon('Nothing');
  }

  if (channel instanceof FineChannel) {
    return getChannelTypeIcon(channel.coarseChannel);
  }

  if (channel instanceof SwitchingChannel) {
    return svg.getChannelTypeIcon('Switching Channel');
  }

  if (channel.type === 'Single Color') {
    const colorLookup = {
      Red: '#ff0000',
      Green: '#00ff00',
      Blue: '#0000ff',
      Cyan: '#00ffff',
      Magenta: '#ff00ff',
      Yellow: '#ffff00',
      Amber: '#ffbf00',
      White: '#ffffff',
      UV: '#8800ff',
      Lime: '#bfff00',
      Indigo: '#4b0082'
    };
    return getColorCircle(colorLookup[channel.color], null, `Channel type: Single Color ${channel.color}`);
  }

  return svg.getChannelTypeIcon(channel.type);
}

/**
 * @returns {!string} The general fixture info HTML.
 */
function handleFixtureInfo() {
  let str = '<section class="categories">';
  str += '  <span class="label">Categories</span>';
  str += '  <span class="value">';
  str += fixture.categories.map(
    cat => `<a href="/categories/${encodeURIComponent(cat)}" class="category-badge">${svg.getCategoryIcon(cat)} ${cat}</a>`
  ).join(' ');
  str += '  </span>';
  str += '</section>';

  if (fixture.hasComment) {
    str += '<section class="comment">';
    str += '  <span class="label">Comment</span>';
    str += `  <span class="value">${fixture.comment.replace(/\n/g, '<br />')}</span>`;
    str += '</section>';
  }

  if (fixture.manualURL !== null) {
    str += '<section class="manualURL">';
    str += '  <span class="label">Manual</span>';
    str += `  <span class="value"><a href="${fixture.manualURL}" rel="nofollow">${fixture.manualURL}</a></span>`;
    str += '</section>';
  }

  if (fixture.rdm !== null) {
    const rdmLink = `http://rdm.openlighting.org/model/display?manufacturer=${fixture.manufacturer.rdmId}&model=${fixture.rdm.modelId}`;
    const olaIcon = svg.getSvg('ola');
    const softwareVersion = 'softwareVersion' in fixture.rdm ? fixture.rdm.softwareVersion : '?';

    str += '<section class="rdm">';
    str += '  <span class="label"><abbr title="Remote Device Management">RDM</abbr> data</span>';
    str += `  <span class="value">${fixture.manufacturer.rdmId} / ${fixture.rdm.modelId} / ${softwareVersion} – <a href="${rdmLink}" rel="nofollow">${olaIcon} View in Open Lighting RDM database</a><span class="hint">manufacturer ID / model ID / software version</span></span>`;
    str += '</section>';
  }

  if (fixture.physical !== null) {
    str += '<h3 class="physical">Physical data</h3>';
    str += '<section class="physical">';
    str += handlePhysicalData(fixture.physical);
    str += '</section>';
  }

  if (Object.keys(fixture.heads).length > 0) {
    str += '<section class="heads">';
    str += '<h3>Heads</h3>';
    str += '<ul>';
    for (const headName of Object.keys(fixture.heads)) {
      str += '<li>';
      str += `<strong>${headName}:</strong> `;
      str += fixture.heads[headName].map(
        chKey => getChannelHeading(fixture.getChannelByKey(chKey))
      ).join(', ');
      str += '</li>';
    }
    str += '</ul>';
    str += '</section>';
  }

  return str;
}

/**
 * @param {!Physical} physical The fixture's or mode's physical object.
 * @returns {!string} The physical HTML.
 */
function handlePhysicalData(physical) {
  let str = '';

  if (physical.dimensions !== null) {
    str += `<section class="physical-dimensions">
      <span class="label">Dimensions</span>
      <span class="value">
        ${physical.width} &times; ${physical.height} &times; ${physical.depth}mm
        <span class="hint">width &times; height &times; depth</span>
      </span>
    </section>`;
  }

  if (physical.weight !== null) {
    str += `<section class="physical-weight">
      <span class="label">Weight</span>
      <span class="value">${physical.weight}kg</span>
    </section>`;
  }

  if (physical.power !== null) {
    str += `<section class="physical-power">
      <span class="label">Power</span>
      <span class="value">${physical.power}W</span>
    </section>`;
  }

  if (physical.DMXconnector !== null) {
    str += `<section class="physical-DMXconnector">
      <span class="label">DMX connector</span>
      <span class="value">${physical.DMXconnector}</span>
    </section>`;
  }

  if (physical.hasBulb) {
    str += '<section class="physical-bulb">';
    str += '<h4>Bulb</h4>';

    if (physical.bulbType !== null) {
      str += `<section class="physical-bulb-type">
        <span class="label">Bulb type</span>
        <span class="value">${physical.bulbType}</span>
      </section>`;
    }

    if (physical.bulbColorTemperature) {
      str += `<section class="physical-bulb-colorTemperature">
        <span class="label">Color temperature</span>
        <span class="value">${physical.bulbColorTemperature}K</span>
      </section>`;
    }

    if (physical.bulbLumens !== null) {
      str += `<section class="physical-bulb-lumens">
        <span class="label">Lumens</span>
        <span class="value">${physical.bulbLumens}</span>
      </section>`;
    }

    str += '</section>';
  }

  if (physical.hasLens) {
    str += '<section class="physical-lens">';
    str += '<h4>Lens</h4>';

    if (physical.lensName !== null) {
      str += `<section class="physical-lens-name">
        <span class="label">Name</span>
        <span class="value">${physical.lensName}</span>
      </section>`;
    }

    if (physical.lensDegreesMin !== null) {
      str += `<section class="physical-lens-degreesMinMax">
        <span class="label">Light cone</span>
        <span class="value">${physical.lensDegreesMin} … ${physical.lensDegreesMax}°</span>
      </section>`;
    }

    str += '</section>';
  }

  if (physical.hasFocus) {
    str += '<section class="physical-focus">';
    str += '<h4>Focus</h4>';

    if (physical.focusType !== null) {
      str += `<section class="physical-focus-type">
        <span class="label">Type</span>
        <span class="value">${physical.focusType}</span>
      </section>`;
    }

    if (physical.focusPanMax !== null) {
      str += `<section class="physical-focus-panMax">
        <span class="label">Max. pan</span>
        <span class="value">${physical.focusPanMax}°</span>
      </section>`;
    }

    if (physical.focusTiltMax) {
      str += `<section class="physical-focus-tiltMax">
        <span class="label">Max. tilt</span>
        <span class="value">${physical.focusTiltMax}°</span>
      </section>`;
    }

    str += '</section>';
  }

  return str;
}

/**
 * @param {!Mode} mode The mode to display.
 * @returns {!string} The mode HTML.
 */
function handleMode(mode) {
  let sectionId = '';
  let rdmPersonalityIndexHint = '';
  if (mode.rdmPersonalityIndex !== null) {
    sectionId = ` id="rdm-personality-${mode.rdmPersonalityIndex}"`;
    rdmPersonalityIndexHint = `<span class="hint">RDM personality index: ${mode.rdmPersonalityIndex}</span>`;
  }

  let str = `<section class="fixture-mode card"${sectionId}>`;

  const heading = `${mode.name} mode${mode.hasShortName ? ` <code>${mode.shortName}</code>` : ''}`;
  str += `<h2>${heading}</h2>`;
  str += rdmPersonalityIndexHint;

  if (mode.physicalOverride !== null) {
    str += '<h3>Physical overrides</h3>';
    str += '<section class="physical physical-override">';
    str += handlePhysicalData(mode.physicalOverride);
    str += '</section>';
  }

  str += '<h3>';
  str += 'DMX Channels';
  str += `<button class="icon-button expand-all" title="Expand all channels">${svg.getSvg('chevron-double-down')}</button>`;
  str += `<button class="icon-button collapse-all" title="Collapse all channels">${svg.getSvg('chevron-double-up')}</button>`;
  str += '</h3>';

  str += '<ol>';
  str += mode.channels.map(channel => getChannelListItem(channel, mode)).join('\n');
  str += '</ol>';
  str += '</section>'; // .fixture-mode

  return str;
}

/**
 * @param {!Channel} channel The channel to display details for.
 * @param {!Mode} mode The mode in which the channel is used.
 * @param {?string} [appendToHeading=''] String to append to channel heading.
 * @returns {!string} The channel <li> HTML.
 */
function getChannelListItem(channel, mode, appendToHeading = '') {
  let channelInfo = '';
  if (channel instanceof FineChannel) {
    channelInfo = getFineChannelInfo(channel, mode);
  }
  else if (channel instanceof SwitchingChannel) {
    channelInfo = getSwitchingChannelInfo(channel, mode);
  }
  else if (!(channel instanceof NullChannel)) {
    channelInfo = getChannelInfo(channel, mode);
  }

  const heading = getChannelTypeIcon(channel) + getChannelHeading(channel) + appendToHeading;

  if (channelInfo === '') {
    return `<li><div class="channel">${heading}</div></li>`;
  }

  return `<li><details class="channel"><summary>${heading}</summary>${channelInfo}</details></li>`;
}

/**
 * @param {!Channel} channel The channel to display details for.
 * @param {!Mode} mode The mode in which the channel is used.
 * @returns {!string} The channel HTML.
 */
function getChannelInfo(channel, mode) {
  let str = '';

  const finenessInMode = channel.getFinenessInMode(mode);
  if (finenessInMode > 0) {
    str += '<section class="channel-fineChannelAliases">';
    str += '  <span class="label">Fine channels</span>';
    str += '  <span class="value">';

    for (let i = 0; i < finenessInMode; i++) {
      const heading = getChannelHeading(channel.fineChannels[i]);
      const position = mode.getChannelIndex(channel.fineChannels[i]) + 1;
      str += `${heading} (channel ${position})`;
    }

    str += '</span>';
    str += '</section>';
  }

  if (channel.hasDefaultValue) {
    str += `<section class="channel-defaultValue">
      <span class="label">Default value</span>
      <span class="value">${channel.getDefaultValueWithFineness(finenessInMode)}</span>
    </section>`;
  }

  if (channel.hasHighlightValue) {
    str += `<section class="channel-highlightValue">
      <span class="label">Highlight value</span>
      <span class="value">${channel.getHighlightValueWithFineness(finenessInMode)}</span>
    </section>`;
  }

  if (channel.invert) {
    str += `<section class="channel-invert">
      <span class="label">Invert</span>
      <span class="value"><span class="checkbox" title="${channel.invert}">${channel.invert}</span></span>
    </section>`;
  }

  if (channel.constant) {
    str += `<section class="channel-constant">
      <span class="label">Constant</span>
      <span class="value"><span class="checkbox" title="${channel.constant}">${channel.constant}</span></span>
    </section>`;
  }

  if (channel.crossfade) {
    str += `<section class="channel-crossfade">
      <span class="label">Crossfade</span>
      <span class="value"><span class="checkbox" title="${channel.crossfade}">${channel.crossfade}</span></span>
    </section>`;
  }

  if (channel.precedence !== 'LTP') {
    str += `<section class="channel-precedence">
      <span class="label">Precedence</span>
      <span class="value">${channel.precedence}</span>
    </section>`;
  }

  str += handleCapabilities(channel, mode, finenessInMode);

  return str;
}

/**
 * @param {!Channel} channel The channel to display capabilities for.
 * @param {!Mode} mode The mode in which the channel is used.
 * @param {!number} finenessInMode The fineness of the channel in this mode.
 * @returns {!string} The capabilities HTML.
 */
function handleCapabilities(channel, mode, finenessInMode) {
  if (!channel.hasCapabilities) {
    return '';
  }

  let str = '<table class="capabilities-table">';
  str += '<colgroup>';
  str += '  <col style="width: 5.8ex">';
  str += '  <col style="width: 1ex">';
  str += '  <col style="width: 5.8ex">';
  str += '  <col style="width: 1.8em">';
  str += '  <col>';
  str += '  <col style="width: 1.8em">';
  str += '</colgroup>';
  str += '<thead><tr>';
  str += '  <th colspan="3" style="text-align: center">DMX values</th>';
  str += '  <th></th>';  // color or image
  str += '  <th>Capability</th>';
  str += '  <th></th>';  // menuClick
  str += '</tr></thead>';
  str += '<tbody>';

  channel.capabilities.forEach(cap => {
    str += '<tr>';

    const range = cap.getRangeWithFineness(finenessInMode);
    str += `<td class="capability-range0"><code>${range.start}</code></td>`;
    str += '<td class="capability-range-separator"><code>…</code></td>';
    str += `<td class="capability-range1"><code>${range.end}</code></td>`;

    if (cap.color !== null && cap.color2 !== null) {
      const color1 = cap.color.rgb().string();
      const color2 = cap.color2.rgb().string();

      str += `<td class="capability-color" title="color: ${color1} / ${color2}">`;
      str += getColorCircle(color1, color2);
      str += '</td>';
    }
    else if (cap.color !== null) {
      const color1 = cap.color.rgb().string();

      str += `<td class="capability-color" title="color: ${color1}">`;
      str += getColorCircle(color1);
      str += '</td>';
    }
    else if (cap.image !== null) {
      str += `<td class="capability-image" title="image">${cap.image}</td>`;
    }
    else {
      str += '<td></td>';
    }

    str += `<td class="capability-name">${cap.name}</td>`;

    const menuClickTitle = cap.menuClick === 'hidden' ? 'this capability is hidden in quick menus' : `choosing this capability in a quick menu snaps to ${cap.menuClick} of capability`;
    const menuClickIcon = svg.getSvg(`capability-${cap.menuClick}`);
    str += `<td class="capability-menuClick" title="${menuClickTitle}">${menuClickIcon}</td>`;

    str += '</tr>';

    const switchChannels = Object.keys(cap.switchChannels);

    for (const switchingChannelKey of switchChannels) {
      const switchingChannelIndex = mode.getChannelIndex(switchingChannelKey);

      if (switchingChannelIndex > -1) {
        const switchToChannel = cap.switchChannels[switchingChannelKey];

        str += `<tr><td colspan="4"></td><td colspan="2" class="switch-to-channel"><span class="switching-channel-key">${switchingChannelKey} (channel ${switchingChannelIndex + 1}) →</span> ${switchToChannel}</td></tr>`;
      }
    }
  });

  str += '</tbody></table>';

  return str;
}

/**
 * @param {!FineChannel} channel The fine channel to display details for.
 * @param {!Mode} mode The mode in which the channel is used.
 * @returns {!string} The fine channel HTML.
 */
function getFineChannelInfo(channel, mode) {
  const coarseChannelIndex = mode.getChannelIndex(channel.coarseChannel.key) + 1;
  return `<div>Fine channel of ${channel.coarseChannel.name} (channel ${coarseChannelIndex})</div>`;
}

/**
 * @param {!SwitchingChannel} channel The switching channel to display details for.
 * @param {!Mode} mode The mode in which the channel is used.
 * @returns {!string} The switching channel HTML.
 */
function getSwitchingChannelInfo(channel, mode) {
  const triggerChannelIndex = mode.getChannelIndex(channel.triggerChannel.key) + 1;

  let str = `<div>Switch depending on ${channel.triggerChannel.name}'s value (channel ${triggerChannelIndex}):</div>`;
  str += '<ol>';

  for (const switchToChannelKey of Object.keys(channel.triggerRanges)) {
    const switchToChannel = fixture.getChannelByKey(switchToChannelKey);
    const appendToHeading = channel.defaultChannel === switchToChannel ? ' (default)' : '';

    str += getChannelListItem(switchToChannel, mode, appendToHeading);
  }
  str += '</ol>';

  return str;
}
