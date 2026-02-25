import chalk from 'chalk';
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
      console.log(chalk.greenBright(`[PASS]`), url);
    });
    crawler.addEventListener(`failingPage`, ({ url, error }) => {
      console.log(chalk.redBright(`[FAIL]`), `${url} (${chalk.redBright(error)})`);
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
