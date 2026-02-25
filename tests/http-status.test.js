import { styleText } from 'util';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import '../lib/load-env-file.js';

import SiteCrawler from '../lib/site-crawler.js';

describe(`http-status`, () => {
  /** @type {string[]} */
  const failingLinks = [];

  const crawler = new SiteCrawler();

  beforeAll(async () => {
    await crawler.startServer();

    crawler.addEventListener(`passingPage`, ({ url }) => {
      console.log(styleText(`greenBright`, `[PASS]`), url);
    });
    crawler.addEventListener(`failingPage`, ({ url, error }) => {
      const coloredError = styleText(`redBright`, error);
      console.log(styleText(`redBright`, `[FAIL]`), `${url} (${coloredError})`);
      failingLinks.push(`${url} (${error})`);
    });
  }, 30_000);

  afterAll(async () => {
    await crawler.stopServer();
  });

  it(`should have no failing internal links`, async () => {
    await crawler.crawl();

    const failingLinksText = failingLinks.join(`\n`);
    expect(failingLinks, `Failing links:\n${failingLinksText}`).toStrictEqual([]);
  }, 10 * 60_000);
});
