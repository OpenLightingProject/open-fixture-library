import assert from 'node:assert/strict';
import { gunzipSync } from 'node:zlib';
import { describe, it } from 'vitest';
import { fetchBoth } from '../helpers/parity';

// Extracts a path (and query) from a sitemap `<loc>` so the oracle's
// `websiteUrl` (which includes its own port) does not leak into assertions.
/**
 * Converts a sitemap `<loc>` URL to a site-relative path.
 * @param loc - The absolute URL from the sitemap.
 * @returns The path and query string.
 */
function sitemapPath(loc: string): string {
  const url = new URL(loc);
  return `${url.pathname}${url.search}`;
}

/**
 * Parses sitemap entries keyed by path.
 *
 * @param xml - The sitemap XML.
 * @returns A map from path to its change frequency and last modification date.
 */
function parseSitemap(xml: string) {
  const entries = new Map<string, { changefreq: string | null; lastmod: string | null }>();

  for (const [urlXml] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = urlXml.match(/<loc>([\s\S]*?)<\/loc>/)?.[1];
    if (!loc) {
      continue;
    }

    const changefreq = urlXml.match(/<changefreq>([\s\S]*?)<\/changefreq>/)?.[1] ?? null;
    const rawLastmod = urlXml.match(/<lastmod>([\s\S]*?)<\/lastmod>/)?.[1] ?? null;
    // Timestamps may be rendered with different precision by the two sitemap
    // modules; the date is the stable part of the contract.
    const lastmod = rawLastmod === null ? null : rawLastmod.slice(0, 10);

    entries.set(sitemapPath(loc), { changefreq, lastmod });
  }

  return entries;
}

/**
 * Extracts the robots meta directive from an HTML document.
 *
 * @param html - The HTML document.
 * @returns The meta content, or null when no robots meta is present.
 */
function robotsMetaContent(html: string): string | null {
  const tag = html.match(/<meta[^>]*\bname="robots"[^>]*>/i)?.[0];
  if (!tag) {
    return null;
  }
  return tag.match(/\bcontent="([^"]*)"/i)?.[1] ?? null;
}

/**
 * Strips the origin from absolute URLs so the oracle's port (3001) and the
 * new site's port (3000) do not cause false differences. Everything else in
 * the file is compared byte-for-byte.
 *
 * @param body - The robots.txt body.
 * @returns The normalized body.
 */
function normalizeRobotsTxt(body: string): string {
  return body.replace(/^(Sitemap: )https?:\/\/[^/]+/gm, '$1<origin>');
}

describe('robots.txt parity', () => {
  it('serves the same robots.txt body and content type', async () => {
    const { oldResponse, newResponse } = await fetchBoth('/robots.txt');

    assert.equal(newResponse.status, oldResponse.status);
    assert.equal(
      newResponse.headers.get('content-type'),
      oldResponse.headers.get('content-type'),
    );
    assert.equal(
      normalizeRobotsTxt(await newResponse.text()),
      normalizeRobotsTxt(await oldResponse.text()),
    );
  });

  it('serves robots.txt without cache headers, like the oracle', async () => {
    const { oldResponse, newResponse } = await fetchBoth('/robots.txt');

    assert.equal(
      newResponse.headers.get('cache-control'),
      oldResponse.headers.get('cache-control'),
    );
  });

  it('emits the same robots meta directive in the document head', async () => {
    const { oldResponse, newResponse } = await fetchBoth('/');

    assert.equal(
      robotsMetaContent(await newResponse.text()),
      robotsMetaContent(await oldResponse.text()),
    );
  });
});

describe('sitemap.xml parity', () => {
  it('serves the same content type without content encoding', async () => {
    const { oldResponse, newResponse } = await fetchBoth('/sitemap.xml');

    assert.equal(newResponse.status, oldResponse.status);
    assert.equal(
      newResponse.headers.get('content-type'),
      oldResponse.headers.get('content-type'),
    );
    assert.equal(
      newResponse.headers.get('content-encoding'),
      oldResponse.headers.get('content-encoding'),
    );
  });

  it('is not compressed when the client accepts gzip', async () => {
    const init = { headers: { 'accept-encoding': 'gzip' } };
    const { oldResponse, newResponse } = await fetchBoth('/sitemap.xml', init);

    assert.equal(newResponse.status, oldResponse.status);
    assert.equal(
      newResponse.headers.get('content-type'),
      oldResponse.headers.get('content-type'),
    );
    assert.equal(
      newResponse.headers.get('content-encoding'),
      oldResponse.headers.get('content-encoding'),
      'content-encoding with Accept-Encoding: gzip',
    );
  });

  it('contains the same URL set with the same change frequencies', async () => {
    const { oldResponse, newResponse } = await fetchBoth('/sitemap.xml');
    const oldEntries = parseSitemap(await oldResponse.text());
    const newEntries = parseSitemap(await newResponse.text());

    assert.deepEqual(
      [...newEntries.keys()].sort(),
      [...oldEntries.keys()].sort(),
      'sitemap URL set',
    );
    assert.deepEqual(
      Object.fromEntries([...newEntries].map(([path, entry]) => [path, entry.changefreq])),
      Object.fromEntries([...oldEntries].map(([path, entry]) => [path, entry.changefreq])),
      'sitemap change frequencies',
    );
  });

  it('marks every fixture URL as last modified on the same date as the oracle', async () => {
    const { oldResponse, newResponse } = await fetchBoth('/sitemap.xml');
    const oldEntries = parseSitemap(await oldResponse.text());
    const newEntries = parseSitemap(await newResponse.text());

    assert.deepEqual(
      Object.fromEntries([...newEntries].filter(([, entry]) => entry.lastmod !== null)),
      Object.fromEntries([...oldEntries].filter(([, entry]) => entry.lastmod !== null)),
      'sitemap lastmod dates',
    );
  });

  it('serves the gzipped sitemap endpoint like the oracle', async () => {
    const { oldResponse, newResponse } = await fetchBoth('/sitemap.xml.gz');

    assert.equal(newResponse.status, oldResponse.status, 'status');
    assert.equal(
      newResponse.headers.get('content-type'),
      oldResponse.headers.get('content-type'),
      'content-type',
    );
    assert.equal(
      newResponse.headers.get('content-encoding'),
      oldResponse.headers.get('content-encoding'),
      'content-encoding',
    );

    const oldXml = gunzipSync(Buffer.from(await oldResponse.arrayBuffer())).toString('utf8');
    const newXml = gunzipSync(Buffer.from(await newResponse.arrayBuffer())).toString('utf8');

    assert.deepEqual(
      [...parseSitemap(newXml).keys()].sort(),
      [...parseSitemap(oldXml).keys()].sort(),
      'uncompressed sitemap URL set',
    );
  });
});
