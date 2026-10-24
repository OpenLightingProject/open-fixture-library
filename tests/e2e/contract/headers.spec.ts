import assert from 'node:assert/strict';
import { describe, it } from 'vitest';
import { fetchBoth } from '../helpers/parity';

/**
 * Headers emitted by Nuxt 2's `nuxt-helmet` / `render.csp`, in the exact set
 * Task 6 is responsible for. Values are compared after normalizing volatile
 * CSP tokens (inline-script hashes / nonces), which differ per page and per
 * framework but carry no policy meaning for these assertions.
 */
const SECURITY_HEADERS = [
  'content-security-policy',
  'content-security-policy-report-only',
  'cross-origin-embedder-policy',
  'cross-origin-opener-policy',
  'cross-origin-resource-policy',
  'origin-agent-cluster',
  'permissions-policy',
  'referrer-policy',
  'strict-transport-security',
  'x-content-type-options',
  'x-dns-prefetch-control',
  'x-download-options',
  'x-frame-options',
  'x-permitted-cross-domain-policies',
  'x-xss-protection',
];

/**
 * Helmet headers that master emitted on every response, including static
 * assets. nuxt-security only emits these on rendered HTML, so the new site
 * applies them through Nitro route rules (`nuxt.config.ts`).
 */
const HELMET_EVERYWHERE_HEADERS: Record<string, string> = {
  'cross-origin-opener-policy': 'same-origin',
  'cross-origin-resource-policy': 'same-origin',
  'origin-agent-cluster': '?1',
  'x-dns-prefetch-control': 'off',
};

const STATIC_ASSET_PATHS = ['/favicon-16x16.png', '/manifest.json'];

const VOLATILE_CSP_TOKEN = /^'(?:sha(?:256|384|512)-[^']+|nonce-[^']+)'$/;

// Computes a stable representation of a CSP header so directives and their
// sources can be compared regardless of ordering or per-page hashes/nonces.
function normalizeCsp(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  return value
    .split(';')
    .map((directive) => directive.trim())
    .filter(Boolean)
    .map((directive) => {
      const [name, ...sources] = directive.split(/\s+/);
      const stableSources = sources
        .filter((source) => !VOLATILE_CSP_TOKEN.test(source))
        .sort();
      return [name, ...stableSources].join(' ');
    })
    .sort()
    .join('; ');
}

function normalizeVary(value: string | null): string | null {
  if (value === null) {
    return null;
  }
  return value
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join(',');
}

async function fetchHeaderPair(path: string, init?: RequestInit) {
  const { oldResponse, newResponse } = await fetchBoth(path, init);
  return { oldResponse, newResponse };
}

describe('security header parity', () => {
  for (const path of ['/', '/api/v1/categories', ...STATIC_ASSET_PATHS]) {
    it(`matches helmet security headers on ${path}`, async () => {
      const { oldResponse, newResponse } = await fetchHeaderPair(path);

      for (const header of SECURITY_HEADERS) {
        const oldValue = oldResponse.headers.get(header);
        const newValue = newResponse.headers.get(header);
        assert.equal(
          normalizeCsp(newValue),
          normalizeCsp(oldValue),
          `${header} on ${path}`,
        );
      }
    });
  }

  for (const path of STATIC_ASSET_PATHS) {
    it(`emits every helmet-everywhere header on static asset ${path}`, async () => {
      const { oldResponse, newResponse } = await fetchHeaderPair(path);

      for (const [header, expected] of Object.entries(HELMET_EVERYWHERE_HEADERS)) {
        assert.equal(oldResponse.headers.get(header), expected, `${header} on old ${path}`);
        assert.equal(newResponse.headers.get(header), expected, `${header} on new ${path}`);
      }
    });
  }

  it('does not enforce a Content-Security-Policy that the oracle only reports', async () => {
    const { oldResponse, newResponse } = await fetchHeaderPair('/');

    assert.equal(oldResponse.headers.get('content-security-policy'), null);
    assert.equal(newResponse.headers.get('content-security-policy'), null);
  });

  for (const path of ['/', '/api/v1/categories']) {
    it(`does not emit X-Robots headers on ${path}`, async () => {
      const { oldResponse, newResponse } = await fetchHeaderPair(path);

      for (const header of ['x-robots-tag', 'x-robots-production']) {
        assert.equal(newResponse.headers.get(header), oldResponse.headers.get(header), header);
      }
    });
  }
});

describe('CORS parity', () => {
  it('does not send CORS headers for HTML pages', async () => {
    const { oldResponse, newResponse } = await fetchHeaderPair('/');

    assert.equal(oldResponse.headers.get('access-control-allow-origin'), null);
    assert.equal(newResponse.headers.get('access-control-allow-origin'), null);
  });

  it('omits Access-Control-Allow-Origin when the request has no Origin header', async () => {
    const { oldResponse, newResponse } = await fetchHeaderPair('/api/v1/categories');

    assert.equal(oldResponse.headers.get('access-control-allow-origin'), null);
    assert.equal(newResponse.headers.get('access-control-allow-origin'), null);
    assert.equal(
      normalizeVary(newResponse.headers.get('vary')),
      normalizeVary(oldResponse.headers.get('vary')),
      'Vary on /api/v1/categories',
    );
  });

  it('echoes a whitelisted Open Fixture Library origin', async () => {
    const origin = 'https://open-fixture-library.org';
    const { oldResponse, newResponse } = await fetchHeaderPair('/api/v1/categories', {
      headers: { origin },
    });

    assert.equal(oldResponse.headers.get('access-control-allow-origin'), origin);
    assert.equal(newResponse.headers.get('access-control-allow-origin'), origin);
  });

  it('never falls back to a wildcard for an unknown origin', async () => {
    const origin = 'https://example.invalid';
    const { oldResponse, newResponse } = await fetchHeaderPair('/api/v1/categories', {
      headers: { origin },
    });

    const oldValue = oldResponse.headers.get('access-control-allow-origin');
    const newValue = newResponse.headers.get('access-control-allow-origin');

    // The oracle echoes any origin in development and uses its OFL fallback in
    // production; both are the only allowed implementations.
    assert.ok(
      oldValue === origin || oldValue === 'https://open-fixture-library.org',
      `unexpected oracle CORS origin: ${oldValue}`,
    );
    assert.ok(
      newValue === origin || newValue === 'https://open-fixture-library.org',
      `unexpected new-site CORS origin: ${newValue}`,
    );
    assert.notEqual(newValue, '*');
  });

  it('answers CORS preflight like the Express cors middleware', async () => {
    const origin = 'https://open-fixture-library.org';
    const requestHeaders = {
      origin,
      'access-control-request-method': 'GET',
      'access-control-request-headers': 'content-type',
    };
    const { oldResponse, newResponse } = await fetchHeaderPair('/api/v1/categories', {
      method: 'OPTIONS',
      headers: requestHeaders,
    });

    assert.equal(newResponse.status, oldResponse.status, 'preflight status');
    assert.equal(
      newResponse.headers.get('access-control-allow-origin'),
      oldResponse.headers.get('access-control-allow-origin'),
      'preflight Access-Control-Allow-Origin',
    );
    assert.equal(
      newResponse.headers.get('access-control-allow-methods'),
      oldResponse.headers.get('access-control-allow-methods'),
      'preflight Access-Control-Allow-Methods',
    );
    assert.equal(
      newResponse.headers.get('access-control-allow-headers'),
      oldResponse.headers.get('access-control-allow-headers'),
      'preflight Access-Control-Allow-Headers',
    );
    assert.equal(
      normalizeVary(newResponse.headers.get('vary')),
      normalizeVary(oldResponse.headers.get('vary')),
      'preflight Vary',
    );
  });

  it('applies the same CORS policy to API routes outside the OpenAPI catch-all', async () => {
    const origin = 'https://open-fixture-library.org';
    const { oldResponse, newResponse } = await fetchHeaderPair(
      '/api/v1/fixtures/clay-paky/sharpy',
      { headers: { origin } },
    );

    // Status parity for this route is owned by the fixture-page/API tasks; the
    // CORS contract must still hold for every /api/v1 response.
    assert.equal(oldResponse.headers.get('access-control-allow-origin'), origin);
    assert.equal(newResponse.headers.get('access-control-allow-origin'), origin);
  });
});
