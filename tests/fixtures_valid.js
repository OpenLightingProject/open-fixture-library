const fs = require('fs');
const path = require('path');
const colors = require('colors');
const validUrl = require('valid-url');


const fixturePath = path.join(__dirname, '..', 'fixtures');

let promises = [];

for (const man of fs.readdirSync(fixturePath)) {
  manDir = path.join(fixturePath, man);

  // only directories
  if (fs.statSync(manDir).isDirectory()) {
    for (const fixture of fs.readdirSync(manDir)) {
      if (path.extname(fixture) == '.json') {
        promises.push(checkFixture(path.join(manDir, fixture)));
      }
    }
  }
}

let usedShortNames = [];

const dateRegExp = /^\d{4}-\d{2}-\d{2}$/;
const hexRegExp = /^#[0-9a-f]{6}$/;
const channelTypes = ['Intensity', 'Strobe', 'Shutter', 'Speed', 'SingleColor', 'MultiColor', 'Gobo', 'Prism', 'Pan', 'Tilt', 'Beam', 'Effect', 'Maintenance', 'Nothing'];
const channelColors = ['Generic', 'Red', 'Green', 'Blue', 'Cyan', 'Magenta', 'Yellow', 'Amber', 'White', 'UV', 'Lime'];

function checkFixture(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (readError, data) => {
      if (readError) {
        return resolveError(`File '${filename}' could not be read.`, readError, resolve);
      }

      let fixture;

      try {
        fixture = JSON.parse(data);
      }
      catch (parseError) {
        return resolveError(`File '${filename}' could not be parsed.`, parseError, resolve);
      }

      try {
        if (!('name' in fixture) || typeof fixture.name !== 'string') {
          resolveError(`name missing / wrong type in file '${filename}'.`, null, resolve);
        }

        if (!('shortName' in fixture)) {
          fixture.shortName = fixture.name;
        }
        else if (typeof fixture.shortName !== 'string') {
          resolveError(`shortName has wrong type in file '${filename}'.`, null, resolve);
        }

        if (usedShortNames.indexOf(fixture.shortName) != -1) {
          resolveError(`shortName '${fixture.shortName}' not unique in file '${filename}'.`, null, resolve);
        }
        usedShortNames.push(fixture.shortName);

        delete fixture.name;
        delete fixture.shortName;

        if (!('type' in fixture) || typeof fixture.type !== 'string') {
          resolveError(`type missing / wrong type in file '${filename}'.`, null, resolve);
        }
        delete fixture.type;

        if ('comment' in fixture && typeof fixture.comment !== 'string') {
          resolveError(`comment has wrong type in file '${filename}'.`, null, resolve);
        }
        delete fixture.comment;

        if ('manualURL' in fixture && (typeof fixture.manualURL !== 'string' || !validUrl.isUri(fixture.manualURL))) {
          resolveError(`manualURL is not a valid URL in file '${filename}'.`, null, resolve);
        }
        delete fixture.manualURL;

        if (!('meta' in fixture) || typeof fixture.meta !== 'object') {
          return resolveError(`meta missing / wrong type in file '${filename}'.`, null, resolve);
        }

        if (!fixture.meta.authors || !Array.isArray(fixture.meta.authors)) {
          resolveError(`meta.authors missing / wrong type in file '${filename}'.`, null, resolve);
        }
        delete fixture.meta.authors;

        if (!fixture.meta.createDate || !dateRegExp.test(fixture.meta.createDate)) {
          resolveError(`meta.createDate missing / wrong format in file '${filename}'.`, null, resolve);
        }

        if (!fixture.meta.lastModifyDate
          || !dateRegExp.test(fixture.meta.lastModifyDate)
          || new Date(fixture.meta.lastModifyDate) < new Date(fixture.meta.createDate)
          ) {
          resolveError(`meta.lastModifyDate missing / wrong format in file '${filename}'.`, null, resolve);
        }
        delete fixture.meta.createDate;
        delete fixture.meta.lastModifyDate;

        handleLeftoverKeys(fixture.meta, 'meta.', resolve, `in file '${filename}'`);
        delete fixture.meta;

        if ('physical' in fixture) {
          handlePhysical(fixture.physical, resolve, `in file '${filename}'`);
          delete fixture.physical;
        }

        if (!('availableChannels' in fixture) || typeof fixture.availableChannels !== 'object') {
          return resolveError(`availableChannels missing / wrong type in file '${filename}'.`, null, resolve);
        }

        if (!('modes' in fixture) || !Array.isArray(fixture.modes)) {
          return resolveError(`modes missing in file '${filename}'.`, null, resolve);
        }

        let usedModeShortNames = [];
        let usedChannels = [];

        for (let i=0; i<fixture.modes.length; i++) {
          const mode = fixture.modes[i];

          if (typeof mode !== 'object') {
            return resolveError(`mode #${i} has wrong type in file '${filename}'.`, null, resolve);
          }

          if (!mode.name) {
            resolveError(`name missing / wrong type in mode #${i} in file '${filename}'.`, null, resolve);
          }

          if (!mode.shortName) {
            mode.shortName = mode.name;
          }
          else if (typeof mode.shortName !== 'string') {
            resolveError(`shortName has wrong type in mode #${i} in file '${filename}'.`, null, resolve);
          }

          if (usedModeShortNames.indexOf(mode.shortName) != -1) {
            resolveError(`shortName '${mode.shortName}' not unique in file '${filename}'.`, null, resolve);
          }
          usedModeShortNames.push(mode.shortName);

          delete mode.name;
          delete mode.shortName;

          if (mode.physical) {
            handlePhysical(mode.physical, resolve, `in mode #${i} in file '${filename}'`);
            delete mode.physical;
          }

          if (!mode.channels || !Array.isArray(mode.channels)) {
            return resolveError(`channels missing / wrong type in mode #${i} in file '${filename}'.`, null, resolve);
          }

          for (const ch of mode.channels) {
            if (!fixture.availableChannels[ch]) {
              resolveError(`channel '${ch}' referenced from mode #${i} but missing in file '${filename}'.`, null, resolve);
            }
            usedChannels.push(ch);
          }
          delete mode.channels;

          handleLeftoverKeys(mode, '', resolve, `in mode #${i} in file '${filename}'`);
        }
        delete fixture.modes;

        if ('multiByteChannels' in fixture) {
          if (!Array.isArray(fixture.multiByteChannels)) {
            resolveError(`multiByteChannels has wrong type in file '${filename}'.`, null, resolve);
          }

          for (let i=0; i<fixture.multiByteChannels.length; i++) {
            const chs = fixture.multiByteChannels[i];

            if (!Array.isArray(chs)) {
              return resolveError(`multiByteChannels #${i} has wrong type in file '${filename}'.`, null, resolve);
            }

            for (let j=0; j<chs.length; j++) {
              if (!fixture.availableChannels[chs[j]]) {
                resolveError(`channel '${chs[j]}' referenced from multiByteChannels but missing in file '${filename}'.`, null, resolve);
              }
            }
          }

          delete fixture.multiByteChannels;
        }

        if ('heads' in fixture) {
          if (typeof fixture.heads !== 'object') {
            return resolveError(`heads has wrong type in file '${filename}'.`, null, resolve);
          }

          for (const key in fixture.heads) {
            const head = fixture.heads[key];

            if (!Array.isArray(head)) {
              return resolveError(`head '${key}' has wrong type in file '${filename}'.`, null, resolve);
            }

            for (let i=0; i<head.length; i++) {
              if (!fixture.availableChannels[head[i]]) {
                resolveError(`channel '${head[i]}' referenced from head '${key}' but missing in file '${filename}'.`, null, resolve);
              }
            }
          }

          delete fixture.heads;
        }

        for (const ch in fixture.availableChannels) {
          if (usedChannels.indexOf(ch) == -1) {
            console.warn(colors.yellow('Warning:') + ` Channel '${ch}' defined but never used in file '${filename}'.`);
          }

          handleChannel(fixture, ch, resolve, filename);
        }
        delete fixture.availableChannels;

        handleLeftoverKeys(fixture, '', resolve, `in file '${filename}'`);
      }
      catch (accessError) {
        return resolveError(`Access error happened in '${filename}'.`, accessError, resolve);
      }

      resolve(filename);
    });
  });
}

function handlePhysical(physical, resolve, position) {
  if (typeof physical !== 'object') {
    return resolveError(`physical has wrong type ${position}.`, null, resolve);
  }

  if ('dimensions' in physical
    && (!Array.isArray(physical.dimensions)
      || physical.dimensions.length != 3
      || typeof physical.dimensions[0] !== 'number'
      || typeof physical.dimensions[1] !== 'number'
      || typeof physical.dimensions[2] !== 'number'
      || physical.dimensions[0] <= 0
      || physical.dimensions[1] <= 0
      || physical.dimensions[2] <= 0
    )) {
    resolveError(`physical.dimensions has wrong type / format ${position}.`, null, resolve);
  }
  delete physical.dimensions;

  if ('weight' in physical && (typeof physical.weight !== 'number' || physical.weight <= 0)) {
    resolveError(`physical.weight has wrong type ${position}.`, null, resolve);
  }
  delete physical.weight;

  if ('power' in physical && (typeof physical.power !== 'number' || physical.power <= 0)) {
    resolveError(`physical.power has wrong type ${position}.`, null, resolve);
  }
  delete physical.power;

  if ('DMXconnector' in physical && typeof physical.DMXconnector !== 'string') {
    resolveError(`physical.DMXconnector has wrong type ${position}.`, null, resolve);
  }
  delete physical.DMXconnector;

  if ('bulb' in physical) {
    if ('type' in physical.bulb && typeof physical.bulb.type !== 'string') {
      resolveError(`physical.bulb.type has wrong type ${position}.`, null, resolve);
    }
    delete physical.bulb.type;

    if ('colorTemperature' in physical.bulb && (typeof physical.bulb.colorTemperature !== 'number' || physical.bulb.colorTemperature <= 0)) {
      resolveError(`physical.bulb.colorTemperature has wrong type ${position}.`, null, resolve);
    }
    delete physical.bulb.colorTemperature;

    if ('lumens' in physical.bulb && (typeof physical.bulb.lumens !== 'number' || physical.bulb.lumens <= 0)) {
      resolveError(`physical.bulb.lumens has wrong type ${position}.`, null, resolve);
    }
    delete physical.bulb.lumens;

    handleLeftoverKeys(physical.bulb, 'physical.bulb.', resolve, position);
    delete physical.bulb;
  }

  if ('lens' in physical) {
    if ('name' in physical.lens && typeof physical.lens.name !== 'string') {
      resolveError(`physical.lens.name has wrong type ${position}.`, null, resolve);
    }
    delete physical.lens.name;

    if ('degreesMinMax' in physical.lens && !isRange(physical.lens.degreesMinMax, 0, 360)) {
      resolveError(`physical.lens.degreesMinMax is an invalid range ${position}.`, null, resolve);
    }
    delete physical.lens.degreesMinMax;

    handleLeftoverKeys(physical.lens, 'physical.lens.', resolve, position);
    delete physical.lens;
  }

  if ('focus' in physical) {
    if ('type' in physical.focus && typeof physical.focus.type !== 'string') {
      resolveError(`physical.focus.type has wrong type ${position}.`, null, resolve);
    }
    delete physical.focus.type;

    if ('panMax' in physical.focus && (typeof physical.focus.panMax !== 'number' || physical.focus.panMax <= 0)) {
      resolveError(`physical.focus.panMax has wrong type ${position}.`, null, resolve);
    }
    delete physical.focus.panMax;

    if ('tiltMax' in physical.focus && (typeof physical.focus.tiltMax !== 'number' || physical.focus.tiltMax <= 0)) {
      resolveError(`physical.focus.tiltMax has wrong type ${position}.`, null, resolve);
    }
    delete physical.focus.tiltMax;

    handleLeftoverKeys(physical.focus, 'physical.focus.', resolve, position);
    delete physical.focus;
  }

  handleLeftoverKeys(physical, 'physical.', resolve, position);
}

function handleChannel(fixture, ch, resolve, filename) {
  const channel = fixture.availableChannels[ch];

  if (typeof channel !== 'object') {
    return resolveError(`Channel '${ch}' has wrong type in file '${filename}'.`, null, resolve);
  }

  if ('name' in channel && typeof channel.name !== 'string') {
    resolveError(`name in channel '${ch}' has wrong type in file '${filename}'.`, null, resolve);
  }
  delete channel.name;

  if (!('type' in channel) || channelTypes.indexOf(channel.type) == -1) {
    resolveError(`type in channel '${ch}' missing / invalid in file '${filename}'.`, null, resolve);
  }

  if ('color' in channel && channel.type !== 'SingleColor') {
    console.warn(colors.yellow('Warning:') + ` color in channel '${ch}' defined but channel type is not 'SingleColor' in file '${filename}'.`);
  }
  delete channel.type;

  if ('color' in channel && channelColors.indexOf(channel.color) == -1) {
    resolveError(`color in channel '${ch}' invalid in file '${filename}'.`, null, resolve);
  }
  delete channel.color;

  if ('defaultValue' in channel
    && (typeof channel.defaultValue !== 'number'
      || channel.defaultValue < 0
      || channel.defaultValue > 255
    )) {
    resolveError(`defaultValue in channel '${ch}' invalid in file '${filename}'.`, null, resolve);
  }
  delete channel.defaultValue;

  if ('highlightValue' in channel
    && (typeof channel.highlightValue !== 'number'
      || channel.highlightValue < 0
      || channel.highlightValue > 255
    )) {
    resolveError(`highlightValue in channel '${ch}' invalid in file '${filename}'.`, null, resolve);
  }
  delete channel.highlightValue;

  if ('invert' in channel && typeof channel.invert !== 'boolean') {
    resolveError(`invert in channel '${ch}' has wrong type in file '${filename}'.`, null, resolve);
  }
  delete channel.invert;

  if ('constant' in channel && typeof channel.constant !== 'boolean') {
    resolveError(`constant in channel '${ch}' has wrong type in file '${filename}'.`, null, resolve);
  }
  delete channel.constant;

  if ('crossfade' in channel && typeof channel.crossfade !== 'boolean') {
    resolveError(`crossfade in channel '${ch}' has wrong type in file '${filename}'.`, null, resolve);
  }
  delete channel.crossfade;

  if ('precendence' in channel && channel.precendence !== 'LTP' && channel.precendence !== 'HTP') {
    resolveError(`precendence in channel '${ch}' invalid in file '${filename}'.`, null, resolve);
  }
  delete channel.precendence;

  if ('capabilities' in channel) {
    if (!Array.isArray(channel.capabilities)) {
      return resolveError(`capabilities in channel '${ch}' has wrong type in file '${filename}'.`, null, resolve);
    }

    for (let i=0; i<channel.capabilities.length; i++) {
      const cap = channel.capabilities[i];

      if (typeof cap !== 'object') {
        return resolveError(`capability #${i} in channel '${ch}' has wrong type in file '${filename}'.`, null, resolve);
      }

      if (!('range' in cap) || !isRange(cap.range, 0, 255)) {
        resolveError(`range missing / invalid in capability #${i} in channel '${ch}' in file '${filename}'.`, null, resolve);
      }
      delete cap.range;

      if (!('name' in cap) || typeof cap.name !== 'string') {
        resolveError(`name missing / wrong type in capability #${i} in channel '${ch}' in file '${filename}'.`, null, resolve);
      }
      delete cap.name;

      if ('showInMenu' in cap && typeof cap.showInMenu !== 'boolean') {
        resolveError(`showInMenu has wrong type in capability #${i} in channel '${ch}' in file '${filename}'.`, null, resolve);
      }
      delete cap.showInMenu;

      if ('center' in cap && typeof cap.center !== 'boolean') {
        resolveError(`center has wrong type in capability #${i} in channel '${ch}' in file '${filename}'.`, null, resolve);
      }
      delete cap.center;

      if ('color2' in cap && !('color' in cap)) {
        resolveError(`color2 present but color missing in capability #${i} in channel '${ch}' in file '${filename}'.`, null, resolve);
      }

      if ('color' in cap && (typeof cap.color !== 'string' || !hexRegExp.test(cap.color))) {
        resolveError(`color has wrong type in capability #${i} in channel '${ch}' in file '${filename}'.`, null, resolve);
      }
      delete cap.color;

      if ('color2' in cap && (typeof cap.color2 !== 'string' || !hexRegExp.test(cap.color2))) {
        resolveError(`color2 has wrong type in capability #${i} in channel '${ch}' in file '${filename}'.`, null, resolve);
      }
      delete cap.color2;

      if ('image' in cap && typeof cap.image !== 'string') {
        resolveError(`image has wrong type in capability #${i} in channel '${ch}' in file '${filename}'.`, null, resolve);
      }
      delete cap.image;

      handleLeftoverKeys(cap, '', resolve, `in capability #${i} in channel '${ch}' in file '${filename}'`);
    }

    delete channel.capabilities;
  }

  handleLeftoverKeys(channel, '', resolve, `in channel '${ch}' in file '${filename}'`);
}

function handleLeftoverKeys(object, prefix, resolve, position) {
  let leftoverKeys = Object.keys(object).map(key => prefix + key);
  if (leftoverKeys.length > 0) {
    resolveError(`There are leftover keys [${leftoverKeys.toString()}] ${position}.`, null, resolve);
  }
}

function resolveError(str, error, resolve) {
  if (error) {
    console.error(colors.red('[FAIL] ') + str + '\n', error);
  }
  else {
    console.error(colors.red('[FAIL] ') + str);
  }
  resolve(false);
}

function isRange(array, min, max) {
  return Array.isArray(array)
    && array.length == 2
    && typeof array[0] === 'number'
    && typeof array[1] === 'number'
    && array[0] >= min
    && array[1] <= max
    && array[0] <= array[1];
}


Promise.all(promises).then(results => {
  let fails = 0;
  for (const result of results) {
    if (result === false) {
      fails++;
    }
    else {
      console.log(colors.green('[PASS]') + ' ' + result);
    }
  }

  if (fails == 0) {
    console.log('\n' + colors.green('[PASS]') + ` All ${results.length} tested fixtures were valid.`);
    process.exit(0);
  }

  console.error('\n' + colors.red('[FAIL]') + ` ${fails} of ${results.length} tested fixtures failed.`);
  process.exit(1);
});