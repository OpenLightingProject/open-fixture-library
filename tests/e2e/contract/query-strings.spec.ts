import assert from 'node:assert/strict';
import { describe, it } from 'vitest';
import { fetchBoth } from '../helpers/parity';

// Regression test for nuxt-security's `escapeHtml` crash: before
// `xssValidator` was disabled for Nuxt 2 parity, any request with a query
// string returned 500 instead of rendering the page.
describe('benign query strings', () => {
  it('renders a search query instead of returning 500', async () => {
    const path = '/search?q=a%20%26%20b';
    const { oldResponse, newResponse } = await fetchBoth(path);

    assert.equal(oldResponse.status, 200, `oracle status for ${path}`);
    assert.equal(newResponse.status, oldResponse.status, `status for ${path}`);

    const [oldBody, newBody] = await Promise.all([oldResponse.text(), newResponse.text()]);

    for (const [site, body] of [['old', oldBody], ['new', newBody]] as const) {
      assert.match(body, /name="q"/, `${site} body contains the search field`);
      assert.match(body, /value="a &amp; b"/, `${site} body reflects the escaped query`);
    }
  });

  it('serves a fixture page with ?loadAllModes instead of returning 500', async () => {
    const path = '/astera/fp3-hyperion-tube?loadAllModes';
    const { oldResponse, newResponse } = await fetchBoth(path);

    assert.equal(oldResponse.status, 200, `oracle status for ${path}`);
    assert.equal(newResponse.status, oldResponse.status, `status for ${path}`);

    const [oldBody, newBody] = await Promise.all([oldResponse.text(), newResponse.text()]);
    assert.match(oldBody, /FP3 Hyperion Tube/, 'oracle body renders the fixture');
    assert.match(newBody, /FP3 Hyperion Tube/, 'new body renders the fixture');
  });
});
