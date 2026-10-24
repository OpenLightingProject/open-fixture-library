import { describe, expect, it } from 'vitest';
import { expectParity, fetchBoth, NEW_URL } from '../helpers/parity';

describe('API parity smoke', () => {
  it('serves API routes without external $ref lookups', async () => {
    const response = await fetch(`${NEW_URL}/api/v1/categories`, {
      headers: { accept: 'application/json' },
    });
    expect(response.status).toBe(200);
  });

  it('serves the manufacturer list identically', async () => {
    await expectParity('/api/v1/manufacturers');
  });

  it('serves a manufacturer identically', async () => {
    await expectParity('/api/v1/manufacturers/clay-paky');
  });

  it('serves the category list identically', async () => {
    await expectParity('/api/v1/categories');
  });

  it('serves a category identically', async () => {
    await expectParity('/api/v1/categories/Color%20Changer');
  });

  it('serves the fixture count identically', async () => {
    await expectParity('/api/v1/fixtures/count');
  });

  it('serves the last updated fixtures identically', async () => {
    await expectParity('/api/v1/fixtures/last-updated');
  });

  it('serves the recent contributors identically', async () => {
    await expectParity('/api/v1/contributors/recent');
  });

  it('serves the plugin list identically', async () => {
    await expectParity('/api/v1/plugins');
  });

  it('serves a plugin identically', async () => {
    await expectParity('/api/v1/plugins/ofl');
  });

  it('serves the RDM lookup identically', async () => {
    await expectParity('/api/v1/rdm?manufacturerId=1');
  });

  // Regression test for the Nitro production build's broken request XSS
  // validator (`escapeHtml is not a function`): API GETs with a query string
  // must not go through nuxt-security's validator.
  it('returns 200 parity for valid and unknown RDM manufacturer IDs', async () => {
    for (const manufacturerId of ['1', '9999']) {
      const { oldResponse, newResponse } = await fetchBoth(
        `/api/v1/rdm?manufacturerId=${manufacturerId}`,
      );

      expect(oldResponse.status, `oracle status for manufacturerId=${manufacturerId}`).toBe(200);
      expect(newResponse.status, `new-site status for manufacturerId=${manufacturerId}`).toBe(200);
    }

    await expectParity('/api/v1/rdm?manufacturerId=9999');
  });

  it('rejects a malformed POST body with 400 parity', async () => {
    await expectParity('/api/v1/fixtures/import', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });
  });

  // The Nuxt 2 oracle returns a 500 for unknown operations because its
  // `postResponseHandler` short-circuits with `null` before Express can send
  // the 404 handler's response. The Nitro implementation intentionally
  // returns the documented 404 instead, so this cannot use expectParity.
  it('returns 404 for an unknown operation', async () => {
    const response = await fetch(`${NEW_URL}/api/v1/not-an-operation`);

    expect(response.status).toBe(404);
    expect(response.headers.get('content-type')).toBe('application/json');
    expect(await response.json()).toEqual({ error: 'Not found' });
  });
});
