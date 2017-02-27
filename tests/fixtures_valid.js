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

let shortNames = [];
const dateRegExp = /^\d{4}-\d{2}-\d{2}$/;
const hexRegExp = /^#[0-9a-f]{6}$/;
const channelTypes = ['Intensity', 'Strobe', 'Shutter', 'Speed', 'SingleColor', 'MultiColor', 'Gobo', 'Prism', 'Pan', 'Tilt', 'Beam', 'Effect', 'Maintenance', 'Nothing'];
const channelColors = ['Generic', 'Red', 'Green', 'Blue', 'Cyan', 'Magenta', 'Yellow', 'Amber', 'White', 'UV', 'Lime'];

function checkFixture(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (readError, data) => {
      if (readError) {
        resolveError(`File '${filename}' could not be read.`, readError, resolve);
        return;
      }

      let fixture;

      try {
        fixture = JSON.parse(data);
      }
      catch (parseError) {
        resolveError(`File '${filename}' could not be parsed.`, parseError, resolve);
        return;
      }

      try {
        if (!('name' in fixture) || typeof fixture.name !== 'string') {
          resolveError(`name missing / wrong type in file '${filename}'.`, null, resolve);
          return;
        }

        if (!('shortName' in fixture)) {
          fixture.shortName = fixture.name;
        }
        else if (typeof fixture.shortName !== 'string') {
          resolveError(`shortName has wrong type in file '${filename}'.`, null, resolve);
          return;
        }

        if (shortNames.indexOf(fixture.shortName) != -1) {
          resolveError(`shortName '${fixture.shortName}' not unique in file '${filename}'.`, null, resolve);
          return;
        }
        shortNames.push(fixture.shortName);

        delete fixture.name;
        delete fixture.shortName;

        if (!('type' in fixture) || typeof fixture.type !== 'string') {
          resolveError(`type missing / wrong type in file '${filename}'.`, null, resolve);
          return;
        }
        delete fixture.type;

        if ('comment' in fixture && typeof fixture.comment !== 'string') {
          resolveError(`comment has wrong type in file '${filename}'.`, null, resolve);
          return;
        }
        delete fixture.comment;

        if ('manualURL' in fixture && (typeof fixture.manualURL !== 'string' || !validUrl.isUri(fixture.manualURL))) {
          resolveError(`manualURL is not a valid URL in file '${filename}'.`, null, resolve);
          return;
        }
        delete fixture.manualURL;

        if (!('meta' in fixture) || typeof fixture.meta !== 'object') {
          resolveError(`meta missing / wrong type in file '${filename}'.`, null, resolve);
          return;
        }

        if (!fixture.meta.authors || !Array.isArray(fixture.meta.authors)) {
          resolveError(`meta.authors missing / wrong type in file '${filename}'.`, null, resolve);
          return;
        }
        delete fixture.meta.authors;

        if (!fixture.meta.createDate || !dateRegExp.test(fixture.meta.createDate)) {
          resolveError(`meta.createDate missing / wrong format in file '${filename}'.`, null, resolve);
          return;
        }

        if (!fixture.meta.lastModifyDate
          || !dateRegExp.test(fixture.meta.lastModifyDate)
          || new Date(fixture.meta.lastModifyDate) < new Date(fixture.meta.createDate)
          ) {
          resolveError(`meta.lastModifyDate missing / wrong format in file '${filename}'.`, null, resolve);
          return;
        }
        delete fixture.meta.createDate;
        delete fixture.meta.lastModifyDate;

        if (!handleLeftoverKeys(fixture.meta, 'meta.', resolve, `in file '${filename}'`)) {
          return;
        }
        delete fixture.meta;

        if ('physical' in fixture) {
          let success = handlePhysical(fixture.physical, resolve, `in file '${filename}'`);

          if (!success) {
            return;
          }
          delete fixture.physical;
        }

        if (!('availableChannels' in fixture) || typeof fixture.availableChannels !== 'object') {
          resolveError(`availableChannels missing / wrong type in file '${filename}'.`, null, resolve);
          return;
        }

        if (!('modes' in fixture) || !Array.isArray(fixture.modes)) {
          resolveError(`modes missing in file '${filename}'.`, null, resolve);
          return;
        }

        let modeShortNames = [];
        let usedChannels = [];

        for (let i=0; i<fixture.modes.length; i++) {
          const mode = fixture.modes[i];

          if (typeof mode !== 'object') {
            resolveError(`mode #${i} has wrong type in file '${filename}'.`, null, resolve);
            return;
          }

          if (!mode.name) {
            resolveError(`name missing / wrong type in mode #${i} in file '${filename}'.`, null, resolve);
            return;
          }

          if (!mode.shortName) {
            mode.shortName = mode.name;
          }
          else if (typeof mode.shortName !== 'string') {
            resolveError(`shortName has wrong type in mode #${i} in file '${filename}'.`, null, resolve);
            return;
          }

          if (modeShortNames.indexOf(mode.shortName) != -1) {
            resolveError(`shortName '${mode.shortName}' not unique in file '${filename}'.`, null, resolve);
            return;
          }
          modeShortNames.push(mode.shortName);

          delete mode.name;
          delete mode.shortName;

          if (mode.physical) {
            let success = handlePhysical(mode.physical, resolve, `in mode #${i} in file '${filename}'`);

            if (!success) {
              return;
            }
            delete mode.physical;
          }

          if (!mode.channels || !Array.isArray(mode.channels)) {
            resolveError(`channels missing / wrong type in mode #${i} in file '${filename}'.`, null, resolve);
            return;
          }

          for (const ch of mode.channels) {
            if (!fixture.availableChannels[ch]) {
              resolveError(`channel '${ch}' referenced from mode #${i} but missing in file '${filename}'.`, null, resolve);
              return;
            }
            usedChannels.push(ch);
          }
          delete mode.channels;

          if (!handleLeftoverKeys(mode, '', resolve, `in mode #${i} in file '${filename}'`)) {
            return;
          }
        }
        delete fixture.modes;

        if ('multiByteChannels' in fixture) {
          if (!Array.isArray(fixture.multiByteChannels)) {
            resolveError(`multiByteChannels has wrong type in file '${filename}'.`, null, resolve);
            return;
          }

          for (let i=0; i<fixture.multiByteChannels.length; i++) {
            const chs = fixture.multiByteChannels[i];

            if (!Array.isArray(chs)) {
              resolveError(`multiByteChannels #${i} has wrong type in file '${filename}'.`, null, resolve);
              return;
            }

            for (let j=0; j<chs.length; j++) {
              if (!fixture.availableChannels[chs[j]]) {
                resolveError(`channel '${chs[j]}' referenced from multiByteChannels but missing in file '${filename}'.`, null, resolve);
                return;
              }
            }
          }

          delete fixture.multiByteChannels;
        }

        if ('heads' in fixture) {
          if (typeof fixture.heads !== 'object') {
            resolveError(`heads has wrong type in file '${filename}'.`, null, resolve);
            return;
          }

          for (const key in fixture.heads) {
            const head = fixture.heads[key];

            if (!Array.isArray(head)) {
              resolveError(`head '${key}' has wrong type in file '${filename}'.`, null, resolve);
              return;
            }

            for (let i=0; i<head.length; i++) {
              if (!fixture.availableChannels[head[i]]) {
                resolveError(`channel '${head[i]}' referenced from head '${key}' but missing in file '${filename}'.`, null, resolve);
                return;
              }
            }
          }

          delete fixture.heads;
        }

        for (const ch in fixture.availableChannels) {
          if (usedChannels.indexOf(ch) == -1) {
            console.warn(colors.yellow('Warning:') + ` Channel '${ch}' defined but never used in file '${filename}'.`);
          }

          const success = handleChannel(fixture, ch, resolve, filename);
          if (!success) {
            return;
          }
        }
        delete fixture.availableChannels;

        if (!handleLeftoverKeys(fixture, '', resolve, `in file '${filename}'`)) {
          return;
        }
      }
      catch (accessError) {
        resolveError(`Access error happened in '${filename}'.`, accessError, resolve);
        return;
      }

      resolve(true);
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
    return resolveError(`physical.dimensions has wrong type / format ${position}.`, null, resolve);
  }
  delete physical.dimensions;

  if ('weight' in physical && (typeof physical.weight !== 'number' || physical.weight <= 0)) {
    return resolveError(`physical.weight has wrong type ${position}.`, null, resolve);
  }
  delete physical.weight;

  if ('power' in physical && (typeof physical.power !== 'number' || physical.power <= 0)) {
    return resolveError(`physical.power has wrong type ${position}.`, null, resolve);
  }
  delete physical.power;

  if ('DMXconnector' in physical && typeof physical.DMXconnector !== 'string') {
    return resolveError(`physical.DMXconnector has wrong type ${position}.`, null, resolve);
  }
  delete physical.DMXconnector;

  if ('bulb' in physical) {
    if ('type' in physical.bulb && typeof physical.bulb.type !== 'string') {
      return resolveError(`physical.bulb.type has wrong type ${position}.`, null, resolve);
    }
    delete physical.bulb.type;

    if ('colorTemperature' in physical.bulb && (typeof physical.bulb.colorTemperature !== 'number' || physical.bulb.colorTemperature <= 0)) {
      return resolveError(`physical.bulb.colorTemperature has wrong type ${position}.`, null, resolve);
    }
    delete physical.bulb.colorTemperature;

    if ('lumens' in physical.bulb && (typeof physical.bulb.lumens !== 'number' || physical.bulb.lumens <= 0)) {
      return resolveError(`physical.bulb.lumens has wrong type ${position}.`, null, resolve);
    }
    delete physical.bulb.lumens;

    if (!handleLeftoverKeys(physical.bulb, 'physical.bulb.', resolve, position)) {
      return false;
    }

    delete physical.bulb;
  }

  if ('lens' in physical) {
    if ('name' in physical.lens && typeof physical.lens.name !== 'string') {
      return resolveError(`physical.lens.name has wrong type ${position}.`, null, resolve);
    }
    delete physical.lens.name;

    if ('degreesMinMax' in physical.lens
      && (!Array.isArray(physical.lens.degreesMinMax)
        || physical.lens.degreesMinMax.length !== 2
        || typeof physical.lens.degreesMinMax[0] !== 'number'
        || typeof physical.lens.degreesMinMax[1] !== 'number'
        || physical.lens.degreesMinMax[0] < 0
        || physical.lens.degreesMinMax[1] > 360
        || physical.lens.degreesMinMax[0] > physical.lens.degreesMinMax[1]
      )) {
      return resolveError(`physical.lens.degreesMinMax is an invalid range ${position}.`, null, resolve);
    }
    delete physical.lens.degreesMinMax;

    if (!handleLeftoverKeys(physical.lens, 'physical.lens.', resolve, position)) {
      return false;
    }

    delete physical.lens;
  }

  if ('focus' in physical) {
    if ('type' in physical.focus && typeof physical.focus.type !== 'string') {
      return resolveError(`physical.focus.type has wrong type ${position}.`, null, resolve);
    }
    delete physical.focus.type;

    if ('panMax' in physical.focus && (typeof physical.focus.panMax !== 'number' || physical.focus.panMax <= 0)) {
      return resolveError(`physical.focus.panMax has wrong type ${position}.`, null, resolve);
    }
    delete physical.focus.panMax;

    if ('tiltMax' in physical.focus && (typeof physical.focus.tiltMax !== 'number' || physical.focus.tiltMax <= 0)) {
      return resolveError(`physical.focus.tiltMax has wrong type ${position}.`, null, resolve);
    }
    delete physical.focus.tiltMax;

    if (!handleLeftoverKeys(physical.focus, 'physical.focus.', resolve, position)) {
      return false;
    }

    delete physical.focus;
  }

  if (!handleLeftoverKeys(physical, 'physical.', resolve, position)) {
    return false;
  }

  return true;
}

function handleChannel(fixture, ch, resolve, filename) {
  const channel = fixture.availableChannels[ch];

  if (typeof channel !== 'object') {
    return resolveError(`Channel '${ch}' has wrong type in file '${filename}'.`, null, resolve);
  }

  if ('name' in channel && typeof channel.name !== 'string') {
    return resolveError(`name in channel '${ch}' has wrong type in file '${filename}'.`, null, resolve);
  }
  delete channel.name;

  if (!('type' in channel) || channelTypes.indexOf(channel.type) == -1) {
    return resolveError(`type in channel '${ch}' missing / invalid in file '${filename}'.`, null, resolve);
  }

  if ('color' in channel && channel.type !== 'SingleColor') {
    console.warn(colors.yellow('Warning:') + ` color in channel '${ch}' defined but channel type is not 'SingleColor' in file '${filename}'.`);
  }
  delete channel.type;

  if ('color' in channel && channelColors.indexOf(channel.color) == -1) {
    return resolveError(`color in channel '${ch}' invalid in file '${filename}'.`, null, resolve);
  }
  delete channel.color;

  if ('defaultValue' in channel
    && (typeof channel.defaultValue !== 'number'
      || channel.defaultValue < 0
      || channel.defaultValue > 255
    )) {
    return resolveError(`defaultValue in channel '${ch}' invalid in file '${filename}'.`, null, resolve);
  }
  delete channel.defaultValue;

  if ('highlightValue' in channel
    && (typeof channel.highlightValue !== 'number'
      || channel.highlightValue < 0
      || channel.highlightValue > 255
    )) {
    return resolveError(`highlightValue in channel '${ch}' invalid in file '${filename}'.`, null, resolve);
  }
  delete channel.highlightValue;

  if ('invert' in channel && typeof channel.invert !== 'boolean') {
    return resolveError(`invert in channel '${ch}' has wrong type in file '${filename}'.`, null, resolve);
  }
  delete channel.invert;

  if ('constant' in channel && typeof channel.constant !== 'boolean') {
    return resolveError(`constant in channel '${ch}' has wrong type in file '${filename}'.`, null, resolve);
  }
  delete channel.constant;

  if ('crossfade' in channel && typeof channel.crossfade !== 'boolean') {
    return resolveError(`crossfade in channel '${ch}' has wrong type in file '${filename}'.`, null, resolve);
  }
  delete channel.crossfade;

  if ('precendence' in channel && channel.precendence !== 'LTP' && channel.precendence !== 'HTP') {
    return resolveError(`precendence in channel '${ch}' invalid in file '${filename}'.`, null, resolve);
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

      if (!('range' in cap)
        || !Array.isArray(cap.range)
        || cap.range[0] < 0
        || cap.range[1] > 255
        || cap.range[0] > cap.range[1]
        ) {
        return resolveError(`range missing / invalid in capability #${i} in channel '${ch}' in file '${filename}'.`, null, resolve);
      }
      delete cap.range;

      if (!('name' in cap) || typeof cap.name !== 'string') {
        return resolveError(`name missing / wrong type in capability #${i} in channel '${ch}' in file '${filename}'.`, null, resolve);
      }
      delete cap.name;

      if ('showInMenu' in cap && typeof cap.showInMenu !== 'boolean') {
        return resolveError(`showInMenu has wrong type in capability #${i} in channel '${ch}' in file '${filename}'.`, null, resolve);
      }
      delete cap.showInMenu;

      if ('center' in cap && typeof cap.center !== 'boolean') {
        return resolveError(`center has wrong type in capability #${i} in channel '${ch}' in file '${filename}'.`, null, resolve);
      }
      delete cap.center;

      if ('color2' in cap && !('color' in cap)) {
        return resolveError(`color2 present but color missing in capability #${i} in channel '${ch}' in file '${filename}'.`, null, resolve);
      }

      if ('color' in cap && (typeof cap.color !== 'string' || !hexRegExp.test(cap.color))) {
        return resolveError(`color has wrong type in capability #${i} in channel '${ch}' in file '${filename}'.`, null, resolve);
      }
      delete cap.color;

      if ('color2' in cap && (typeof cap.color2 !== 'string' || !hexRegExp.test(cap.color2))) {
        return resolveError(`color2 has wrong type in capability #${i} in channel '${ch}' in file '${filename}'.`, null, resolve);
      }
      delete cap.color2;

      if ('image' in cap && typeof cap.image !== 'string') {
        return resolveError(`image has wrong type in capability #${i} in channel '${ch}' in file '${filename}'.`, null, resolve);
      }
      delete cap.image;

      if (!handleLeftoverKeys(cap, '', resolve, `in capability #${i} in channel '${ch}' in file '${filename}'`)) {
        return false;
      }
    }

    delete channel.capabilities;
  }

  if (!handleLeftoverKeys(channel, '', resolve, `in channel '${ch}' in file '${filename}'`)) {
    return false;
  }

  return true;
}

function handleLeftoverKeys(object, prefix, resolve, position) {
  let leftoverKeys = Object.keys(object).map(key => prefix + key);
  if (leftoverKeys.length > 0) {
    return resolveError(`There are leftover keys [${leftoverKeys.toString()}] ${position}.`, null, resolve);
  }

  return true;
}

function resolveError(str, error, resolve) {
  if (error) {
    console.error(colors.red('Error: ') + str + '\n', error);
  }
  else {
    console.error(colors.red('Error: ') + str);
  }
  resolve(false);
  return false;
}


Promise.all(promises).then(results => {
  let fails = 0;
  for (const result of results) {
    if (!result) {
      fails++;
    }
  }

  if (fails == 0) {
    console.log(colors.green('[PASS]') + ` All ${results.length} tested fixtures were valid.`);
    process.exit(0);
  }

  console.error(colors.red('[FAIL]') + ` ${fails} of ${results.length} tested fixtures failed.`);
  process.exit(1);
});