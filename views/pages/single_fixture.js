const fs = require('fs');
const path = require('path');

const exportPlugins = require(path.join(__dirname, '..', '..', 'plugins', 'plugins.js')).export;

const Fixture = require('../../lib/model/Fixture.js');
const NullChannel = require('../../lib/model/NullChannel.js');
const FineChannel = require('../../lib/model/FineChannel.js');
const SwitchingChannel = require('../../lib/model/SwitchingChannel.js');

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


  let str = require('../includes/header')(options);

  str += '<header class="fixture-header">';

  str += '<div class="title">';
  str += `<h1><a href="/${man}"><data data-key="manufacturer">${fixture.manufacturer.name}</data></a> <data data-key="name">${fixture.manufacturer.name}</data>`;
  if (fixture.hasShortName) {
    str += ` <code><data data-key="shortName">${fixture.shortName}</data></code>`;
  }
  str += '</h1>';
  str += '<section class="fixture-meta">';
  str += `<span class="last-modify-date">Last modified:&nbsp;<date>${fixture.meta.lastModifyDate.toISOString()}</date></span>`;
  str += `<span class="create-date">Created:&nbsp;<date>${fixture.meta.createDate.toISOString()}</date></span>`;
  str += `<span class="authors">Author${fixture.meta.authors.length === 1 ? '' : 's'}:&nbsp;<data>${fixture.meta.authors.join(', ')}</data></span>`;
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

  str += '  <section class="categories">';
  str += '    <span class="label">Categories</span>';
  str += '    <span class="value">';
  str += fixture.categories.map(cat => {
    const svg = require('../includes/svg')({categoryName: cat});
    return `<a href="/categories/${encodeURIComponent(cat)}" class="category-badge">${svg} <data data-key="category">${cat}</data></a>`;
  }).join(' ');
  str += '    </span>';
  str += '  </section>';

  if (fixture.hasComment) {
    str += '<section class="comment">';
    str += '  <span class="label">Comment</span>';
    str += `  <span class="value"><data data-key="comment">${fixture.comment}</data></span>`;
    str += '</section>';
  }

  if (fixture.manualURL !== null) {
    str += '<section class="manualURL">';
    str += '  <span class="label">Manual</span>';
    str += `  <span class="value"><a href="${fixture.manualURL}"><data data-key="manualURL">${fixture.manualURL}</data></a></span>`;
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
      str += fixture.heads[headName].map(ch => {
        return `<data class="channel" data-channel="${ch}">${getChannelHeading(ch)}</data>`;
      }).join(', ');
      str += '</li>';
    }
    str += '</ul>';
    str += '</section>';
  }

  str += '</section>'; // .fixture-info

  str += '<section class="fixture-modes">';
  fixture.modes.forEach(mode => {
    let heading = mode.name + ' mode';
    if (mode.hasShortName) {
      heading += ` <code>${mode.shortName}</code>`;
    }

    str += '<section class="fixture-mode card">';
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
      str += `<summary>${getChannelHeading(channel.key)}</summary>`;

      if (channel instanceof FineChannel) {
        str += handleFineChannel(channel, mode);
      }
      else if (channel instanceof SwitchingChannel) {
        str += `<div>Switch depending on ${channel.triggerChannel.name}'s value (channel ${mode.getChannelIndex(channel.triggerChannel.key) + 1}):</div>`;

        str += '<ol>';
        
        for (const switchToChannelKey of Object.keys(channel.triggerRanges)) {
          const switchToChannel = fixture.getChannelByKey(switchToChannelKey);

          str += '<li>';
          str += '<details class="channel">';

          str += '<summary>';
          str += getChannelHeading(switchToChannelKey);
          if (channel.defaultChannel === switchToChannel) {
            str += ' (default)';
          }
          str += '</summary>';

          str += switchToChannel instanceof FineChannel
            ? handleFineChannel(switchToChannel, mode)
            : handleChannel(switchToChannel, mode);

          str += '</li>';
        }
        str += '</ol>';
      }
      else if (!(channel instanceof NullChannel)) {
        str += handleChannel(channel, mode);
      }

      str += '</details>';
      str += '</li>';
    });
    str += '</ol>';
    str += '</section>'; // .fixture-mode
  });
  str += '<div class="clearfix"></div>';
  str += '</section>'; // .fixture-modes

  str += require('../includes/footer')(options);

  return str;
};

function getChannelHeading(chKey) {
  const channel = fixture.getChannelByKey(chKey);

  if (channel instanceof NullChannel) {
    return 'Unused';
  }

  if (channel instanceof FineChannel) {
    return channel.name;
  }

  return channel.name + (chKey !== channel.name ? ` <code class="channel-key">${chKey}</code>` : '');
}

function handlePhysicalData(physical) {
  let str = '';

  if (physical.dimensions !== null) {
    str += `<section class="physical-dimensions">
      <span class="label">Dimensions</span>
      <span class="value">
        <data data-key="physical-dimensions-0">${physical.width}</data> &times;
        <data data-key="physical-dimensions-1">${physical.height}</data> &times;
        <data data-key="physical-dimensions-2">${physical.depth}</data>mm
        <span class="hint">width &times; height &times; depth</span>
      </span>
    </section>`;
  }

  if (physical.weight !== null) {
    str += `<section class="physical-weight">
      <span class="label">Weight</span>
      <span class="value"><data data-key="physical-weight">${physical.weight}</data>kg</span>
    </section>`;
  }

  if (physical.power !== null) {
    str += `<section class="physical-power">
      <span class="label">Power</span>
      <span class="value"><data data-key="physical-power">${physical.power}</data>W</span>
    </section>`;
  }

  if (physical.DMXconnector !== null) {
    str += `<section class="physical-DMXconnector">
      <span class="label">DMX connector</span>
      <span class="value"><data data-key="physical-DMXconnector">${physical.DMXconnector}</data></span>
    </section>`;
  }

  if (physical.hasBulb) {
    str += '<section class="physical-bulb">';
    str += '<h4>Bulb</h4>';

    if (physical.bulbType !== null) {
      str += `<section class="physical-bulb-type">
        <span class="label">Bulb type</span>
        <span class="value"><data data-key="physical-bulb-type">${physical.bulbType}</data></span>
      </section>`;
    }

    if (physical.bulbColorTemperature) {
      str += `<section class="physical-bulb-colorTemperature">
        <span class="label">Color temperature</span>
        <span class="value"><data data-key="physical-bulb-colorTemperature">${physical.bulbColorTemperature}</data>K</span>
      </section>`;
    }

    if (physical.bulbLumens !== null) {
      str += `<section class="physical-bulb-lumens">
        <span class="label">Lumens</span>
        <span class="value"><data data-key="physical-bulb-lumens">${physical.bulbLumens}</data></span>
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
        <span class="value"><data data-key="physical-lens-name">${physical.lensName}</data></span>
      </section>`;
    }

    if (physical.lensDegreesMin !== null) {
      str += `<section class="physical-lens-degreesMinMax">
        <span class="label">Light cone</span>
        <span class="value"><data data-key="physical-lens-degreesMin">${physical.lensDegreesMin}</data>..<data data-key="physical-lens-degreesMin">${physical.lensDegreesMax}</data>°</span>
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
        <span class="value"><data data-key="physical-focus-type">${physical.focusType}</data></span>
      </section>`;
    }

    if (physical.focusPanMax !== null) {
      str += `<section class="physical-focus-panMax">
        <span class="label">Max. pan</span>
        <span class="value"><data data-key="physical-focus-panMax">${physical.focusPanMax}</data>°</span>
      </section>`;
    }

    if (physical.focusTiltMax) {
      str += `<section class="physical-focus-tiltMax">
        <span class="label">Max. tilt</span>
        <span class="value"><data data-key="physical-focus-tiltMax">${physical.focusTiltMax}</data>°</span>
      </section>`;
    }

    str += '</section>';
  }

  return str;
}

function handleChannel(channel, mode) {
  let str = `<section class="channel-type">
    <span class="label">Type</span>
    <span class="value"><data data-key="channel-type">${channel.type}</data></span>
  </section>`;

  if (channel.color !== null) {
    str += `<section class="channel-color">
      <span class="label">Color</span>
      <span class="value"><data data-key="channel-color">${channel.color}</data></span>
    </section>`;
  }

  const finenessInMode = channel.getFinenessInMode(mode);
  if (finenessInMode > 0) {
    str += '<section class="channel-fineChannelAliases">';
    str += '  <span class="label">Fine channels</span>';
    str += '  <span class="value"><data data-key="channel-fineChannelAliases">';

    for (let i=0; i<finenessInMode; i++) {
      const heading = getChannelHeading(channel.fineChannelAliases[i]);
      const position = mode.getChannelIndex(channel.key) + 1;
      str +=  `${heading} (channel ${position})`;
    }

    str += '</data></span>';
    str += '</section>';
  }

  if (channel.hasDefaultValue) {
    str += `<section class="channel-defaultValue">
      <span class="label">Default value</span>
      <span class="value"><data data-key="channel-defaultValue">${channel.defaultValue}</data></span>
    </section>`;
  }

  if (channel.hasHighlightValue) {
    str += `<section class="channel-highlightValue">
      <span class="label">Highlight value</span>
      <span class="value"><data data-key="channel-highlightValue">${channel.highlightValue}</data></span>
    </section>`;
  }

  if (channel.invert) {
    str += `<section class="channel-invert">
      <span class="label">Invert</span>
      <span class="value"><data class="checkbox" data-key="channel-invert" data-value="${channel.invert}">${channel.invert}</data></span>
    </section>`;
  }

  if (channel.constant) {
    str += `<section class="channel-constant">
      <span class="label">Constant</span>
      <span class="value"><data class="checkbox" data-key="channel-constant" data-value="${channel.constant}">${channel.constant}</data></span>
    </section>`;
  }

  if (channel.crossfade) {
    str += `<section class="channel-crossfade">
      <span class="label">Crossfade</span>
      <span class="value"><data class="checkbox" data-key="channel-crossfade" data-value="${channel.crossfade}">${channel.crossfade}</data></span>
    </section>`;
  }

  if (channel.precedence !== 'LTP') {
    str += `<section class="channel-precedence">
      <span class="label">Precedence</span>
      <span class="value"><data data-key="channel-precedence">${channel.precedence}</data></span>
    </section>`;
  }

  if (channel.hasCapabilities) {
    str += '<details class="channel-capabilities">';
    str += '  <summary>Capabilities</summary>';
    str += '  <table>';
    str += '    <tbody>';

    channel.capabilities.forEach(cap => {
      str += '<tr>';

      str += '<td class="capability-range0" title="DMX value start">';
      str += `  <code><data data-key="capability-range-0">${cap.range.start}</data></code>`;
      str += '</td>';

      str += '<td class="capability-range1" title="DMX value end">';
      str += `  <code><data data-key="capability-range-1">${cap.range.end}</data></code>`;
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
        str += '<td class="capability-image" title="image">';
        str += `  <data data-key="capability-image">${cap.image || ''}</data>`;
        str += '</td>';
      }
      else {
        str += '<td></td>';
      }

      str += '<td class="capability-name" title="name">';
      str += `  <data data-key="capability-name">${cap.name}</data>`;
      str += '</td>';

      str += '<td class="capability-menuClick" title="menu click action">';
      str += `  <data data-key="capability-menuClick">${cap.menuClick}</data>`;
      str += '</td>';

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
  }

  return str;
}

function handleFineChannel(channel, mode) {
  const coarseChannelIndex = mode.getChannelIndex(channel.coarseChannel.key) + 1;
  return `<div>Fine channel of ${channel.coarseChannel.name} (channel ${coarseChannelIndex})</div>`;
}
