#!/usr/bin/env node

import '../lib/load-env-file.js';

import chalk from 'chalk';
import { fetch } from 'undici';

const BASE_URL = `http://localhost:${process.env.PORT || 3000}`;

async function getSitemapUrls(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  const text = await res.text();
  const urls = [];
  const matches = text.matchAll(/<loc>([^<]+)<\/loc>/g);
  for (const match of matches) {
    urls.push(match[1].replace(BASE_URL, ''));
  }
  return urls;
}

async function testUrl(url) {
  try {
    const res = await fetch(`${BASE_URL}${url}`, { redirect: 'follow' });
    if (res.status === 200) {
      return { url, status: 'pass' };
    }
    return { url, status: 'fail', error: res.status };
  } catch (e) {
    return { url, status: 'fail', error: e.message };
  }
}

async function test() {
  console.log(chalk.blue.bold(`Starting sitemap-based URL test...`));
  
  const urls = await getSitemapUrls('/sitemap.xml');
  console.log(`Found ${urls.length} URLs from sitemap`);

  console.log(chalk.blue.bold(`Testing ${urls.length} URLs (with concurrency control)...`));

  const passingLinks = [];
  const failingLinks = [];

  const BATCH_SIZE = 1;
  const DELAY_MS = 300;
  
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(testUrl));
    
    for (const result of results) {
      if (result.status === 'pass') {
        passingLinks.push(result.url);
        console.log(chalk.greenBright(`[PASS]`), result.url);
      } else {
        failingLinks.push(`${result.url} (${result.error})`);
        console.log(chalk.redBright(`[FAIL]`), `${result.url} (${result.error})`);
      }
    }
    
    if (i + BATCH_SIZE < urls.length) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  console.log();
  if (failingLinks.length > 0) {
    console.log(chalk.redBright(`[FAIL]`), `${failingLinks.length} of ${passingLinks.length + failingLinks.length} tested internal links failed:`);
    for (const link of failingLinks) {
      console.log(`- ${link}`);
    }
  } else {
    console.log(chalk.greenBright(`[PASS]`), `All ${passingLinks.length} tested internal links passed!`);
  }
  
  process.exit(failingLinks.length > 0 ? 1 : 0);
}

test().catch(e => {
  console.error(e);
  process.exit(1);
});
