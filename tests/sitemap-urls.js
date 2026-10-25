#!/usr/bin/env node

import '../lib/load-env-file.js';

import chalk from 'chalk';
import { fetch } from 'undici';

const BASE_URL = `http://localhost:${process.env.PORT || 3000}`;

/**
 * Reads all `<loc>` URLs from a sitemap and strips the base URL.
 * @param {string} path - The sitemap path to fetch.
 * @returns {Promise<string[]>} The sitemap URLs as site-relative paths.
 */
async function getSitemapUrls(path) {
  const response = await fetch(`${BASE_URL}${path}`);
  const text = await response.text();
  const urls = [];
  const matches = text.matchAll(/<loc>([^<]+)<\/loc>/g);
  for (const match of matches) {
    urls.push(match[1].replace(BASE_URL, ''));
  }
  return urls;
}

/**
 * Requests one URL and classifies the result for the report.
 * @param {string} url - The site-relative URL to test.
 * @returns {Promise<{url: string, status: string, error?: string | number}>} The test result.
 */
async function testUrl(url) {
  try {
    const response = await fetch(`${BASE_URL}${url}`, { redirect: 'follow' });
    return response.status === 200 ? { url, status: 'pass' } : { url, status: 'fail', error: response.status };
  }
  catch (error) {
    return { url, status: 'fail', error: error.message };
  }
}

/**
 * Crawls the sitemap and reports all internal links that fail.
 * @returns {Promise<void>}
 */
async function test() {
  console.log(chalk.blue.bold('Starting sitemap-based URL test...'));

  const urls = await getSitemapUrls('/sitemap.xml');
  console.log(`Found ${urls.length} URLs from sitemap`);

  console.log(chalk.blue.bold(`Testing ${urls.length} URLs (with concurrency control)...`));

  const passingLinks = [];
  const failingLinks = [];

  const BATCH_SIZE = 1;
  const DELAY_MS = 300;

  for (let index = 0; index < urls.length; index += BATCH_SIZE) {
    const batch = urls.slice(index, index + BATCH_SIZE);
    const results = await Promise.all(batch.map((url) => testUrl(url)));

    for (const result of results) {
      if (result.status === 'pass') {
        passingLinks.push(result.url);
        console.log(chalk.greenBright('[PASS]'), result.url);
      }
      else {
        failingLinks.push(`${result.url} (${result.error})`);
        console.log(chalk.redBright('[FAIL]'), `${result.url} (${result.error})`);
      }
    }

    if (index + BATCH_SIZE < urls.length) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  console.log();
  if (failingLinks.length > 0) {
    console.log(chalk.redBright('[FAIL]'), `${failingLinks.length} of ${passingLinks.length + failingLinks.length} tested internal links failed:`);
    for (const link of failingLinks) {
      console.log(`- ${link}`);
    }
  }
  else {
    console.log(chalk.greenBright('[PASS]'), `All ${passingLinks.length} tested internal links passed!`);
  }

  process.exit(failingLinks.length > 0 ? 1 : 0);
}

try {
  await test();
}
catch (error) {
  console.error(error);
  process.exit(1);
}
