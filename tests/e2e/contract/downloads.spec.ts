import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { fetchBoth } from '../helpers/parity';

const repositoryRoot = new URL('../../../', import.meta.url);

const testFixtures = JSON.parse(
  await readFile(new URL('tests/test-fixtures.json', repositoryRoot), 'utf8'),
) as { man: string; key: string; name: string; features: string[] }[];

const pluginData = JSON.parse(
  await readFile(new URL('plugins/plugins.json', repositoryRoot), 'utf8'),
) as {
  exportPlugins: string[];
  data: Record<
    string,
    {
      name: string;
      importPluginVersion?: string;
      exportPluginVersion?: string;
      outdated?: boolean;
      newPlugin?: string;
    }
  >;
};

const { exportPlugins } = pluginData;

// `plugins.json` also contains non-exportable plugins: import-only plugins
// (no `exportPluginVersion`) and outdated plugins (`outdated: true` with a
// `newPlugin` replacement). The old Express download router accepted exactly
// `exportPlugins`, so these formats fall through to the page router. They are
// deliberately absent from the full matrix; the tests below pin that exclusion
// and the fall-through parity instead of assuming it.
const nonExportPluginKeys = Object.keys(pluginData.data)
  .filter((pluginKey) => !exportPlugins.includes(pluginKey))
  .sort();

const register = JSON.parse(
  await readFile(new URL('fixtures/register.json', repositoryRoot), 'utf8'),
) as {
  filesystem: Record<string, { redirectTo?: string; reason?: string }>;
};

const manufacturers = JSON.parse(
  await readFile(new URL('fixtures/manufacturers.json', repositoryRoot), 'utf8'),
) as Record<string, Record<string, unknown>>;

// The feature-representative fixtures from `tests/test-fixtures.json` are the
// default suite (`docs/superpowers/migration-audit.md`). The opt-in full matrix
// exercises every downloadable fixture, as required by the migration plan.
const fullMatrix = process.env.FULL_DOWNLOAD_MATRIX === '1';
const defaultFixtureKeys = testFixtures.map(
  (fixture) => `${fixture.man}/${fixture.key}`,
);
const fixtureKeys = fullMatrix
  ? Object.keys(register.filesystem).sort()
  : defaultFixtureKeys;

const editorFixtureKey = 'generic/pan-tilt';
const editorBody = JSON.stringify({
  fixtures: {
    [editorFixtureKey]: JSON.parse(
      await readFile(
        new URL(`fixtures/${editorFixtureKey}.json`, repositoryRoot),
        'utf8',
      ),
    ),
  },
  manufacturers: {
    generic: manufacturers.generic,
  },
});

function contentType(response: Response): string {
  return response.headers.get('content-type') ?? '';
}

/**
 * Two export plugins embed the wall-clock `options.date` in their output:
 *
 * - `colorsource`: top-level JSON `date` (`YYYY-MM-DDTHH:MM:SSZ`).
 * - `ecue`: `Document/@SaveTimeStamp` and the `Tiles`/`Fixtures` Manufacturer
 *   `_CreationDate`/`_ModifiedDate` attributes (`YYYY-MM-DD#HH:MM:SS`).
 *   Fixture-level `_CreationDate`/`_ModifiedDate` come from fixture metadata,
 *   not `options.date`, and stay byte-compared.
 *
 * Verified by checking every `plugins/<plugin>/export.js` for `options.date` usage.
 * These fields are wall-clock time, so byte equality between two requests is
 * not a meaningful contract. Normalize exactly these fields (and assert their
 * format); all other bytes, including all other downloads, are unchanged.
 */
const COLORSOURCE_DATE_PATTERN =
  /^(\{\n {2}"date": ")(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)(")/;
const ECUE_DOCUMENT_TIMESTAMP_PATTERN =
  /(<Document\b[^>]*\bSaveTimeStamp=")(\d{4}-\d{2}-\d{2}#\d{2}:\d{2}:\d{2})(")/;
const ECUE_MANUFACTURER_TIMESTAMPS_PATTERN =
  /(<Manufacturer\b[^>]*\b_CreationDate=")(\d{4}-\d{2}-\d{2}#\d{2}:\d{2}:\d{2})("\s+_ModifiedDate=")(\d{4}-\d{2}-\d{2}#\d{2}:\d{2}:\d{2})(")/g;

function normalizeTimeBearingBody(
  pluginKey: string,
  body: Buffer,
  label: string,
): string {
  const text = body.toString('utf8');

  if (pluginKey === 'colorsource') {
    assert.match(
      text,
      COLORSOURCE_DATE_PATTERN,
      `${label}: expected top-level colorsource date in YYYY-MM-DDTHH:MM:SSZ format`,
    );
    return text.replace(COLORSOURCE_DATE_PATTERN, '$1<volatile-date>$3');
  }

  if (pluginKey === 'ecue') {
    assert.match(
      text,
      ECUE_DOCUMENT_TIMESTAMP_PATTERN,
      `${label}: expected ecue Document/@SaveTimeStamp`,
    );
    assert.match(
      text,
      ECUE_MANUFACTURER_TIMESTAMPS_PATTERN,
      `${label}: expected ecue Manufacturer timestamps`,
    );
    return text
      .replace(ECUE_DOCUMENT_TIMESTAMP_PATTERN, '$1<volatile-timestamp>$3')
      .replace(
        ECUE_MANUFACTURER_TIMESTAMPS_PATTERN,
        '$1<volatile-timestamp>$3<volatile-timestamp>$5',
      );
  }

  throw new Error(`no time normalization defined for plugin ${pluginKey}`);
}

function describeBufferMismatch(
  label: string,
  oldBuffer: Buffer,
  newBuffer: Buffer,
): string {
  if (oldBuffer.length !== newBuffer.length) {
    return `${label}: ${oldBuffer.length} bytes from OLD_URL, ${newBuffer.length} bytes from NEW_URL`;
  }

  const offset = oldBuffer.findIndex((byte, index) => byte !== newBuffer[index]);
  return `${label}: first differing byte at offset ${offset} (OLD_URL ${oldBuffer[offset]}, NEW_URL ${newBuffer[offset]})`;
}

function assertBuffersEqual(label: string, oldBuffer: Buffer, newBuffer: Buffer) {
  assert.ok(
    Buffer.compare(oldBuffer, newBuffer) === 0,
    describeBufferMismatch(label, oldBuffer, newBuffer),
  );
}

async function expectSameZipEntries(
  oldBuffer: Buffer,
  newBuffer: Buffer,
  label: string,
): Promise<void> {
  const [oldZip, newZip] = await Promise.all([
    JSZip.loadAsync(oldBuffer),
    JSZip.loadAsync(newBuffer),
  ]);
  const oldNames = Object.keys(oldZip.files).filter(
    (name) => !oldZip.files[name].dir,
  );
  const newNames = Object.keys(newZip.files).filter(
    (name) => !newZip.files[name].dir,
  );

  assert.deepEqual(newNames, oldNames, `zip entries for ${label}`);

  for (const name of oldNames) {
    const [oldContent, newContent] = await Promise.all([
      oldZip.file(name)?.async('nodebuffer'),
      newZip.file(name)?.async('nodebuffer'),
    ]);
    assert.ok(oldContent && newContent, `zip entry ${JSON.stringify(name)} for ${label} is missing`);
    assertBuffersEqual(
      `zip entry ${JSON.stringify(name)} for ${label}`,
      oldContent,
      newContent,
    );
  }
}

/**
 * Compare a download response. Beyond `expectParity`, this asserts the
 * `Content-Disposition` header (the filename is part of the download contract)
 * and compares the response body byte-for-byte. ZIP archives are compared by
 * entry because both servers stamp archive entries with `new Date()`, so raw
 * ZIP bytes legitimately differ between two requests.
 */
async function expectDownloadParity(
  path: string,
  init?: RequestInit,
  pluginKey?: string,
) {
  const { oldResponse, newResponse } = await fetchBoth(path, init);

  assert.equal(newResponse.status, oldResponse.status, `status for ${path}`);
  assert.equal(
    newResponse.headers.get('content-type'),
    oldResponse.headers.get('content-type'),
    `content-type for ${path}`,
  );
  assert.equal(
    newResponse.headers.get('content-disposition'),
    oldResponse.headers.get('content-disposition'),
    `content-disposition for ${path}`,
  );

  const [oldBody, newBody] = await Promise.all([
    oldResponse.arrayBuffer(),
    newResponse.arrayBuffer(),
  ]);
  const oldBuffer = Buffer.from(oldBody);
  const newBuffer = Buffer.from(newBody);

  if (pluginKey === 'colorsource' || pluginKey === 'ecue') {
    assert.equal(
      normalizeTimeBearingBody(pluginKey, newBuffer, path),
      normalizeTimeBearingBody(pluginKey, oldBuffer, path),
      `time-normalized body for ${path}`,
    );
    return;
  }

  if (Buffer.compare(oldBuffer, newBuffer) === 0) {
    return;
  }

  if (contentType(oldResponse).includes('zip') && contentType(newResponse).includes('zip')) {
    await expectSameZipEntries(oldBuffer, newBuffer, path);
    return;
  }

  assertBuffersEqual(`body for ${path}`, oldBuffer, newBuffer);
}

function normalizedLocation(response: Response): string | null {
  const location = response.headers.get('location');
  if (location === null) {
    return null;
  }

  const url = new URL(location, 'http://localhost');
  const searchParams = [...url.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b));
  return `${url.pathname}?${new URLSearchParams(searchParams)}`;
}

/**
 * The download middleware must let page routes through. Redirect fixtures are
 * the pass-through case: both sites answer with the same 302 and semantically
 * the same target. The raw `Location` encoding and the rendered 302 body are
 * framework details, so only status and target are compared here.
 */
async function expectRedirectParity(path: string) {
  const { oldResponse, newResponse } = await fetchBoth(path, {
    redirect: 'manual',
  });

  assert.equal(newResponse.status, oldResponse.status, `status for ${path}`);
  assert.equal(
    normalizedLocation(newResponse),
    normalizedLocation(oldResponse),
    `location for ${path}`,
  );
}

describe('export plugin set parity', () => {
  it('contains every exportable plugin and no non-exportable one', () => {
    for (const pluginKey of exportPlugins) {
      expect(
        pluginData.data[pluginKey]?.exportPluginVersion,
        `${pluginKey} is an export plugin, so it must declare exportPluginVersion`,
      ).toBeTypeOf('string');
    }

    for (const pluginKey of nonExportPluginKeys) {
      const plugin = pluginData.data[pluginKey];

      expect(
        plugin.exportPluginVersion,
        `${pluginKey} must not declare an exportPluginVersion`,
      ).toBeUndefined();
      expect(
        plugin.importPluginVersion !== undefined || plugin.outdated === true,
        `${pluginKey} must be import-only or explicitly marked outdated`,
      ).toBe(true);
    }
  });
});

describe('download parity', () => {
  // Some fixture/plugin combinations legitimately fail on both sites (e.g.
  // dragonframe rejects fixtures whose channels cannot be represented); those
  // cases are still compared exactly, so an error on only one site fails.
  for (const fixtureKey of fixtureKeys) {
    for (const pluginKey of exportPlugins) {
      it(`${fixtureKey}.${pluginKey}`, async () => {
        await expectDownloadParity(`/${fixtureKey}.${pluginKey}`, undefined, pluginKey);
      });
    }
  }
});

describe('raw fixture JSON download parity', () => {
  for (const fixtureKey of defaultFixtureKeys) {
    it(`${fixtureKey}.json`, async () => {
      await expectDownloadParity(`/${fixtureKey}.json`);
    });
  }
});

describe('batch download parity', () => {
  for (const pluginKey of exportPlugins) {
    it(`download.${pluginKey}`, async () => {
      await expectDownloadParity(`/download.${pluginKey}`, undefined, pluginKey);
    });
  }
});

describe('editor download parity', () => {
  for (const pluginKey of exportPlugins) {
    it(`download-editor.${pluginKey}`, async () => {
      await expectDownloadParity(
        `/download-editor.${pluginKey}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: editorBody,
        },
        pluginKey,
      );
    });
  }

  for (const pluginKey of ['not-a-plugin', ...nonExportPluginKeys]) {
    it(`download-editor.${pluginKey} rejects an unsupported plugin identically`, async () => {
      // `not-a-plugin` is unknown; the other keys are plugins.json entries that
      // are not exportable. The old Express handler wrote this exact plain-text
      // 500 for every one of them, so the full-body comparison applies.
      await expectDownloadParity(`/download-editor.${pluginKey}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: editorBody,
      });
    });
  }
});

describe('download HEAD parity', () => {
  for (const path of [
    `/${editorFixtureKey}.ofl`,
    `/${editorFixtureKey}.json`,
    '/download.ofl',
  ]) {
    it(`HEAD ${path}`, async () => {
      await expectDownloadParity(path, { method: 'HEAD' });
    });
  }
});

describe('pass-through parity', () => {
  for (const pluginKey of ['not-a-plugin', ...nonExportPluginKeys]) {
    it(`rejects a non-export plugin (${pluginKey}) with the same status`, async () => {
      const path = `/clay-paky/sharpy.${pluginKey}`;
      const { oldResponse, newResponse } = await fetchBoth(path);

      // None of these plugin keys is in `plugins.json`'s `exportPlugins`, so
      // both sites pass the request through to their page router, which renders
      // its own 404 page. Nuxt 2 and Nuxt 4 error pages cannot match
      // byte-for-byte, so the shared contract is pinned at the status and
      // "not a download" level.
      expect(oldResponse.status).toBe(404);
      expect(newResponse.status).toBe(404);
      expect(oldResponse.headers.get('content-disposition')).toBeNull();
      expect(newResponse.headers.get('content-disposition')).toBeNull();
    });
  }

  // The Express download router calls `next()` for an unknown format, so the
  // request reaches the manufacturer page. Both sites forward the failed
  // manufacturer request (`error(requestError)` on Nuxt 2 → 400, because the
  // API rejects the dotted manufacturer key), which renders the shared error
  // page.
  for (const path of ['/download.not-a-plugin', '/download.foo']) {
    it(`${path} matches the oracle rejection status`, async () => {
      const { oldResponse, newResponse } = await fetchBoth(path);

      expect(oldResponse.status).toBe(400);
      expect(newResponse.status).toBe(oldResponse.status);
    });
  }

  // Plugins that exist in `plugins.json` but are not exportable (import-only or
  // outdated) are rejected by the old Express router via `next()` just like an
  // unknown format: the request reaches the page router, which rejects the
  // dotted manufacturer key with 400. The new site must not answer these with a
  // download or leak a 500 from the Nitro middleware. The error body/content
  // type is rendered by the page layer (HTML on Nuxt 2, content-negotiated on
  // Nuxt 4), so only status and the absence of an attachment are compared here.
  for (const pluginKey of nonExportPluginKeys) {
    it(`/download.${pluginKey} falls through like the oracle`, async () => {
      const { oldResponse, newResponse } = await fetchBoth(`/download.${pluginKey}`);

      expect(oldResponse.status).toBe(400);
      expect(newResponse.status).toBe(oldResponse.status);
      expect(oldResponse.headers.get('content-disposition')).toBeNull();
      expect(newResponse.headers.get('content-disposition')).toBeNull();
    });
  }

  for (const fixtureKey of [
    'stairville/mh-x30',
    'uking/mini-gobo-moving-head-light',
  ]) {
    it(`${fixtureKey} downloads are not redirected`, async () => {
      const { oldResponse, newResponse } = await fetchBoth(`/${fixtureKey}.json`);

      expect(oldResponse.status).toBe(200);
      expect(newResponse.status).toBe(200);
      expect(oldResponse.headers.get('location')).toBeNull();
      expect(newResponse.headers.get('location')).toBeNull();
    });

    it(`${fixtureKey} page redirect is unchanged`, async () => {
      await expectRedirectParity(`/${fixtureKey}`);
    });
  }
});
