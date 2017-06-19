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
    if (usedShortNames.includes(shortName)) {
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

    if ('physical' in fixture) {
      checkPhysical(result, fixture.physical);
    }

    let usedModeShortNames = [];
    let usedChannels = [];

    let fineChannels = {}; // fine -> coarse, fine^2 -> coarse
    let switchingChannels = {}; // switching channel alias -> trigger channel

    const channelKeys = Object.keys(fixture.availableChannels);
    if (channelKeys.length === 0) {
      result.errors.push({
        description: 'availableChannels is empty. Please add a channel.',
        error: null
      });
    }
    for (const ch of channelKeys) {
      const channel = fixture.availableChannels[ch];

      const name = 'name' in channel ? channel.name : ch;
      if (/\s+fine(?:^\d+)?$/i.test(name)) {
        result.errors.push({
          description: `Channel '${ch}' should rather be a fine channel alias of its corresponding coarse channel, or its name must not end with 'fine'.`,
          error: null
        });
      }

      let testFineChannelOverlapping = false;
      let dmxMaxBound = 256;
      if ('fineChannelAliases' in channel) {
        for (const alias of channel.fineChannelAliases) {
          dmxMaxBound *= 256;
          if (alias in fixture.availableChannels || alias in fineChannels || alias in switchingChannels) {
            result.errors.push({
              description: `Fine channel alias '${alias}' in channel '${ch}' is already defined.`,
              error: null
            });
          }
          fineChannels[alias] = ch;
        }

        testFineChannelOverlapping = fixture.modes.some(mode => {
          return mode.channels.includes(ch) && channel.fineChannelAliases.every(chKey => !mode.channels.includes(chKey));
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
        let rangesInvalid = false;
        let switchesChannels = null; // array of switching channel aliases that depend on this channel

        for (let i = 0; i < channel.capabilities.length; i++) {
          const cap = channel.capabilities[i];

          // range invalid / overlapping
          if (rangesInvalid) {
            // one of the previous capabilities had an invalid range,
            // so it doesn't make sense checking further ranges
          }
          else if (cap.range[1] >= dmxMaxBound) {
            result.errors.push({
              description: `range values must be strictly less than ${dmxMaxBound} in capability #${i+1} in channel '${ch}'.`,
              error: null
            });
          }
          else if (cap.range[0] > cap.range[1]) {
            result.errors.push({
              description: `range invalid in capability #${i+1} in channel '${ch}'.`,
              error: null
            });
          }
          else if (i > 0 && cap.range[0] <= channel.capabilities[i-1].range[1]) {
            result.errors.push({
              description: `ranges overlapping in capabilities #${i} and #${i+1} in channel '${ch}'.`,
              error: null
            });
          }
          else if (i > 0 && testFineChannelOverlapping) {
            const lastRangeEnd = Math.floor(channel.capabilities[i-1].range[1] / Math.pow(256, channel.fineChannelAliases.length));
            const rangeStart = Math.floor(cap.range[0] / Math.pow(256, channel.fineChannelAliases.length));

            if (rangeStart <= lastRangeEnd) {
              result.errors.push({
                description: `ranges overlapping when used in coarse channel only mode in capabilities #${i} and #${i+1} in channel '${ch}'.`,
                error: null
              });
            }
          }

          if (('color' in cap || 'image' in cap) && !['MultiColor', 'Effect', 'Gobo'].includes(channel.type)) {
            result.errors.push({
              description: `color or image present in capability #${i+1} but improper channel type '${channel.type}' in channel '${ch}'.`,
              error: null
            });
          }

          if ('color2' in cap && !('color' in cap)) {
            result.errors.push({
              description: `color2 present but color missing in capability #${i+1} in channel '${ch}'.`,
              error: null
            });
          }

          if ('color' in cap && 'image' in cap) {
            result.errors.push({
              description: `color and image cannot be present at the same time in capability #${i+1} in channel '${ch}'.`,
              error: null
            });
          }

          if ('switchChannels' in cap) {
            const switchingChannelAliases = Object.keys(cap.switchChannels);

            // first capability with switching channels
            if (switchesChannels === null) {
              switchesChannels = switchingChannelAliases;

              for (const alias of switchingChannelAliases) {
                if (alias in fixture.availableChannels || alias in fineChannels || alias in switchingChannels) {
                  result.errors.push({
                    description: `Switching channel alias '${alias}' in channel '${ch}' is already defined.`,
                    error: null
                  });
                }
                switchingChannels[alias] = ch;
              }

              // one or more previous capabilities didn't use this property
              if (i > 0) {
                result.errors.push({
                  description: `All capabilities up to '${cap.name}' (#${i+1}) are missing the 'switchChannels' property.`,
                  error: null
                });
              }

              if (!('defaultValue' in channel)) {
                result.errors.push({
                  description: `defaultValue is missing in channel '${ch}' although it defines switching channels.`,
                  error: null
                });
              }
            }
            else {
              // check that all capabilities mention the same switching channels
              const sameAliases = switchesChannels.length === switchingChannelAliases.length
                && switchesChannels.every(alias => switchingChannelAliases.includes(alias));
              if (!sameAliases) {
                result.errors.push({
                  description: `Capability '${cap.name}' (#${i+1}) is using different switching channel aliases in 'switchChannels' than previous capabilities.`,
                  error: null
                });
              }
            }

            if (switchingChannelAliases.length === 0) {
              result.errors.push({
                description: `'switchChannels' in capability '${cap.name}' (#${i+1}) is empty.`,
                error: null
              });
            }

            for (const alias of switchingChannelAliases) {
              const switchToChannel = cap.switchChannels[alias];

              // check existence
              if (!(switchToChannel in fixture.availableChannels)) {
                result.errors.push({
                  description: `channel '${switchToChannel}' is referenced from capability '${cap.name}' (#${i+1}) in channel '${ch}' but is not defined.`,
                  error: null
                });
              }

              // switched channels are used with the switching channel and don't need to be used somewhere else
              usedChannels.push(switchToChannel);
            }

          }
          // one or more previous capabilities used this property
          else if (switchesChannels !== null) {
            result.errors.push({
              description: `Capability '${cap.name}' (#${i+1}) is missing the 'switchChannels' property.`,
              error: null
            });
          }
        }
      }
    }

    for (let i = 0; i < fixture.modes.length; i++) {
      const mode = fixture.modes[i];

      const modeShortName = mode.shortName || mode.name;
      if (usedModeShortNames.includes(modeShortName)) {
        result.errors.push({
          description: `shortName '${modeShortName}' not unique in mode #${i+1}.`,
          error: null
        });
      }
      usedModeShortNames.push(modeShortName);

      if (/\bmode\b/i.test(mode.name) || /\bmode\b/i.test(mode.shortName)) {
        result.errors.push({
          description: `mode name and shortName must not contain the word 'mode' in mode '${modeShortName}' (#${i+1}).`,
          error: null
        });
      }

      if ('physical' in mode) {
        checkPhysical(result, mode.physical, ` in mode '${modeShortName}' (#${i+1})`);
      }

      for (let chNumber = 1; chNumber <= mode.channels.length; chNumber++) {
        const ch = mode.channels[chNumber-1];

        if (ch === null) {
          continue;
        }

        usedChannels.push(ch);

        // it can be a normal channel
        if (ch in fixture.availableChannels) {
          if (fixture.availableChannels[ch].type === 'Pan') {
            checkPanTiltMaxExistence(result, fixture, mode, ch, 'panMax');
          }
          else if (fixture.availableChannels[ch].type === 'Tilt') {
            checkPanTiltMaxExistence(result, fixture, mode, ch, 'tiltMax');
          }
          continue;
        }

        // or it is a fine channel
        if (ch in fineChannels) {
          const coarseChannelKey = fineChannels[ch];
          const fineChannelAliases = fixture.availableChannels[coarseChannelKey].fineChannelAliases;

          // the mode must also contain the coarse channel
          if (!mode.channels.includes(fineChannels[ch])) {
            result.errors.push({
              description: `Mode '${modeShortName}' contains the fine channel '${ch}' (#${chNumber}) but is missing its coarse channel '${coarseChannelKey}'.`,
              error: null
            });
          }
          // the mode must also contain all coarser channel
          for (let fineIndex = 0; fineIndex < fineChannelAliases.indexOf(ch); fineIndex++) {
            let coarserChannelKey = fineChannelAliases[fineIndex];
            if (!mode.channels.includes(coarserChannelKey)) {
              result.errors.push({
                description: `Mode '${modeShortName}' contains the fine channel '${ch}' (#${chNumber}) but is missing its coarser channel '${coarserChannelKey}'.`,
                error: null
              });
            }
          }
          continue;
        }

        // or it is a switching channel
        if (ch in switchingChannels) {
          // the mode must also contain the trigger channel
          if (!mode.channels.includes(switchingChannels[ch])) {
            result.errors.push({
              description: `mode '${modeShortName}' uses switching channel '${ch}' (#${chNumber}) but is missing its trigger channel '${switchingChannels[ch]}'`,
              error: null
            });
          }
          continue;
        }

        // the channel doesn't exist
        result.errors.push({
          description: `channel '${ch}' (#${chNumber}) referenced from mode '${modeShortName}' but is not defined. Note: fine channels can only be used in the same mode as their coarse counterpart.`,
          error: null
        });
      }
    }

    if ('heads' in fixture) {
      const headNames = Object.keys(fixture.heads);

      if (headNames.length === 0) {
        result.errors.push({
          description: 'heads is empty. Please remove it or add a head.',
          error: null
        });
      }

      for (const headName of headNames) {
        const head = fixture.heads[headName];

        for (let i = 0; i < head.length; i++) {
          if (!(head[i] in fixture.availableChannels) &&
              !(head[i] in fineChannels) &&
              !(head[i] in switchingChannels)) {
            result.errors.push({
              description: `channel '${head[i]}' referenced from head '${headName}' but missing.`,
              error: null
            });
          }
        }
      }
    }

    // unused channels
    for (const ch in fixture.availableChannels) {
      if (!usedChannels.includes(ch)) {
        result.warnings.push(`Channel '${ch}' defined but never used.`);
      }
    }
    for (const ch in fineChannels) {
      if (!usedChannels.includes(ch)) {
        result.warnings.push(`Fine channel alias '${ch}' defined in channel '${fineChannels[ch]}' but never used.`);
      }
    }
    for (const ch in switchingChannels) {
      if (!usedChannels.includes(ch)) {
        result.warnings.push(`Switching channel alias '${ch}' defined in channel '${switchingChannels[ch]}' but never used.`);
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

function checkPanTiltMaxExistence(result, fixture, mode, chKey, maxProp) {
  let maxDefined = false;
  let maxIsZero = false;
  if ('physical' in mode
    && 'focus' in mode.physical
    && maxProp in mode.physical.focus) {
    maxDefined = true;
    maxIsZero = mode.physical.focus[maxProp] === 0;
  }
  else if ('physical' in fixture
    && 'focus' in fixture.physical
    && maxProp in fixture.physical.focus) {
    maxDefined = true;
    maxIsZero = fixture.physical.focus[maxProp] === 0;
  }

  const chType = fixture.availableChannels[chKey].type;
  if (!maxDefined) {
    result.warnings.push(`${maxProp} is not defined although there's a ${chType} channel '${chKey}'`);
  }
  else if (maxIsZero) {
    result.errors.push({
      description: `${maxProp} is 0 in mode '${mode.name || mode.shortName}' although it contains a ${chType} channel '${chKey}'`,
      error: null
    });
  }
}

function checkPhysical(result, physical, modeDescription = '') {
  if (Object.keys(physical).length === 0) {
    result.errors.push({
      description: `physical${modeDescription} is empty. Please remove it or add data.`,
      error: null
    });
    return;
  }

  for (const property of ['bulb', 'lens', 'focus']) {
    if (property in physical && Object.keys(physical[property]).length === 0) {
      result.errors.push({
        description: `physical.${property}${modeDescription} is empty. Please remove it or add data.`,
        error: null
      });
    }
  }

  if ('lens' in physical
    && 'degreesMinMax' in physical.lens
    && physical.lens.degreesMinMax[0] > physical.lens.degreesMinMax[1]
  ) {
    result.errors.push({
      description: `physical.lens.degreesMinMax${modeDescription} is an invalid range.`,
      error: null
    });
  }
}
