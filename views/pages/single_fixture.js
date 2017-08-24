const exportPlugins = require('../../plugins/plugins.js').export;

const Fixture = require('../../lib/model/Fixture.js');
const Channel = require('../../lib/model/Channel.js');
const NullChannel = require('../../lib/model/NullChannel.js');
const FineChannel = require('../../lib/model/FineChannel.js');
const SwitchingChannel = require('../../lib/model/SwitchingChannel.js');
const MatrixChannel = require('../../lib/model/MatrixChannel.js');

let fixture;

module.exports = function(options) {
  const {man, fix} = options;

  fixture = Fixture.fromRepository(man, fix);
  
  options.title = `${fixture.manufacturer.name} ${fixture.name} - Open Fixture Library`;

  let branch = 'master';
  if ('TRAVIS_PULL_REQUEST_BRANCH' in process.env && process.env.TRAVIS_PULL_REQUEST_BRANCH !== '') {
    branch = process.env.TRAVIS_PULL_REQUEST_BRANCH;
  }
  else if ('TRAVIS_BRANCH' in process.env) {
    branch = process.env.TRAVIS_BRANCH;
  }
  const githubRepoPath = 'https://github.com/FloEdelmann/open-fixture-library';


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
    str += `<li><a href="/${man}/${fix}.${plugin}">${exportPlugins[plugin].name}</a></li>`;
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

  str += require('../includes/footer.js')(options);

  return str;
};

function getDateString(date) {
  return `<time datetime="${date.toISOString()}" title="${date.toISOString()}">${date.toISOString().replace(/T.*?$/, '')}</time>`;
}

function getChannelHeading(channel) {
  if (channel === null) {
    return 'Error: Channel not found';
  }

  if (channel instanceof NullChannel) {
    return `${channel.name} <code class="channel-key">null</code>`;
  }

  return channel.name + (channel.key !== channel.name ? ` <code class="channel-key">${channel.key}</code>` : '');
}

function handleFixtureInfo() {
  let str = '<section class="categories">';
  str += '  <span class="label">Categories</span>';
  str += '  <span class="value">';
  str += fixture.categories.map(cat => {
    const svg = require('../includes/svg.js')({categoryName: cat});
    return `<a href="/categories/${encodeURIComponent(cat)}" class="category-badge">${svg} ${cat}</a>`;
  }).join(' ');
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
    str += `  <span class="value"><a href="${fixture.manualURL}">${fixture.manualURL}</a></span>`;
    str += '</section>';
  }

  if (fixture.physical !== null) {
    str += '<h3 class="physical">Physical data</h3>';
    str += '<section class="physical">';
    str += handlePhysicalData(fixture.physical);
    str += '</section>';
  }

  return str;
}

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

function handleMode(mode) {
  let str = '<section class="fixture-mode card">';

  const heading = mode.name + ' mode' + (mode.hasShortName ? ` <code>${mode.shortName}</code>` : '');
  str += `<h2>${heading}</h2>`;

  if (mode.physicalOverride !== null) {
    str += '<h3>Physical overrides</h3>';
    str += '<section class="physical physical-override">';
    str += handlePhysicalData(mode.physicalOverride);
    str += '</section>';
  }

  str += '<h3>Channels</h3>';
  str += '<ol>';
  mode.channels.forEach(channel => {
    str += '<li>';
    str += '<details class="channel">';

    if (channel instanceof MatrixChannel) {
      channel = channel.wrappedChannel;
    }

    str += `<summary>${getChannelHeading(channel)}</summary>`;

    if (channel instanceof FineChannel) {
      str += handleFineChannel(channel, mode);
    }
    else if (channel instanceof SwitchingChannel) {
      str += handleSwitchingChannel(channel, mode);
    }
    else if (channel instanceof Channel) {
      str += handleChannel(channel, mode);
    }

    str += '</details>';
    str += '</li>';
  });
  str += '</ol>';
  str += '</section>'; // .fixture-mode

  return str;
}

function handleChannel(channel, mode) {
  let str = `<section class="channel-type">
    <span class="label">Type</span>
    <span class="value">${channel.type}</span>
  </section>`;

  if (channel.color !== null) {
    str += `<section class="channel-color">
      <span class="label">Color</span>
      <span class="value">${channel.color}</span>
    </section>`;
  }

  const finenessInMode = channel.getFinenessInMode(mode);
  if (finenessInMode > 0) {
    str += '<section class="channel-fineChannelAliases">';
    str += '  <span class="label">Fine channels</span>';
    str += '  <span class="value">';

    for (let i=0; i<finenessInMode; i++) {
      const heading = getChannelHeading(channel.fineChannelAliases[i]);
      const position = mode.getChannelIndex(channel.key) + 1;
      str +=  `${heading} (channel ${position})`;
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

function handleCapabilities(channel, mode, finenessInMode) {
  if (!channel.hasCapabilities) {
    return '';
  }

  let str = '<details class="channel-capabilities">';
  str += '  <summary>Capabilities</summary>';
  str += '  <table>';
  str += '    <tbody>';

  channel.capabilities.forEach(cap => {
    str += '<tr>';

    const range = cap.getRangeWithFineness(finenessInMode);
    str += '<td class="capability-range0" title="DMX value start">';
    str += `  <code>${range.start}</code>`;
    str += '</td>';
    str += '<td class="capability-range1" title="DMX value end">';
    str += `  <code>${range.end}</code>`;
    str += '</td>';

    if (cap.color !== null && cap.color2 !== null) {
      const color1 = cap.color.rgb().string();
      const color2 = cap.color2.rgb().string();

      str += `<td class="capability-color" title="color: ${color1} / ${color2}">`;
      str += `  <span class="color-circle" style="background-color: ${color1}"><span style="background-color: ${color2}"></span></span>`;
      str += '</td>';
    }
    else if (cap.color !== null) {
      const color1 = cap.color.rgb().string();

      str += `<td class="capability-color" title="color: ${color1}">`;
      str += `  <span class="color-circle" style="background-color: ${color1}"></span>`;
      str += '</td>';
    }
    else if (cap.image !== null) {
      str += `<td class="capability-image" title="image">${cap.image}</td>`;
    }
    else {
      str += '<td></td>';
    }

    str += `<td class="capability-name" title="name">${cap.name}</td>`;
    str += `<td class="capability-menuClick" title="menu click action">${cap.menuClick}</td>`;

    str += '</tr>';

    const switchChannels = Object.keys(cap.switchChannels);

    for (const switchingChannelKey of switchChannels) {
      const switchingChannelIndex = mode.getChannelIndex(switchingChannelKey);

      if (switchingChannelIndex > -1) {
        const switchToChannel = cap.switchChannels[switchingChannelKey];

        str += `<tr><td colspan="5" class="switch-to-channel">${switchingChannelKey} (channel ${switchingChannelIndex + 1}) → ${switchToChannel}</td></tr>`;
      }
    }
  });

  str += '    </tbody>';
  str += '  </table>';
  str += '</details>';

  return str;
}

function handleFineChannel(channel, mode) {
  const coarseChannelIndex = mode.getChannelIndex(channel.coarseChannel.key) + 1;
  return `<div>Fine channel of ${channel.coarseChannel.name} (channel ${coarseChannelIndex})</div>`;
}

function handleSwitchingChannel(channel, mode) {
  const triggerChannelIndex = mode.getChannelIndex(channel.triggerChannel.key) + 1;

  let str = `<div>Switch depending on ${channel.triggerChannel.name}'s value (channel ${triggerChannelIndex}):</div>`;
  str += '<ol>';
  
  for (const switchToChannel of channel.switchToChannels) {
    str += '<li>';
    str += '<details class="channel">';

    str += '<summary>';
    str += getChannelHeading(switchToChannel);
    if (channel.defaultChannel === switchToChannel) {
      str += ' (default)';
    }
    str += '</summary>';

    if (switchToChannel instanceof FineChannel) {
      str += handleFineChannel(switchToChannel, mode);
    }
    else if (switchToChannel instanceof Channel) {
      str += handleChannel(switchToChannel, mode);
    }

    str += '</li>';
  }
  str += '</ol>';

  return str;
}
