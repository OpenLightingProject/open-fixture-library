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
        if (!fixture.name || typeof fixture.name !== 'string') {
          resolveError(`name missing / wrong type in file '${filename}'.`, null, resolve);
          return;
        }

        if (!fixture.shortName) {
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

        if (!fixture.type || typeof fixture.type !== 'string') {
          resolveError(`type missing / wrong type in file '${filename}'.`, null, resolve);
          return;
        }
        delete fixture.type;

        if (fixture.comment && typeof fixture.comment !== 'string') {
          resolveError(`comment has wrong type in file '${filename}'.`, null, resolve);
          return;
        }
        delete fixture.comment;

        if (fixture.manualURL && (typeof fixture.manualURL !== 'string' || !validUrl.isUri(fixture.manualURL))) {
          resolveError(`manualURL is not a valid URL in file '${filename}'.`, null, resolve);
          return;
        }
        delete fixture.manualURL;

        if (!fixture.meta || typeof fixture.meta !== 'object') {
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

        if (fixture.physical) {
          let success = handlePhysical(fixture.physical, resolve, `in file '${filename}'`);

          if (!success) {
            return;
          }
          delete fixture.physical;
        }

        if (!fixture.availableChannels || typeof fixture.availableChannels !== 'object') {
          resolveError(`availableChannels missing / wrong type in file '${filename}'.`, null, resolve);
          return;
        }

        if (!fixture.modes || !Array.isArray(fixture.modes)) {
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

        if (fixture.multiByteChannels) {
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

        if (fixture.heads) {
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
            console.warn(colors.yellow(`Warning: Channel '${ch}' defined but never used in file '${filename}'.`));
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

  if (physical.dimensions
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

  if (physical.weight && (typeof physical.weight !== 'number' || physical.weight <= 0)) {
    return resolveError(`physical.weight has wrong type ${position}.`, null, resolve);
  }
  delete physical.weight;

  if (physical.power && (typeof physical.power !== 'number' || physical.power <= 0)) {
    return resolveError(`physical.power has wrong type ${position}.`, null, resolve);
  }
  delete physical.power;

  if (physical.DMXconnector && typeof physical.DMXconnector !== 'string') {
    return resolveError(`physical.DMXconnector has wrong type ${position}.`, null, resolve);
  }
  delete physical.DMXconnector;

  if (physical.bulb) {
    if (physical.bulb.type && typeof physical.bulb.type !== 'string') {
      return resolveError(`physical.bulb.type has wrong type ${position}.`, null, resolve);
    }
    delete physical.bulb.type;

    if (physical.bulb.colorTemperature && (typeof physical.bulb.colorTemperature !== 'number' || physical.bulb.colorTemperature <= 0)) {
      return resolveError(`physical.bulb.colorTemperature has wrong type ${position}.`, null, resolve);
    }
    delete physical.bulb.colorTemperature;

    if (physical.bulb.lumens && (typeof physical.bulb.lumens !== 'number' || physical.bulb.lumens <= 0)) {
      return resolveError(`physical.bulb.lumens has wrong type ${position}.`, null, resolve);
    }
    delete physical.bulb.lumens;

    if (!handleLeftoverKeys(physical.bulb, 'physical.bulb.', resolve, position)) {
      return false;
    }

    delete physical.bulb;
  }

  if (physical.lens) {
    if (physical.lens.name && typeof physical.lens.name !== 'string') {
      return resolveError(`physical.lens.name has wrong type ${position}.`, null, resolve);
    }
    delete physical.lens.name;

    if (physical.lens.degreesMinMax
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

  if (physical.focus) {
    if (physical.focus.type && typeof physical.focus.type !== 'string') {
      return resolveError(`physical.focus.type has wrong type ${position}.`, null, resolve);
    }
    delete physical.focus.type;

    if (physical.focus.panMax && (typeof physical.focus.panMax !== 'number' || physical.focus.panMax <= 0)) {
      return resolveError(`physical.focus.panMax has wrong type ${position}.`, null, resolve);
    }
    delete physical.focus.panMax;

    if (physical.focus.tiltMax && (typeof physical.focus.tiltMax !== 'number' || physical.focus.tiltMax <= 0)) {
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
  // TODO stub
  return true;
}

function handleLeftoverKeys(object, prefix, resolve, position) {
  let leftoverKeys = Object.keys(object).map(key => prefix + key);
  if (leftoverKeys.length > 0) {
    return resolveError(`There are leftover keys ${leftoverKeys.toString()} ${position}.`, null, resolve);
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