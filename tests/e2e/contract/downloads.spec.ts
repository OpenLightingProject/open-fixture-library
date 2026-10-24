import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { fetchBoth } from '../helpers/parity';

const repositoryRoot = new URL('../../../', import.meta.url);

const testFixtures = JSON.parse(
  await readFile(new URL('tests/test-fixtures.json', repositoryRoot), 'utf8'),
) as { man: string; key: string; name: string; features: string[] }[];

const { exportPlugins } = JSON.parse(
  await readFile(new URL('plugins/plugins.json', repositoryRoot), 'utf8'),
) as { exportPlugins: string[] };

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
async function expectDownloadParity(path: string, init?: RequestInit) {
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

describe('download parity', () => {
  for (const fixtureKey of fixtureKeys) {
    for (const pluginKey of exportPlugins) {
      it(`${fixtureKey}.${pluginKey}`, async () => {
        await expectDownloadParity(`/${fixtureKey}.${pluginKey}`);
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
      await expectDownloadParity(`/download.${pluginKey}`);
    });
  }
});

describe('editor download parity', () => {
  for (const pluginKey of exportPlugins) {
    it(`download-editor.${pluginKey}`, async () => {
      await expectDownloadParity(`/download-editor.${pluginKey}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: editorBody,
      });
    });
  }

  it('rejects an unsupported plugin identically', async () => {
    await expectDownloadParity('/download-editor.not-a-plugin', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: editorBody,
    });
  });
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
  it('rejects an unknown fixture plugin with the same status', async () => {
    const path = '/clay-paky/sharpy.not-a-plugin';
    const { oldResponse, newResponse } = await fetchBoth(path);

    // Both sites pass this through to their page router, which renders its own
    // 404 page. Nuxt 2 and Nuxt 4 error pages cannot match byte-for-byte, so
    // the shared contract is pinned at the status and "not a download" level.
    expect(oldResponse.status).toBe(404);
    expect(newResponse.status).toBe(404);
    expect(oldResponse.headers.get('content-disposition')).toBeNull();
    expect(newResponse.headers.get('content-disposition')).toBeNull();
  });

  // Known gap, owned by Task 14 (page conversion): the Express download
  // router correctly calls `next()` for an unknown format, so the request
  // reaches the manufacturer page. The Nuxt 2 page forwards the failed
  // manufacturer request (`error(requestError)` → 400, because the API rejects
  // the dotted manufacturer key). The Nuxt 4 page leaves `manufacturer`
  // undefined after the failed `useFetch` and renders a 500 instead.
  //
  // `it.fails` keeps the suite green today while asserting real oracle parity.
  // Once Task 14 fixes the page, these tests pass and Vitest reports an
  // unexpected pass, which intentionally fails the suite.
  for (const path of ['/download.not-a-plugin', '/download.foo']) {
    it.fails(`${path} matches the oracle rejection status (known Task 14 gap)`, async () => {
      const { oldResponse, newResponse } = await fetchBoth(path);

      expect(oldResponse.status).toBe(400);
      expect(newResponse.status).toBe(oldResponse.status);
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
