const path = require('path');
const util = require('util');
const colors = require('colors');

const schemas = require(path.join(__dirname, '..', 'fixtures', 'schema'));

let usedShortNames = [];

module.exports.checkFixture = function checkFixture(fixture, usedShortNames=[]) {
  let result = {
    errors: [],
    warnings: [],
    usedShortNames: usedShortNames
  };

  const schemaErrors = schemas.Fixture.errors(fixture);
  if (schemaErrors !== false) {
    result.errors.push({
      description: 'File does not match schema.',
      error: schemaErrors
    });
    return result;
  }

  try {
    const shortName = fixture.shortName || fixture.name;
    if (usedShortNames.indexOf(shortName) != -1) {
      result.errors.push({
        description: `shortName '${shortName}' not unique.`,
        error: null
      });
    }
    usedShortNames.push(shortName);

    if (new Date(fixture.meta.lastModifyDate) < new Date(fixture.meta.createDate)) {
      result.errors.push({
        description: `meta.lastModifyDate is earlier than meta.createDate.`,
        error: null
      });
    }

    if ('physical' in fixture
      && 'lens' in fixture.physical
      && 'degreesMinMax' in fixture.physical.lens
      && fixture.physical.lens.degreesMinMax[0] > fixture.physical.lens.degreesMinMax[1]
      ) {
      result.errors.push({
        description: `physical.lens.degreesMinMax is an invalid range.`,
        error: null
      });
    }

    let usedModeShortNames = [];
    let usedChannels = [];

    for (let i=0; i<fixture.modes.length; i++) {
      const mode = fixture.modes[i];

      const modeShortName = mode.shortName || mode.name;
      if (usedModeShortNames.indexOf(modeShortName) != -1) {
        result.errors.push({
          description: `shortName '${modeShortName}' not unique in mode #${i}.`,
          error: null
        });
      }
      usedModeShortNames.push(modeShortName);

      if (/\bmode\b/i.test(mode.name) || /\bmode\b/i.test(mode.shortName)) {
        result.errors.push({
          description: `mode name and shortName must not contain the word 'mode' in mode '${modeShortName}' (#${i}).`,
          error: null
        });
      }

      if ('physical' in mode
        && 'lens' in mode.physical
        && 'degreesMinMax' in mode.physical.lens
        && mode.physical.lens.degreesMinMax[0] > mode.physical.lens.degreesMinMax[1]
        ) {
        result.errors.push({
          description: `physical.lens.degreesMinMax is an invalid range in mode '${modeShortName}' (#${i}).`,
          error: null
        });
      }

      for (const ch of mode.channels) {
        if (!(ch in fixture.availableChannels) && ch !== null) {
          result.errors.push({
            description: `channel '${ch}' referenced from mode '${modeShortName}' (#${i}) but missing.`,
            error: null
          });
        }
        usedChannels.push(ch);
      }
    }

    if ('multiByteChannels' in fixture) {
      for (let i=0; i<fixture.multiByteChannels.length; i++) {
        const chs = fixture.multiByteChannels[i];

        for (let j=0; j<chs.length; j++) {
          if (!fixture.availableChannels[chs[j]]) {
            result.errors.push({
              description: `channel '${chs[j]}' referenced from multiByteChannels but missing.`,
              error: null
            });
          }
        }
      }
    }

    if ('heads' in fixture) {
      for (const key in fixture.heads) {
        const head = fixture.heads[key];

        for (let i=0; i<head.length; i++) {
          if (!fixture.availableChannels[head[i]]) {
            result.errors.push({
              description: `channel '${head[i]}' referenced from head '${key}' but missing.`,
              error: null
            });
          }
        }
      }
    }

    for (const ch in fixture.availableChannels) {
      if (usedChannels.indexOf(ch) == -1) {
        result.warnings.push(`Channel '${ch}' defined but never used.`);
      }

      const channel = fixture.availableChannels[ch];

      if ('color' in channel && channel.type !== 'SingleColor') {
        result.warnings.push(`color in channel '${ch}' defined but channel type is not 'SingleColor'.`);
      }

      if ('capabilities' in channel) {
        for (let i=0; i<channel.capabilities.length; i++) {
          const cap = channel.capabilities[i];

          if (cap.range[0] > cap.range[1]
            || (i > 0 && cap.range[0] <= channel.capabilities[i-1].range[1])
            ) {
            result.errors.push({
              description: `range invalid in capability #${i} in channel '${ch}'.`,
              error: null
            });
          }

          if ('center' in cap && 'hideInMenu' in cap && cap.hideInMenu) {
            result.errors.push({
              description: `center is unused since hideInMenu is set in capability #${i} in channel '${ch}'.`,
              error: null
            });
          }

          if ((
            ('color' in cap && cap.color.length > 0)
            || ('image' in cap && cap.image.length > 0)
            ) && ['MultiColor', 'Effect', 'Gobo'].indexOf(channel.type) == -1) {
            result.errors.push({
              description: `color or image present in capability #${i} but improper channel type '${channel.type}' in channel '${ch}'.`,
              error: null
            });
          }

          if ('color2' in cap && cap.color2.length > 0
            && (!('color' in cap) || cap.color.length == 0)) {
            result.errors.push({
              description: `color2 present but color missing in capability #${i} in channel '${ch}'.`,
              error: null
            });
          }

          if ('image' in cap && cap.image.length > 0
            && 'color' in cap && cap.color.length > 0) {
            result.errors.push({
              description: `color and image cannot be present at the same time in capability #${i} in channel '${ch}'.`,
              error: null
            });
          }
        }
      }
    }
  }
  catch (accessError) {
    result.errors.push({
      description: 'Access error.',
      error: accessError
    });
  }

  return result;
}