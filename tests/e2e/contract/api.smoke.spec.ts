import { describe, it } from 'vitest';
import { expectParity } from '../helpers/parity';

describe('API parity smoke', () => {
  it('serves the manufacturer list identically', async () => {
    await expectParity('/api/v1/manufacturers');
  });

  it('serves a manufacturer identically', async () => {
    await expectParity('/api/v1/manufacturers/clay-paky');
  });

  it('serves the category list identically', async () => {
    await expectParity('/api/v1/categories');
  });
});
