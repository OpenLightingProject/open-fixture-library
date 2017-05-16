const fs = require('fs');
const path = require('path');

module.exports = function(options) {
  const {manufacturers, man, fix, plugins} = options;
  const manufacturer = manufacturers[man];

  const fixture = JSON.parse(fs.readFileSync(path.join(options.baseDir, 'fixtures', man, fix + '.json'), 'utf-8'));
  
  options.title = `${manufacturer.name} ${fixture.name} - Open Fixture Library`;

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
  str += `<h1><a href="/${man}"><data data-key="manufacturer">${manufacturer.name}</data></a> <data data-key="name">${fixture.name}</data> <code><data data-key="shortName">${_(fixture.shortName)}</data></code></h1>`;
  str += '<section class="fixture-meta">';
  str += `<span class="last-modify-date">Last modified:&nbsp;<date>${fixture.meta.lastModifyDate}</date></span>`;
  str += `<span class="create-date">Created:&nbsp;<date>${fixture.meta.createDate}</date></span>`;
  str += `<span class="authors">Author${fixture.meta.authors.length == 1 ? '' : 's'}:&nbsp;<data>${fixture.meta.authors.join(', ')}</data></span>`;
  str += `<span class="source"><a href="${githubRepoPath}/blob/${branch}/fixtures/${man}/${fix}.json">Source</a></span>`;
  str += `<span class="revisions"><a href="${githubRepoPath}/commits/${branch}/fixtures/${man}/${fix}.json">Revisions</a></span>`;
  str += '</section>';
  str += '</div>';

  str += '<div class="download-button">';
  str += '<a href="#" class="title">Download as &hellip;</a>';
  str += '<ul>';
  for (const plugin in plugins) {
    if ('export' in plugins[plugin]) {
      str += `<li><a href="/${man}/${fix}.${plugin}">${plugins[plugin].name}</a></li>`;
    }
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

  if ('comment' in fixture) {
    str += '<section class="comment">';
    str += '  <span class="label">Comment</span>';
    str += `  <span class="value"><data data-key="comment">${fixture.comment}</data></span>`;
    str += '</section>';
  }

  if ('manualURL' in fixture) {
    str += '<section class="manualURL">';
    str += '  <span class="label">Manual</span>';
    str += `  <span class="value"><a href="${fixture.manualURL}"><data data-key="manualURL">${fixture.manualURL}</data></a></span>`;
    str += '</section>';
  }

  if ('physical' in fixture) {
    str += '<h3 class="physical">Physical data</h3>';
    str += '<section class="physical">';
    str += handlePhysicalData(fixture.physical);
    str += '</section>';
  }

  if ('multiByteChannels' in fixture || 'heads' in fixture) {
    str += '<h3 class="channel-groups">Channel groups</h3>';
    str += '<section class="channel-groups">';

    if ('multiByteChannels' in fixture) {
      str += '<section class="multi-byte-channels">';
      str += '<h4>Multi-byte channels</h4>';
      str += '<ul>';
      fixture.multiByteChannels.forEach(multiByteChannel => {
        str += '<li>';
        str += multiByteChannel.map(ch => {
          return `<data class="channel" data-channel="${ch}">${getChannelHeading(ch, fixture)}</data>`;
        }).join(', ');
        str += '</li>';
      });
      str += '</ul>';
      str += '</section>';
    }

    if ('heads' in fixture) {
      str += '<section class="heads">';
      str += '<h4>Heads</h4>';
      str += '<ul>';
      for (const head in fixture.heads) {
        str += '<li>';
        str += `<strong>${head}:</strong> `;
        str += fixture.heads[head].map(ch => {
          return `<data class="channel" data-channel="${ch}">${getChannelHeading(ch, fixture)}</data>`;
        }).join(', ');
        str += `</li>`;
      }
      str += '</ul>';
      str += '</section>';
    }

    str += '<div class="clearfix"></div>';
    str += '</section>'; // .channel-groups
  }

  str += '</section>'; // .fixture-info

  str += '<section class="fixture-modes">';
  fixture.modes.forEach(mode => {
    let heading = mode.name + ' mode';
    if ('shortName' in mode) {
      heading += ` <code>${mode.shortName}</code>`;
    }

    str += '<section class="fixture-mode card">';
    str += `<h2>${heading}</h2>`;

    if ('physical' in mode) {
      str += '<h3>Physical overrides</h3>';
      str += '<section class="physical physical-override">';
      str += handlePhysicalData(mode.physical);
      str += '</section>';
    }

    str += '<h3>Channels</h3>';
    str += '<ol>';
    mode.channels.forEach((ch, i) => {
      const channel = fixture.availableChannels[ch];

      str += `<li data-index="${i}">`;
      str += `<details class="channel" data-channel="${ch}">`;
      str += `<summary>${getChannelHeading(ch, fixture)}</summary>`;
      str += handleChannel(channel);
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

function getChannelHeading(key, fixture) {
  let str = key;
  if ('name' in fixture.availableChannels[key]) {
    str = `${fixture.availableChannels[key].name} <code class="channel-key">${key}</code>`;
  }

  return str;
}

/**
 * Helper function for easy output of variables.
 */
function _(variable) {
  if (variable === undefined) {
    return '';
  }
  return variable;
}

function handlePhysicalData(physical) {
  let str = '';

  if ('dimensions' in physical) {
    str += `<section class="physical-dimensions">
      <span class="label">Dimensions</span>
      <span class="value">
        <data data-key="physical-dimensions-0">${physical.dimensions[0]}</data> &times;
        <data data-key="physical-dimensions-1">${physical.dimensions[1]}</data> &times;
        <data data-key="physical-dimensions-2">${physical.dimensions[2]}</data>mm
        <span class="hint">width &times; height &times; depth</span>
      </span>
    </section>`;
  }

  if ('weight' in physical) {
    str += `<section class="physical-weight">
      <span class="label">Weight</span>
      <span class="value"><data data-key="physical-weight">${physical.weight}</data>kg</span>
    </section>`;
  }

  if ('power' in physical) {
    str += `<section class="physical-power">
      <span class="label">Power</span>
      <span class="value"><data data-key="physical-power">${physical.power}</data>W</span>
    </section>`;
  }

  if ('DMXconnector' in physical) {
    str += `<section class="physical-DMXconnector">
      <span class="label">DMX connector</span>
      <span class="value"><data data-key="physical-DMXconnector">${physical.DMXconnector}</data></span>
    </section>`;
  }

  if ('bulb' in physical) {
    str += '<section class="physical-bulb">';
    str += '<h4>Bulb</h4>';

    if ('type' in physical.bulb) {
      str += `<section class="physical-bulb-type">
        <span class="label">Bulb type</span>
        <span class="value"><data data-key="physical-bulb-type">${physical.bulb.type}</data></span>
      </section>`;
    }

    if ('colorTemperature' in physical.bulb) {
      str += `<section class="physical-bulb-colorTemperature">
        <span class="label">Color temperature</span>
        <span class="value"><data data-key="physical-bulb-colorTemperature">${physical.bulb.colorTemperature}</data>K</span>
      </section>`;
    }

    if ('lumens' in physical.bulb) {
      str += `<section class="physical-bulb-lumens">
        <span class="label">Lumens</span>
        <span class="value"><data data-key="physical-bulb-lumens">${physical.bulb.lumens}</data></span>
      </section>`;
    }

    str += '</section>';
  }

  if ('lens' in physical) {
    str += '<section class="physical-lens">';
    str += '<h4>Lens</h4>';

    if ('name' in physical.lens) {
      str += `<section class="physical-lens-name">
        <span class="label">Name</span>
        <span class="value"><data data-key="physical-lens-name">${physical.lens.name}</data></span>
      </section>`;
    }

    if ('degreesMinMax' in physical.lens) {
      str += `<section class="physical-lens-degreesMinMax">
        <span class="label">Light cone</span>
        <span class="value"><data data-key="physical-lens-degreesMin">${physical.lens.degreesMinMax[0]}</data>..<data data-key="physical-lens-degreesMin">${physical.lens.degreesMinMax[1]}</data>°</span>
      </section>`;
    }

    str += '</section>';
  }

  if ('focus' in physical) {
    str += '<section class="physical-focus">';
    str += '<h4>Focus</h4>';

    if ('type' in physical.focus) {
      str += `<section class="physical-focus-type">
        <span class="label">Type</span>
        <span class="value"><data data-key="physical-focus-type">${physical.focus.type}</data></span>
      </section>`;
    }

    if ('panMax' in physical.focus) {
      str += `<section class="physical-focus-panMax">
        <span class="label">Max. pan</span>
        <span class="value"><data data-key="physical-focus-panMax">${physical.focus.panMax}</data>°</span>
      </section>`;
    }

    if ('tiltMax' in physical.focus) {
      str += `<section class="physical-focus-tiltMax">
        <span class="label">Max. tilt</span>
        <span class="value"><data data-key="physical-focus-tiltMax">${physical.focus.tiltMax}</data>°</span>
      </section>`;
    }

    str += '</section>';
  }

  return str;
}

function handleChannel(channel) {
  let str = `<section class="channel-type">
    <span class="label">Type</span>
    <span class="value"><data data-key="channel-type">${channel.type}</data></span>
  </section>`;

  if ('color' in channel) {
    str += `<section class="channel-color">
      <span class="label">Color</span>
      <span class="value"><data data-key="channel-color">${channel.color}</data></span>
    </section>`;
  }

  if ('defaultValue' in channel) {
    str += `<section class="channel-defaultValue">
      <span class="label">Default value</span>
      <span class="value"><data data-key="channel-defaultValue">${channel.defaultValue}</data></span>
    </section>`;
  }

  if ('highlightValue' in channel) {
    str += `<section class="channel-highlightValue">
      <span class="label">Highlight value</span>
      <span class="value"><data data-key="channel-highlightValue">${channel.highlightValue}</data></span>
    </section>`;
  }

  if ('invert' in channel) {
    str += `<section class="channel-invert">
      <span class="label">Invert</span>
      <span class="value"><data class="checkbox" data-key="channel-invert" data-value="${channel.invert}">${channel.invert}</data></span>
    </section>`;
  }

  if ('constant' in channel) {
    str += `<section class="channel-constant">
      <span class="label">Constant</span>
      <span class="value"><data class="checkbox" data-key="channel-constant" data-value="${channel.constant}">${channel.constant}</data></span>
    </section>`;
  }

  if ('crossfade' in channel) {
    str += `<section class="channel-crossfade">
      <span class="label">Crossfade</span>
      <span class="value"><data class="checkbox" data-key="channel-crossfade" data-value="${channel.crossfade}">${channel.crossfade}</data></span>
    </section>`;
  }

  if ('precedence' in channel) {
    str += `<section class="channel-precedence">
      <span class="label">Precedence</span>
      <span class="value"><data data-key="channel-precedence">${channel.precedence}</data></span>
    </section>`;
  }

  if ('capabilities' in channel) {
    str += '<details class="channel-capabilities">';
    str += '  <summary>Capabilities</summary>';
    str += '  <table>';
    str += '    <tbody>';

    channel.capabilities.forEach(cap => {
      str += '<tr>';

      str += '<td class="capability-range0" title="DMX value start">';
      str += `  <data data-key="capability-range-0">${_(cap.range[0])}</data>`;
      str += '</td>';

      str += '<td class="capability-range1" title="DMX value end">';
      str += `  <data data-key="capability-range-1">${_(cap.range[1])}</data>`;
      str += '</td>';

      str += '<td class="capability-name" title="name">';
      str += `  <data data-key="capability-name">${_(cap.name)}</data>`;
      str += '</td>';

      str += '<td class="capability-menuClick" title="menu click action">';
      str += `  <data data-key="capability-menuClick">${_(cap.menuClick)}</data>`;
      str += '</td>';

      str += '<td class="capability-color" title="color: ${cap.color}">';
      str += `  <data class="color" data-key="capability-color" data-value="${cap.color}">${_(cap.color)}</data>`;
      str += '</td>';

      str += '<td class="capability-color2" title="color 2: ${cap.color2}">';
      str += `  <data class="color" data-key="capability-color2" data-value="${cap.color2}">${_(cap.color2)}</data>`;
      str += '</td>';

      str += '<td class="capability-image" title="image">';
      str += `  <data data-key="capability-image">${_(cap.image)}</data>`;
      str += '</td>';

      str += '</tr>';
    });

    str += '    </tbody>';
    str += '  </table>';
    str += '</details>';
  }

  return str;
}