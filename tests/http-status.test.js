import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import '../lib/load-env-file.js';

import SiteCrawler from '../lib/site-crawler.js';

describe(`http-status`, () => {
  /** @type {string[]} */
  const failingLinks = [];

  /** @type {SiteCrawler} */
  let crawler;

  beforeAll(async () => {
    crawler = new SiteCrawler();
    await crawler.startServer();

    crawler.addEventListener(`failingPage`, ({ url, error }) => {
      failingLinks.push(`${url} (${error})`);
    });

    await crawler.crawl();
  }, 5 * 60 * 1000);

  afterAll(async () => {
    await crawler.stopServer();
  });

  it(`should have no failing internal links`, () => {
    const failingLinksText = failingLinks.join(`\n`);
    expect(failingLinks, `Failing links:\n${failingLinksText}`).toStrictEqual([]);
  });
});
