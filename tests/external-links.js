#!/usr/bin/env node

import '../lib/load-env-file.js';

import http from 'http';
import https from 'https';
import { Octokit } from '@octokit/rest';
import chalk from 'chalk';

import SiteCrawler from '../lib/site-crawler.js';


const USER_AGENT = `Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0`;
const GITHUB_COMMENT_HEADING = `## Broken links update`;
const TIMEOUT = 30_000;

const excludedUrls = [
  `https://open-fixture-library.org`, // exclude canonical URLs
  `http://rdm.openlighting.org/model/display`, // exclude auto-generated URLs pointing to the Open Lighting RDM site as the fixture may not exist
  `https://github.com/OpenLightingProject/open-fixture-library/`, // exclude auto-generated URLs to GitHub as they are flaky and slow down the test
  `https://web.archive.org/`, // Wayback Machine links are designed to be available "forever" and we don't want to put unnecessary load on their servers.
];


const testStartTime = Date.now();
let errored = false;

try {
  const crawler = new SiteCrawler();

  console.log(chalk.blue.bold(`Starting OFL server ...`));
  try {
    await crawler.startServer();
  }
  catch (error) {
    const header = chalk.redBright(`Failed to start OFL server. Maybe you forgot running 'npm run build' or there is already a running server?`);
    throw `${header} ${error.message}`;
  }
  console.log();

  const externalUrlSet = new Set();

  crawler.addEventListener(`externalLinkFound`, ({ url }) => {
    if (!excludedUrls.some(excludedUrl => url.startsWith(excludedUrl))) {
      externalUrlSet.add(url);
      process.stdout.write(`\r${externalUrlSet.size} link(s) found.`);
    }
  });

  const crawlStartTime = Date.now();
  console.log(chalk.blue.bold(`Start crawling the website for external links ...`));
  await crawler.crawl();

  const crawlTime = Date.now() - crawlStartTime;
  console.log(`Crawling finished after ${crawlTime / 1000}s.`);
  console.log();

  const { stdout, stderr } = await crawler.stopServer();
  if (stdout) {
    console.log(chalk.blueBright(`Server output (stdout):`));
    console.log(stdout);
  }
  if (stderr) {
    console.log(chalk.blueBright(`Server errors (stderr):`));
    console.log(stderr);
  }

  const urlResults = await fetchExternalUrls([...externalUrlSet]);
  console.log();

  console.log(chalk.blue.bold(`Updating GitHub issue ...`));
  await updateGithubIssue(urlResults);
}
catch (error) {
  console.error(error);
  errored = true;
}

const testTime = Date.now() - testStartTime;
console.log();
console.log(chalk.greenBright.bold(`Test took ${testTime / 1000}s.`));
process.exit(errored ? 1 : 0);


/**
 * @typedef {object} UrlResult
 * @property {string} url The requested URL.
 * @property {string} message User-visible information about the URL's status.
 * @property {boolean} failed Whether the requested URL can be seen as broken.
 */

/**
 * Fetches the given URLs in small blocks that reduce the likelyhood of false negatives.
 * Pass / fail messages are constantly outputted to console.
 *
 * @param {string[]} externalUrls The URLs to fetch.
 * @returns {Promise<UrlResult[]>} The fetch results of the given URLs. Note that the order may (and probably will) be different.
 */
async function fetchExternalUrls(externalUrls) {
  const urlResults = [];

  // shuffle URLs so all requests to one domain are spread out in time
  externalUrls.sort(() => Math.random() - 0.5);

  const BLOCK_SIZE = 25;
  const urlBlocks = Array.from(
    { length: Math.ceil(externalUrls.length / BLOCK_SIZE) },
    (_, index) => externalUrls.slice(index * BLOCK_SIZE, (index + 1) * BLOCK_SIZE),
  );

  console.log(chalk.blue.bold(`Start fetching ${externalUrls.length} external links in blocks of ${BLOCK_SIZE} URLs ...\n`));
  const fetchStartTime = Date.now();
  for (const urlBlock of urlBlocks) {
    await Promise.all(urlBlock.map(async url => {
      const result = await testExternalLink(url);
      urlResults.push(result);

      const messageColor = result.failed ? chalk.redBright : chalk.greenBright;
      console.log(`[${urlResults.length}/${externalUrls.length}: ${messageColor(result.message)}] ${chalk.yellow(result.url)}`);
    }));
  }

  // similar failing links (i.e. same domain) should be written under each other
  urlResults.sort((a, b) => a.url.localeCompare(b.url));

  const failingUrlResults = urlResults.filter(result => result.failed);

  const fetchTime = Date.now() - fetchStartTime;
  const colonOrPeriod = failingUrlResults.length > 0 ? `:` : `.`;
  console.log(`\nFetching done in ${fetchTime / 1000}s, ${failingUrlResults.length} of ${externalUrls.length} URLs have failed${colonOrPeriod}`);
  for (const { url, message } of failingUrlResults) {
    console.log(`- ${chalk.yellow(url)} (${chalk.redBright(message)})`);
  }

  return urlResults;
}

/**
 * @param {string} url The URL to check.
 * @returns {Promise<UrlResult>} Status of the checked url.
 */
async function testExternalLink(url) {
  const httpModule = url.startsWith(`https`) ? https : http;

  const resultHEAD = await getResult(`HEAD`);

  if (resultHEAD.failed) {
    return getResult(`GET`);
  }
  return resultHEAD;

  /**
   * @param {string} method The HTTP requests method, e.g. GET or HEAD.
   * @returns {Promise<UrlResult>} Status of the url which has been requested with the given method.
   */
  function getResult(method) {
    const requestOptions = {
      method,
      headers: {
        'user-agent': USER_AGENT,
      },
      timeout: TIMEOUT,
    };

    return new Promise((resolve, reject) => {
      const request = httpModule.get(url, requestOptions, response => {
        resolve({
          url,
          message: `${response.statusCode} ${response.statusMessage}`,
          failed: ![200, 302, 307].includes(response.statusCode),
        });
      });

      request.on(`timeout`, () => {
        resolve({
          url,
          message: `Timeout of ${requestOptions.timeout}ms exceeded.`,
          failed: true,
        });
        request.abort();
      });

      request.on(`error`, error => {
        resolve({
          url,
          message: error.message,
          failed: true,
        });
      });
    });
  }
}

/**
 * Updates the GitHub issue for broken links.
 *
 * @param {UrlResult[]} urlResults Fetch results of all external URLs.
 * @returns {Promise} Promise that resolves when issue has been updated or rejects if the issue can't be updated.
 */
async function updateGithubIssue(urlResults) {
  const requiredEnvironmentVariables = [
    `GITHUB_USER_TOKEN`,
    `GITHUB_BROKEN_LINKS_ISSUE_NUMBER`,
    `GITHUB_REPOSITORY`,
    `GITHUB_RUN_ID`,
  ];

  for (const environmentVariable of requiredEnvironmentVariables) {
    if (!(environmentVariable in process.env)) {
      console.log(`For updating GitHub issue, environment variable ${environmentVariable} is required. Please define it in your system or in the .env file.`);
      return;
    }
  }

  const workflowRunUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;

  const githubClient = new Octokit({
    auth: `token ${process.env.GITHUB_USER_TOKEN}`,
  });

  const [repoOwner, repoName] = process.env.GITHUB_REPOSITORY.split(`/`);

  let issue;

  try {
    issue = await githubClient.rest.issues.get({
      owner: repoOwner,
      repo: repoName,
      'issue_number': process.env.GITHUB_BROKEN_LINKS_ISSUE_NUMBER,
    });
  }
  catch (error) {
    throw `Can't access issue number ${process.env.GITHUB_BROKEN_LINKS_ISSUE_NUMBER}: ${error.message}. Please create it and leave the body empty.`;
  }

  const oldLinkData = getLinkDataFromBody(issue.data.body);
  const newFailingUrlResults = [];
  const fixedUrlResults = [];
  const newLinkData = getUpdatedLinkData();
  const deletedUrls = Object.keys(oldLinkData).filter(url => !urlResults.some(result => result.url === url));

  console.log(`Updating GitHub issue body at https://github.com/${process.env.GITHUB_REPOSITORY}/issues/${process.env.GITHUB_BROKEN_LINKS_ISSUE_NUMBER}`);
  await githubClient.rest.issues.update({
    owner: repoOwner,
    repo: repoName,
    'issue_number': process.env.GITHUB_BROKEN_LINKS_ISSUE_NUMBER,
    body: getBodyFromLinkData(newLinkData),
  });

  await deleteAutoGeneratedComments();
  await createCommentIfNeeded();

  /**
   * @typedef {Record<string, LinkStatus[]>} LinkData URLs pointing to the last seven statuses.
   */

  /**
   * @typedef {object} LinkStatus
   * @property {boolean} failed Whether the requested URL can be seen as broken.
   * @property {string | null} message User-visible information about the URL's status. May be null for passing links.
   * @property {string | null} jobUrl Link to the workflow run page. May be null for passing links.
   */

  /**
   * @param {string} body The current GitHub issue body.
   * @returns {LinkData} The link data that is read from the body.
   */
  function getLinkDataFromBody(body) {
    const linkData = {};

    try {
      const lines = body.split(/\r?\n/); // support both \n and \r\n newline types
      for (const line of lines) {
        if (!line.startsWith(`<tr><td nowrap>`)) {
          continue;
        }

        const [, lastResults, url] = line.match(/<tr><td nowrap>(.*?)<\/td><td><a href="(.*?)"/);

        linkData[url] = lastResults.split(`&nbsp;`).map(item => {
          if (item === `✔️`) {
            return {
              failed: false,
              message: null,
              jobUrl: null,
            };
          }

          const [, jobUrl, message] = item.match(/<a href="(.*)" title="(.*)">[^<]+<\/a>/);

          return {
            failed: true,
            message,
            jobUrl,
          };
        });
      }
    }
    catch (error) {
      throw new Error(`Unable to retrieve link data from issue body`, {
        cause: error,
      });
    }

    return linkData;
  }

  /**
   * Updates the given link data based on the new URL results.
   * Also updates newFailingUrlResults and fixedUrlResults to remember these URLs for the issue comment.
   *
   * @returns {LinkData} Updated link data with new statuses for all existing links, new links added and fixed links removed.
   */
  function getUpdatedLinkData() {
    const linkData = {};

    for (const urlResult of urlResults) {
      const { url, message, failed } = urlResult;

      if (Object.keys(oldLinkData).includes(url)) {
        // URL is already in table

        const currentStatus = {
          failed,
          message,
          jobUrl: workflowRunUrl,
        };
        const oldStatuses = oldLinkData[url];

        const statuses = [currentStatus, ...oldStatuses.slice(0, 6)];

        if (statuses.every(status => !status.failed)) {
          // passing for seven days -> don't add to new table but create comment
          fixedUrlResults.push(urlResult);
        }
        else {
          // still failing -> update table
          linkData[url] = statuses;
        }
      }
      else if (failed) {
        // new broken link -> update table and create comment

        const statuses = Array.from(
          { length: 7 },
          () => ({
            failed: false,
            message: null,
            jobUrl: null,
          }),
        );
        statuses[0] = {
          failed,
          message,
          jobUrl: workflowRunUrl,
        };
        linkData[url] = statuses;

        newFailingUrlResults.push(urlResult);
      }
    }

    return linkData;
  }

  /**
   * @param {LinkStatus} status The status to get the linked emoji for.
   * @returns {string} An emoji, wrapped in a link to the failed job if applicable.
   */
  function getStatusEmojiLink(status) {
    if (!status.failed) {
      return `✔️`;
    }

    const message = status.message.replaceAll(`\n`, ` `).replaceAll(`"`, `&quot;`);
    const emoji = getFailedEmoji(status.message);
    return `<a href="${status.jobUrl}" title="${message}">${emoji}</a>`;
  }

  /**
   * @param {LinkData} linkData The new link data from which to create the issue body.
   * @returns {string} The new issue body (in Markdown and HTML) from the given link data.
   */
  function getBodyFromLinkData(linkData) {
    const scriptName = import.meta.url.split(`/`).slice(-2).join(`/`);
    const rows = Object.entries(linkData).map(([url, statuses]) => {
      const statusIcons = statuses.map(status => getStatusEmojiLink(status)).join(`&nbsp;`);
      const link = `<a href="${url}" target="_blank">${url}</a>`;
      return `<tr><td nowrap>${statusIcons}</td><td>${link}</td></tr>`;
    });
    const lines = [
      `*Auto-generated content by \`${scriptName}\`.*`,
      ``,
      `**Last updated:** ${new Date().toISOString()}`,
      ``,
      `<table>`,
      `<tr><th nowrap>today … 6 days ago</th><th>URL</th></tr>`,
      ...rows,
      `</table>`,
    ];
    return lines.join(`\n`);
  }

  /**
   * Deletes all auto-generated issue comments, i.e. comment that were created by this script type earlier, to keep the issue clean.
   *
   * @returns {Promise} Promise that resolves as soon as all (or none) comments have been deleted.
   */
  async function deleteAutoGeneratedComments() {
    const { data: comments } = await githubClient.rest.issues.listComments({
      owner: repoOwner,
      repo: repoName,
      'issue_number': process.env.GITHUB_BROKEN_LINKS_ISSUE_NUMBER,
      'per_page': 100,
    });

    const autoGeneratedComments = comments.filter(
      comment => comment.body.startsWith(GITHUB_COMMENT_HEADING),
    );

    console.log(`Deleting ${autoGeneratedComments.length} auto-generated GitHub comment(s).`);
    await Promise.all(autoGeneratedComments.map(
      comment => githubClient.rest.issues.deleteComment({
        owner: repoOwner,
        repo: repoName,
        'comment_id': comment.id,
      }),
    ));
  }

  /**
   * Creates a notifying issue comment if there are new failing or fixed URLs.
   *
   * @returns {Promise} Promise that resolves as soon as the comment (or no comment) has been created.
   */
  async function createCommentIfNeeded() {
    if (newFailingUrlResults.length === 0 && fixedUrlResults.length === 0 && deletedUrls.length === 0) {
      return;
    }

    const lines = [
      `${GITHUB_COMMENT_HEADING} (${new Date().toISOString()})`,
      ``,
      `[📃 Workflow run](${workflowRunUrl})`,
      ``,
    ];

    if (newFailingUrlResults.length > 0) {
      lines.push(
        `### ❌ New failing URLs`,
        ...newFailingUrlResults.map(urlResult => `- ${urlResult.url} (${urlResult.message})`),
        ``,
      );
    }

    if (fixedUrlResults.length > 0) {
      lines.push(
        `### ✔️ Fixed URLs (no fails in the last seven days)`,
        ...fixedUrlResults.map(urlResult => `- ${urlResult.url} (${urlResult.message})`),
        ``,
      );
    }

    if (deletedUrls.length > 0) {
      lines.push(
        `### ✔️ Fixed URLs (failing URLs not included anymore)`,
        ...deletedUrls.map(url => `- ${url}`),
        ``,
      );
    }

    console.log(`Creating GitHub comment.`);
    await githubClient.rest.issues.createComment({
      owner: repoOwner,
      repo: repoName,
      'issue_number': process.env.GITHUB_BROKEN_LINKS_ISSUE_NUMBER,
      body: lines.join(`\n`),
    });
  }
}

/**
 * @param {string} message The error message.
 * @returns {string} The emoji to display for that error message.
 */
function getFailedEmoji(message) {
  switch (message.trim().toLowerCase()) {
    case `301`:
    case `301 moved permanently`: {
      return `⏩`;
    }
    case `403`:
    case `403 forbidden`: {
      return `⛔`;
    }
    case `429`:
    case `429 too many requests`: {
      return `🆘`;
    }
    case `certificate has expired`:
    case `unable to verify the first certificate`: {
      return `🔒`;
    }
    case `timeout of ${TIMEOUT}ms exceeded.`: {
      return `⌛`;
    }
    default: {
      return `❌`;
    }
  }
}
