const fs = require('fs');
const path = require('path');

module.exports = function(options) {
  const {manufacturers, man, fix} = options;
  const manufacturer = manufacturers[man];

  const fixture = JSON.parse(fs.readFileSync(path.join(options.baseDir, 'fixtures', man, fix + '.json'), 'utf-8'));
  
  options.title = `${manufacturer.name} ${fixture.name} - Open Fixture Library`;

  let str = require('../includes/header')(options);

  str += `<h1><a href="/${man}"><data data-key="manufacturer">${manufacturer.name}</data></a> <data data-key="name">${fixture.name}</data> <code><data data-key="shortName">${_(fixture.shortName)}</data></code><a href="/${man}/${fix}.qlcplus">QLC+</a></h1>`;

  str += '<section class="fixture-meta">';
  str += `<span class="last-modify-date">Last modified:&nbsp;<date>${fixture.meta.lastModifyDate}</date></span>`;
  str += `<span class="create-date">Created:&nbsp;<date>${fixture.meta.createDate}</date></span>`;
  str += `<span class="authors">Author${fixture.meta.authors.length == 1 ? '' : 's'}:&nbsp;<data>${fixture.meta.authors.join(', ')}</data></span>`;
  str += `<span class="source"><a href="http://github.com/FloEdelmann/open-fixture-library/tree/master/fixtures/${man}/${fix}.json">Source</a></span>`;
  str += `<span class="revisions"><a href="http://github.com/FloEdelmann/open-fixture-library/commits/master/fixtures/${man}/${fix}.json">Revisions</a></span>`;
  str += '</section>';

  str += '<section class="fixture-info card">';

  str += '  <section class="categories">';
  str += '    <label>Categories</label>';
  str += '    <span class="value">';
  str += fixture.categories.map(cat => {
    const svg = require('../includes/svg')({categoryName: cat});
    return `<a href="/categories/${encodeURIComponent(cat)}">${svg} <data data-key="category">${cat}</data></a>`;
  }).join('<br />');
  str += '    </span>';
  str += '  </section>';

  if ('comment' in fixture) {
    str += '<section class="comment">';
    str += '  <label>Comment</label>';
    str += `  <span class="value"><data data-key="comment">${fixture.comment}</data></span>`;
    str += '</section>';
  }

  if ('manualURL' in fixture) {
    str += '<section class="manualURL">';
    str += '  <label>Manual</label>';
    str += `  <span class="value"><a href="${fixture.manualURL}"><data data-key="manualURL">${fixture.manualURL}</data></a></span>`;
    str += '</section>';
  }

  if ('physical' in fixture) {
    str += '<h3 class="physical">Physical data</h3>';
    str += '<section class="physical">';
    str += handlePhysicalData(fixture.physical);
    str += '</section>';
  }

  if ('multiByteChannel' in fixture || 'heads' in fixture) {
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
        str += `</li>`;
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

  fixture.modes.forEach(mode => {
    let heading = mode.name;
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

    str += `<h3>Channels</h3>`;
    str += `<ol>`
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
    str += '</section>';
  });

  str += '<div class="clearfix"></div>';

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
      <label>Dimensions</label>
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
      <label>Weight</label>
      <span class="value"><data data-key="physical-weight">${physical.weight}</data>kg</span>
    </section>`;
  }

  if ('power' in physical) {
    str += `<section class="physical-power">
      <label>Power</label>
      <span class="value"><data data-key="physical-power">${physical.power}</data>W</span>
    </section>`;
  }

  if ('DMXconnector' in physical) {
    str += `<section class="physical-DMXconnector">
      <label>DMX connector</label>
      <span class="value"><data data-key="physical-DMXconnector">${physical.DMXconnector}</data></span>
    </section>`;
  }

  if ('bulb' in physical) {
    str += '<section class="physical-bulb">';
    str += '<h4>Bulb</h4>';

    if ('type' in physical.bulb) {
      str += `<section class="physical-bulb-type">
        <label>Bulb type</label>
        <span class="value"><data data-key="physical-bulb-type">${physical.bulb.type}</data></span>
      </section>`;
    }

    if ('colorTemperature' in physical.bulb) {
      str += `<section class="physical-bulb-colorTemperature">
        <label>Color temperature</label>
        <span class="value"><data data-key="physical-bulb-colorTemperature">${physical.bulb.colorTemperature}</data>K</span>
      </section>`;
    }

    if ('lumens' in physical.bulb) {
      str += `<section class="physical-bulb-lumens">
        <label>Lumens</label>
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
        <label>Name</label>
        <span class="value"><data data-key="physical-lens-name">${physical.lens.name}</data></span>
      </section>`;
    }

    if ('degreesMinMax' in physical.lens) {
      str += `<section class="physical-lens-degreesMinMax">
        <label>Light cone</label>
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
        <label>Type</label>
        <span class="value"><data data-key="physical-focus-type">${physical.focus.type}</data></span>
      </section>`;
    }

    if ('panMax' in physical.focus) {
      str += `<section class="physical-focus-panMax">
        <label>Max. pan</label>
        <span class="value"><data data-key="physical-focus-panMax">${physical.focus.panMax}</data>°</span>
      </section>`;
    }

    if ('tiltMax' in physical.focus) {
      str += `<section class="physical-focus-tiltMax">
        <label>Max. tilt</label>
        <span class="value"><data data-key="physical-focus-tiltMax">${physical.focus.tiltMax}</data>°</span>
      </section>`;
    }

    str += '</section>';
  }

  return str;
}

function handleChannel(channel) {
  let str = `<section class="channel-type">
    <label>Type</label>
    <span class="value"><data data-key="channel-type">${channel.type}</data></span>
  </section>`;

  if ('color' in channel) {
    str += `<section class="channel-color">
      <label>Color</label>
      <span class="value"><data data-key="channel-color">${channel.color}</data></span>
    </section>`;
  }

  if ('defaultValue' in channel) {
    str += `<section class="channel-defaultValue">
      <label>Default value</label>
      <span class="value"><data data-key="channel-defaultValue">${channel.defaultValue}</data></span>
    </section>`;
  }

  if ('highlightValue' in channel) {
    str += `<section class="channel-highlightValue">
      <label>Highlight value</label>
      <span class="value"><data data-key="channel-highlightValue">${channel.highlightValue}</data></span>
    </section>`;
  }

  if ('invert' in channel) {
    str += `<section class="channel-invert">
      <label>Invert</label>
      <span class="value"><data class="checkbox" data-key="channel-invert" data-value="${channel.invert}">${channel.invert}</data></span>
    </section>`;
  }

  if ('constant' in channel) {
    str += `<section class="channel-constant">
      <label>Constant</label>
      <span class="value"><data class="checkbox" data-key="channel-constant" data-value="${channel.constant}">${channel.constant}</data></span>
    </section>`;
  }

  if ('crossfade' in channel) {
    str += `<section class="channel-crossfade">
      <label>Crossfade</label>
      <span class="value"><data class="checkbox" data-key="channel-crossfade" data-value="${channel.crossfade}">${channel.crossfade}</data></span>
    </section>`;
  }

  if ('precedence' in channel) {
    str += `<section class="channel-precedence">
      <label>Precedence</label>
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

      str += `<td class="capability-range0" title="DMX value start">`;
      str += `  <data data-key="capability-range-0">${_(cap.range[0])}</data>`;
      str += `</td>`;

      str += `<td class="capability-range1" title="DMX value end">`;
      str += `  <data data-key="capability-range-1">${_(cap.range[1])}</data>`;
      str += `</td>`;

      str += `<td class="capability-name" title="name">`;
      str += `  <data data-key="capability-name">${_(cap.name)}</data>`;
      str += `</td>`;

      str += `<td class="capability-hideInMenu" title="hide in menu? ${cap.hideInMenu}">`;
      str += `  <data class="checkbox" data-key="capability-hideInMenu" data-value="${cap.hideInMenu}">${_(cap.hideInMenu)}</data>`;
      str += `</td>`;

      str += `<td class="capability-center" title="use center value on menu click? ${cap.center}">`;
      str += `  <data class="checkbox" data-key="capability-center" data-value="${cap.center}">${_(cap.center)}</data>`;
      str += `</td>`;

      str += `<td class="capability-color" title="color: ${cap.color}">`;
      str += `  <data class="color" data-key="capability-color" data-value="${cap.color}">${_(cap.color)}</data>`;
      str += `</td>`;

      str += `<td class="capability-color2" title="color 2: ${cap.color2}">`;
      str += `  <data class="color" data-key="capability-color2" data-value="${cap.color2}">${_(cap.color2)}</data>`;
      str += `</td>`;

      str += `<td class="capability-image" title="image">`;
      str += `  <data data-key="capability-image">${_(cap.image)}</data>`;
      str += `</td>`;

      str += '</tr>';
    });

    str += '    </tbody>';
    str += '  </table>';
    str += '</details>';
  }

  return str;
}