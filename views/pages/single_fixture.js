const fs = require('fs');
const path = require('path');

module.exports = function(options) {
  const {manufacturers, man, fix} = options;
  const manufacturer = manufacturers[man];

  const fixture = JSON.parse(fs.readFileSync(path.join(options.baseDir, 'fixtures', man, fix + '.json'), 'utf-8'));
  
  options.title = `${manufacturer.name} ${fixture.name} - Open Fixture Library`;

  let str = require('../includes/header')(options);

  str += `<h1><a href="/${man}"><data data-key="manufacturer">${manufacturer.name}</data></a> <data data-key="name">${fixture.name}</data> <code><data data-key="shortName">${_(fixture.shortName)}</data></code></h1>`;

  str += '<section class="fixture-meta">';
  str += `<span class="last-modify-date">Last modified: <date>${fixture.meta.lastModifyDate}</date></span>`;
  str += `<span class="create-date">Created: <date>${fixture.meta.createDate}</date></span>`;
  str += `<span class="authors">Authors: <data>${fixture.meta.authors.join(', ')}</data></span>`;
  str += `<span class="source"><a href="http://github.com/FloEdelmann/open-fixture-library/tree/master/fixtures/${man}/${fix}.json">Source</a></span>`;
  str += `<span class="revisions"><a href="http://github.com/FloEdelmann/open-fixture-library/commits/master/fixtures/${man}/${fix}.json">Revisions</a></span>`;
  str += '</section>';

  str += `<section class="fixture-info card">`;

  str += '  <section class="categories">';
  str += '    <label>Categories</label>';
  str += '    <span class="value">';
  str += fixture.categories.map(cat => {
    const svg = require('../includes/svg')({categoryName: cat});
    return `<a href="/categories/${encodeURIComponent(cat)}">${svg} <data data-key="category">${cat}</data></a>`;
  }).join('<br />');
  str += '    </span>';
  str += '  </section>';

  str += '  <section class="comment">';
  str += '    <label>Comment</label>';
  str += `    <span class="value"><data data-key="comment">${_(fixture.comment)}</data></span>`;
  str += '  </section>';

  str += '  <section class="manualURL">';
  str += '    <label>Manual</label>';
  str += `    <span class="value"><a href="${_(fixture.manualURL)}"><data data-key="manualURL">${_(fixture.manualURL)}</data></a></span>`;
  str += '  </section>';

  str += '  <h3 class="physical">Physical data</h3>';
  str += '  <section class="physical">';
  str += handlePhysicalData(fixture.physical);
  str += '  </section>';

  str += `</section>`;

  fixture.modes.forEach(mode => {
    str += '<section class="fixture-mode card">';
    str += `<h2>${mode.name} <code>${_(mode.shortName)}</code></h2>`;

    str += '<h3>Physical overrides</h3>';
    if (mode.physical) {
      str += '<section class="physical physical-override">';
      str += handlePhysicalData(mode.physical);
      str += '</section>';
    }
    else {
      str += '<section class="physical physical-override empty">';
      str += '  No physical overrides';
      str += '</section>';
    }

    str += `<h3>Channels</h3>`;
    str += `<ol>`
    mode.channels.forEach((ch, i) => {
      let channel = fixture.availableChannels[ch];

      str += `<li data-index="${i}">`;
      str += `<details class="channel" data-channel="${ch}">`;
      str += `<summary>${channel.name || ch}</summary>`;
      str += handleChannel(channel);
      str += `</details>`;
      str += `</li>`;
    });
    str += `</ol>`;
    str += `</section>`;
  });

  str += '<section class="fixture-multi-byte-channels card">';
  str += '<h2>Multi-byte channels</h2>';
  if (fixture.multiByteChannels) {
    str += '<ul>';
    fixture.multiByteChannels.forEach(multiByteChannel => {
      str += '<li>';
      str += multiByteChannel.map(channel => {
        const name = fixture.availableChannels[channel].name || channel;
        return `<data class="channel" data-channel="${channel}">${name}</data>`;
      }).join(', ');
      str += `</li>`;
    });
    str += '</ul>';
  }
  else {
    str += 'None';
  }
  str += `</section>`;

  str += '<section class="fixture-heads card">';
  str += '<h2>Heads</h2>';
  if (fixture.heads) {
    str += '<ul>';
    for (const head in fixture.heads) {
      str += '<li>';
      str += `<strong>${head}:</strong> `;
      str += fixture.heads[head].map(channel => {
        const name = fixture.availableChannels[channel].name || channel;
        return `<data class="channel" data-channel="${channel}">${name}</data>`;
      }).join(', ');
      str += `</li>`;
    }
    str += '</ul>';
  }
  else {
    str += 'None';
  }
  str += `</section>`;

  str += require('../includes/footer')(options);

  return str;
};

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
  let str = `<section class="physical-dimensions">
    <label>Dimensions</label>
    <span class="value">
      <data data-key="physical-dimensions-0">${physical.dimensions ? physical.dimensions[0] : ''}</data> &times;
      <data data-key="physical-dimensions-1">${physical.dimensions ? physical.dimensions[1] : ''}</data> &times;
      <data data-key="physical-dimensions-2">${physical.dimensions ? physical.dimensions[2] : ''}</data>mm
      <span class="hint">width &times; height &times; depth</span>
    </span>
  </section>`;

  str += `<section class="physical-weight">
    <label>Weight</label>
    <span class="value"><data data-key="physical-weight">${_(physical.weight)}</data>kg</span>
  </section>`;

  str += `<section class="physical-power">
    <label>Power</label>
    <span class="value"><data data-key="physical-power">${_(physical.power)}</data>W</span>
  </section>`;

  str += `<section class="physical-DMXconnector">
    <label>DMX connector</label>
    <span class="value"><data data-key="physical-DMXconnector">${_(physical.DMXconnector)}</data></span>
  </section>`;


  str += '<section class="physical-bulb">';
  str += '  <h4>Bulb</h4>';
  str += `  <section class="physical-bulb-type">
    <label>Bulb type</label>
    <span class="value"><data data-key="physical-bulb-type">${physical.bulb ? _(physical.bulb.type) : ''}</data></span>
  </section>`;
  str += `  <section class="physical-bulb-colorTemperature">
    <label>Color temperature</label>
    <span class="value"><data data-key="physical-bulb-colorTemperature">${physical.bulb ? _(physical.bulb.colorTemperature) : ''}</data>K</span>
  </section>`;
  str += `  <section class="physical-bulb-lumens">
    <label>Lumens</label>
    <span class="value"><data data-key="physical-bulb-lumens">${physical.bulb ? _(physical.bulb.lumens) : ''}</data></span>
  </section>`;
  str += '</section>';


  str += '<section class="physical-lens">';
  str += '  <h4>Lens</h4>';
  str += `  <section class="physical-lens-name">
    <label>Name</label>
    <span class="value"><data data-key="physical-lens-name">${physical.lens ? _(physical.lens.name) : ''}</data></span>
  </section>`;
  str += `  <section class="physical-lens-degreesMinMax">
    <label>Light cone</label>
    <span class="value"><data data-key="physical-lens-degreesMin">${physical.lens && physical.lens.degreesMinMax ? _(physical.lens.degreesMinMax[0]) : ''}</data>..<data data-key="physical-lens-degreesMin">${physical.lens && physical.lens.degreesMinMax ? _(physical.lens.degreesMinMax[1]) : ''}</data>°</span>
  </section>`;
  str += '</section>';


  str += '<section class="physical-focus">';
  str += '  <h4>Focus</h4>';
  str += `  <section class="physical-focus-type">
    <label>Type</label>
    <span class="value"><data data-key="physical-focus-type">${physical.focus ? _(physical.focus.type) : ''}</data></span>
  </section>`;
  str += `  <section class="physical-focus-panMax">
    <label>Max. pan</label>
    <span class="value"><data data-key="physical-focus-panMax">${physical.focus ? _(physical.focus.panMax) : ''}</data>°</span>
  </section>`
  str += `  <section class="physical-focus-tiltMax">
    <label>Max. tilt</label>
    <span class="value"><data data-key="physical-focus-tiltMax">${physical.focus ? _(physical.focus.tiltMax) : ''}</data>°</span>
  </section>`;
  str += '</section>';

  return str;
}

function handleChannel(channel) {
  let str = `<section class="channel-type">
    <label>Type</label>
    <span class="value"><data data-key="channel-type">${_(channel.type)}</data></span>
  </section>`;

  str += `<section class="channel-color">
    <label>Color</label>
    <span class="value"><data data-key="channel-color">${_(channel.color)}</data> <span class="hint">(only useful if <code>Type</code> is <code>SingleColor</code>)</span></span>
  </section>`;

  str += `<section class="channel-defaultValue">
    <label>Default value</label>
    <span class="value"><data data-key="channel-defaultValue">${_(channel.defaultValue)}</data></span>
  </section>`;

  str += `<section class="channel-highlightValue">
    <label>Highlight value</label>
    <span class="value"><data data-key="channel-highlightValue">${_(channel.highlightValue)}</data></span>
  </section>`;

  str += `<section class="channel-invert">
    <label>Invert</label>
    <span class="value"><data class="checkbox" data-key="channel-invert" data-value="${channel.invert}">${_(channel.invert)}</data></span>
  </section>`;

  str += `<section class="channel-constant">
    <label>Constant</label>
    <span class="value"><data class="checkbox" data-key="channel-constant" data-value="${channel.constant}">${_(channel.constant)}</data></span>
  </section>`;

  str += `<section class="channel-crossfade">
    <label>Crossfade</label>
    <span class="value"><data class="checkbox" data-key="channel-crossfade" data-value="${channel.crossfade}">${_(channel.crossfade)}</data></span>
  </section>`;

  str += `<section class="channel-precedence">
    <label>Precedence</label>
    <span class="value"><data data-key="channel-precedence">${_(channel.precedence)}</data></span>
  </section>`;

  if (channel.capabilities) {
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
  else {
    str += '<details class="channel-capabilities empty">';
    str += '  <summary>No capabilities</summary>';
    str += '  <table><tbody></tbody></table>';
    str += '</details>';
  }

  return str;
}