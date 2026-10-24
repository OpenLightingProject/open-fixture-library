import assert from 'node:assert/strict';

export const OLD_URL = process.env.OLD_URL ?? 'http://localhost:3001';
export const NEW_URL = process.env.NEW_URL ?? 'http://localhost:3000';

export async function fetchBoth(path: string, init?: RequestInit) {
  const [oldResponse, newResponse] = await Promise.all([
    fetch(`${OLD_URL}${path}`, init),
    fetch(`${NEW_URL}${path}`, init),
  ]);
  return { oldResponse, newResponse };
}

export async function expectParity(path: string, init?: RequestInit) {
  const { oldResponse, newResponse } = await fetchBoth(path, init);
  assert.equal(newResponse.status, oldResponse.status, `status for ${path}`);
  assert.equal(
    newResponse.headers.get('content-type'),
    oldResponse.headers.get('content-type'),
    `content-type for ${path}`,
  );

  const contentType = oldResponse.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    assert.deepEqual(await newResponse.json(), await oldResponse.json(), `body for ${path}`);
  }
  else {
    const [oldBody, newBody] = await Promise.all([
      oldResponse.arrayBuffer(),
      newResponse.arrayBuffer(),
    ]);
    assert.deepEqual(Buffer.from(newBody), Buffer.from(oldBody), `body for ${path}`);
  }
}
