const path = require('path');

const schemas = require(path.join(__dirname, '..', 'fixtures', 'schema'));

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
    if (usedShortNames.indexOf(shortName) !== -1) {
      result.errors.push({
        description: `shortName '${shortName}' not unique.`,
        error: null
      });
    }
    usedShortNames.push(shortName);

    if (new Date(fixture.meta.lastModifyDate) < new Date(fixture.meta.createDate)) {
      result.errors.push({
        description: 'meta.lastModifyDate is earlier than meta.createDate.',
        error: null
      });
    }

    if ('physical' in fixture
      && 'lens' in fixture.physical
      && 'degreesMinMax' in fixture.physical.lens
      && fixture.physical.lens.degreesMinMax[0] > fixture.physical.lens.degreesMinMax[1]
      ) {
      result.errors.push({
        description: 'physical.lens.degreesMinMax is an invalid range.',
        error: null
      });
    }

    let usedModeShortNames = [];
    let usedChannels = [];
    let definedChannels = Object.keys(fixture.availableChannels);

    for (let i=0; i<fixture.modes.length; i++) {
      const mode = fixture.modes[i];

      const modeShortName = mode.shortName || mode.name;
      if (usedModeShortNames.indexOf(modeShortName) !== -1) {
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
        if (ch === null) {
          continue;
        }

        usedChannels.push(ch);

        if (ch in fixture.availableChannels) {
          continue;
        }

        const isValidFineChannelAlias = mode.channels.some(function(modeCh) {
          return modeCh !== null
            && modeCh in fixture.availableChannels
            && 'fineChannelAliases' in fixture.availableChannels[modeCh]
            && fixture.availableChannels[modeCh].fineChannelAliases.includes(ch);
        });

        if (!isValidFineChannelAlias) {
          result.errors.push({
            description: `channel '${ch}' referenced from mode '${modeShortName}' (#${i}) but is not defined. Note: fine channels can only be used in the same mode as their coarse counterpart.`,
            error: null
          });
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
      if (usedChannels.indexOf(ch) === -1) {
        result.warnings.push(`Channel '${ch}' defined but never used.`);
      }

      const channel = fixture.availableChannels[ch];

      const name = 'name' in channel ? channel.name : ch;
      if (/\s+fine(?:^\d+)?$/i.test(name)) {
        result.errors.push({
          description: `Channel '${ch}' should rather be a fine channel alias of its corresponding coarse channel, or its name must not end with 'fine'.`,
          error: null
        });
      }

      let testFineChannelCausesOverlapping = false;
      let dmxMaxBound = 256;
      if ('fineChannelAliases' in channel) {
        channel.fineChannelAliases.forEach(alias => {
          dmxMaxBound *= 256;
          if (usedChannels.indexOf(alias) === -1) {
            result.warnings.push(`Fine channel alias '${alias}' defined in channel '${ch}' but never used.`);
          }
          if (definedChannels.indexOf(alias) !== -1) {
            result.errors.push({
              description: `Fine channel alias '${alias}' in channel '${ch}' is already defined.`,
              error: null
            });
          }
          definedChannels.push(alias);
        });

        testFineChannelCausesOverlapping = fixture.modes.some(mode => {
          return mode.channels.indexOf(ch) !== -1 && channel.fineChannelAliases.every(chKey => mode.channels.indexOf(chKey) === -1);
        });
      }

      if ('defaultValue' in channel && channel.defaultValue >= dmxMaxBound) {
        result.errors.push({
          description: `defaultValue must be strictly less than ${dmxMaxBound} in channel '${ch}'.`,
          error: null
        });
      }

      if ('highlightValue' in channel && channel.highlightValue >= dmxMaxBound) {
        result.errors.push({
          description: `highlightValue must be strictly less than ${dmxMaxBound} in channel '${ch}'.`,
          error: null
        });
      }

      if ('color' in channel && channel.type !== 'SingleColor') {
        result.warnings.push(`color in channel '${ch}' defined but channel type is not 'SingleColor'.`);
      }

      if (!('color' in channel) && channel.type === 'SingleColor') {
        result.errors.push({
          description: `color in channel '${ch}' undefined but channel type is 'SingleColor'.`,
          error: null
        });
      }

      if ('capabilities' in channel) {
        for (let i=0; i<channel.capabilities.length; i++) {
          const cap = channel.capabilities[i];

          if (cap.range[1] >= dmxMaxBound) {
            result.errors.push({
              description: `range values must be strictly less than ${dmxMaxBound} in capability #${i} in channel '${ch}'.`,
              error: null
            });
            break;
          }

          if (cap.range[0] > cap.range[1]) {
            result.errors.push({
              description: `range invalid in capability #${i} in channel '${ch}'.`,
              error: null
            });
            break;
          }

          if (i > 0 && cap.range[0] <= channel.capabilities[i-1].range[1]) {
            result.errors.push({
              description: `ranges overlapping in capabilities #${i-1} and #${i} in channel '${ch}'.`,
              error: null
            });
            break;
          }

          if (i > 0 && testFineChannelCausesOverlapping) {
            const lastRangeEnd = channel.capabilities[i-1].range[1] / Math.pow(256, channel.fineChannelAliases.length);
            const rangeStart = cap.range[0] / Math.pow(256, channel.fineChannelAliases.length);

            if (lastRangeEnd <= rangeStart) {
              result.errors.push({
                description: `ranges overlapping when used in coarse channel only mode in capabilities #${i-1} and #${i} in channel '${ch}'.`,
                error: null
              });
            }
          }

          if (('color' in cap || ('image' in cap && cap.image.length > 0))
            && ['MultiColor', 'Effect', 'Gobo'].indexOf(channel.type) === -1) {
            result.errors.push({
              description: `color or image present in capability #${i} but improper channel type '${channel.type}' in channel '${ch}'.`,
              error: null
            });
          }

          if ('color2' in cap && !('color' in cap)) {
            result.errors.push({
              description: `color2 present but color missing in capability #${i} in channel '${ch}'.`,
              error: null
            });
          }

          if ('image' in cap && cap.image.length > 0 && 'color' in cap) {
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
};