#!/usr/bin/node

const fs = require('fs');
const path = require('path');
const util = require('util')
const colors = require('colors');
const validUrl = require('valid-url');

const fixturePath = path.join(__dirname, '..', 'fixtures');
const schemas = require(path.join(fixturePath, 'schema'));

let usedShortNames = [];

let promises = [];
for (const man of fs.readdirSync(fixturePath)) {
  manDir = path.join(fixturePath, man);

  // only directories
  if (fs.statSync(manDir).isDirectory()) {
    for (const fixture of fs.readdirSync(manDir)) {
      if (path.extname(fixture) == '.json') {
        promises.push(handleFile(path.join(manDir, fixture)));
      }
    }
  }
}

// check defaults
promises.push(new Promise((resolve, reject) => {
  const filename = path.join(fixturePath, 'defaults.js');
  checkFixture(require(filename), filename, resolve);
}));

// check manufacturers file
promises.push(new Promise((resolve, reject) => {
  const filename = path.join(fixturePath, 'manufacturers.json');

  fs.readFile(filename, 'utf8', (readError, data) => {
    if (readError) {
      return resolveError(`File '${filename}' could not be read.`, readError, resolve);
    }

    let manufacturers;

    try {
      manufacturers = JSON.parse(data);
    }
    catch (parseError) {
      return resolveError(`File '${filename}' could not be parsed.`, parseError, resolve);
    }

    const schemaErrors = schemas.Manufacturers.errors(manufacturers);
    if (schemaErrors !== false) {
      return resolveError(`File '${filename}' does not match schema.`, schemaErrors, resolve);
    }

    resolve(filename);
  });
}));

function handleFile(filename) {
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

      checkFixture(fixture, filename, resolve);
    });
  });
}

function checkFixture(fixture, filename, resolve) {
  const schemaErrors = schemas.Fixture.errors(fixture);
  if (schemaErrors !== false) {
    return resolveError(`File '${filename}' does not match schema.`, schemaErrors, resolve);
  }

  try {
    const shortName = fixture.shortName || fixture.name;
    if (usedShortNames.indexOf(shortName) != -1) {
      resolveError(`shortName '${shortName}' not unique in file '${filename}'.`, null, resolve);
    }
    usedShortNames.push(shortName);

    if (new Date(fixture.meta.lastModifyDate) < new Date(fixture.meta.createDate)) {
      resolveError(`meta.lastModifyDate is earlier than meta.createDate in file '${filename}'.`, null, resolve);
    }

    if ('physical' in fixture
      && 'lens' in fixture.physical
      && 'degreesMinMax' in fixture.physical.lens
      && fixture.physical.lens.degreesMinMax[0] > fixture.physical.lens.degreesMinMax[1]
      ) {
      resolveError(`physical.lens.degreesMinMax is an invalid range in file '${filename}'.`, null, resolve);
    }

    let usedModeShortNames = [];
    let usedChannels = [];

    for (let i=0; i<fixture.modes.length; i++) {
      const mode = fixture.modes[i];

      const modeShortName = mode.shortName || mode.name;
      if (usedModeShortNames.indexOf(modeShortName) != -1) {
        resolveError(`shortName '${modeShortName}' not unique in mode #${i} in file '${filename}'.`, null, resolve);
      }
      usedModeShortNames.push(modeShortName);

      if (/\bmode\b/i.test(mode.name) || /\bmode\b/i.test(mode.shortName)) {
        resolveError(`mode name and shortName must not contain the word 'mode' in mode '${modeShortName}' (#${i}) in file '${filename}'.`, null, resolve);
      }

      if ('physical' in mode
        && 'lens' in mode.physical
        && 'degreesMinMax' in mode.physical.lens
        && mode.physical.lens.degreesMinMax[0] > mode.physical.lens.degreesMinMax[1]
        ) {
        resolveError(`physical.lens.degreesMinMax is an invalid range in mode '${modeShortName}' (#${i}) in file '${filename}'.`, null, resolve);
      }

      for (const ch of mode.channels) {
        if (!(ch in fixture.availableChannels) && ch !== null) {
          resolveError(`channel '${ch}' referenced from mode '${modeShortName}' (#${i}) but missing in file '${filename}'.`, null, resolve);
        }
        usedChannels.push(ch);
      }
    }

    if ('multiByteChannels' in fixture) {
      for (let i=0; i<fixture.multiByteChannels.length; i++) {
        const chs = fixture.multiByteChannels[i];

        for (let j=0; j<chs.length; j++) {
          if (!fixture.availableChannels[chs[j]]) {
            resolveError(`channel '${chs[j]}' referenced from multiByteChannels but missing in file '${filename}'.`, null, resolve);
          }
        }
      }
    }

    if ('heads' in fixture) {
      for (const key in fixture.heads) {
        const head = fixture.heads[key];

        for (let i=0; i<head.length; i++) {
          if (!fixture.availableChannels[head[i]]) {
            resolveError(`channel '${head[i]}' referenced from head '${key}' but missing in file '${filename}'.`, null, resolve);
          }
        }
      }
    }

    for (const ch in fixture.availableChannels) {
      if (usedChannels.indexOf(ch) == -1) {
        console.warn(colors.yellow('Warning:') + ` Channel '${ch}' defined but never used in file '${filename}'.`);
      }

      const channel = fixture.availableChannels[ch];

      if ('color' in channel && channel.type !== 'SingleColor') {
        console.warn(colors.yellow('Warning:') + ` color in channel '${ch}' defined but channel type is not 'SingleColor' in file '${filename}'.`);
      }

      if ('capabilities' in channel) {
        for (let i=0; i<channel.capabilities.length; i++) {
          const cap = channel.capabilities[i];

          if (cap.range[0] > cap.range[1]
            || (i > 0 && cap.range[0] <= channel.capabilities[i-1].range[1])
            ) {
            resolveError(`range invalid in capability #${i} in channel '${ch}' in file '${filename}'.`, null, resolve);
          }

          if ('center' in cap && 'hideInMenu' in cap && cap.hideInMenu) {
            resolveError(`center is unused since hideInMenu is set in capability #${i} in channel '${ch}' in file '${filename}'.`, null, resolve);
          }

          if ((
            ('color' in cap && cap.color.length > 0)
            || ('image' in cap && cap.image.length > 0)
            ) && ['MultiColor', 'Effect', 'Gobo'].indexOf(channel.type) == -1) {
            resolveError(`color or image present in capability #${i} but improper channel type '${channel.type}' in channel '${ch}' in file '${filename}'.`, null, resolve);
          }

          if ('color2' in cap && cap.color2.length > 0
            && (!('color' in cap) || cap.color.length == 0)) {
            resolveError(`color2 present but color missing in capability #${i} in channel '${ch}' in file '${filename}'.`, null, resolve);
          }

          if ('image' in cap && cap.image.length > 0
            && 'color' in cap && cap.color.length > 0) {
            resolveError(`color and image cannot be present at the same time in capability #${i} in channel '${ch}' in file '${filename}'.`, null, resolve);
          }
        }
      }
    }
  }
  catch (accessError) {
    return resolveError(`Access error happened in '${filename}'.`, accessError, resolve);
  }

  resolve(filename);
}

function resolveError(str, error, resolve) {
  if (error) {
    console.error(colors.red('[FAIL] ') + str + '\n', util.inspect(error, false, null));
  }
  else {
    console.error(colors.red('[FAIL] ') + str);
  }
  resolve(null);
}


Promise.all(promises).then(results => {
  let fails = 0;
  for (const filename of results) {
    if (filename === null) {
      fails++;
    }
    else {
      console.log(colors.green('[PASS]') + ' ' + filename);
    }
  }

  if (fails == 0) {
    console.log('\n' + colors.green('[PASS]') + ` All ${results.length} tested fixtures were valid.`);
    process.exit(0);
  }

  console.error('\n' + colors.red('[FAIL]') + ` ${fails} of ${results.length} tested fixtures failed.`);
  process.exit(1);
});