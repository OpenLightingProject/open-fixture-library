export const version = '0.1.0';

/**
 * Imports Showsync Beam SBF fixture profiles.
 *
 * @param {Buffer} buffer - The imported SBF file.
 * @param {string} filename - The imported file's name.
 * @param {string} authorName - The importer's name.
 * @returns {Promise<object>} The imported fixtures.
 */
export async function importFixtures(buffer, filename, authorName) {
  const sbf = JSON.parse(buffer.toString());

  if (!Array.isArray(sbf.aggregate)) {
    throw new TypeError('Invalid SBF file: aggregate must be an array.');
  }

  const fixtureName = filename.replace(/\.sbf$/i, '');
  const fixtureKey = `showsync/${slugify(fixtureName)}`;

  const fixture = {
    $schema: 'https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json',
    name: fixtureName,
    categories: ['Other'],
    meta: {
      authors: [authorName],
      importPlugin: {
        plugin: 'showsync',
        date: new Date().toISOString().slice(0, 10),
      },
    },
    availableChannels: {},
    modes: [{
      name: 'Default',
      channels: [],
    }],
  };

  const warnings = [
    'Please specify the correct fixture category.',
  ];

  const aggregates = sbf.aggregate.toSorted((a, b) => a.address - b.address);

  for (const aggregate of aggregates) {
    const channelNames = addAggregate(fixture, aggregate);

    if (channelNames.length === 0) {
      warnings.push(
        `Unsupported Showsync profile '${aggregate.profile}' at address ${aggregate.address}.`,
      );
    }
    else {
      fixture.modes[0].channels.push(...channelNames);
    }
  }

  return {
    manufacturers: {
      showsync: {
        name: 'Showsync',
      },
    },
    fixtures: {
      [fixtureKey]: fixture,
    },
    warnings: {
      [fixtureKey]: warnings,
    },
  };
}

/**
 * Converts a Showsync aggregate into OFL channels.
 *
 * @param {object} fixture - The OFL fixture being created.
 * @param {object} aggregate - The Showsync aggregate.
 * @returns {string[]} Names of the generated OFL channels.
 */
function addAggregate(fixture, aggregate) {
  if (aggregate.profile === 'Generic RGB') {
    addRgbChannels(fixture);
    return ['Red', 'Green', 'Blue'];
  }

  if (aggregate.profile === 'Generic Dimmer') {
    return [addDimmerChannel(fixture, aggregate)];
  }

  return [];
}

/**
 * Adds RGB channels to an OFL fixture.
 *
 * @param {object} fixture - The OFL fixture being created.
 */
function addRgbChannels(fixture) {
  fixture.availableChannels.Red = {
    defaultValue: 0,
    capability: {
      type: 'ColorIntensity',
      color: 'Red',
    },
  };

  fixture.availableChannels.Green = {
    defaultValue: 0,
    capability: {
      type: 'ColorIntensity',
      color: 'Green',
    },
  };

  fixture.availableChannels.Blue = {
    defaultValue: 0,
    capability: {
      type: 'ColorIntensity',
      color: 'Blue',
    },
  };
}

/**
 * Adds a dimmer channel to an OFL fixture.
 *
 * @param {object} fixture - The OFL fixture being created.
 * @param {object} aggregate - The Showsync aggregate.
 * @returns {string} The generated channel name.
 */
function addDimmerChannel(fixture, aggregate) {
  const channelName = aggregate.name || 'Dimmer';

  fixture.availableChannels[channelName] = {
    defaultValue: 0,
    capability: {
      type: 'Intensity',
    },
  };

  return channelName;
}

/**
 * Converts a fixture name into an OFL-compatible key.
 *
 * @param {string} name - The fixture name.
 * @returns {string} A slugified fixture name.
 */
function slugify(name) {
  return name
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '');
}
