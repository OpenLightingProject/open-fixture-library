#!/usr/bin/env node

const http = require(`http`);
const https = require(`https`);
const path = require(`path`);
const chalk = require(`chalk`);
const { Octokit } = require(`@octokit/rest`);

require(`../lib/load-env-file.js`);

const USER_AGENT = require(`default-user-agent`)();
const GITHUB_COMMENT_HEADING = `## Broken links update`;
const TIMEOUT = 30_000;

const SiteCrawler = require(`../lib/site-crawler.js`);


const climateStrikeDate = new Date(`2019-11-29`);
const today = new Date();
const isClimateStrike = climateStrikeDate.getDate() === today.getDate() &&
  climateStrikeDate.getMonth() === today.getMonth() &&
  climateStrikeDate.getFullYear() === today.getFullYear();

if (isClimateStrike) {
  // do nothing on strike day and return green :)
  process.exit(0);
}


(async () => {
  const testStartTime = new Date();
  let errored = false;

  try {
    const crawler = new SiteCrawler();

    console.log(chalk.blue.bold(`Starting OFL server ...`));
    try {
      await crawler.startServer();
    }
    catch (error) {
      throw `${chalk.redBright(`Failed to start OFL server. Maybe you forgot running 'make all' or there is already a running server?`)} ${error.message}`;
    }
    console.log();

    const externalUrlSet = new Set();

    crawler.on(`externalLinkFound`, url => {
      // exclude canonical URLs and auto-generated ones pointing to the Open Lighting RDM site as the fixture may not exist
      if (!url.startsWith(`https://open-fixture-library.org`) && !url.startsWith(`http://rdm.openlighting.org/model/display`)) {
        externalUrlSet.add(url);
        process.stdout.write(`\r${externalUrlSet.size} link(s) found.`);
      }
    });

    const crawlStartTime = new Date();
    console.log(chalk.blue.bold(`Start crawling the website for external links ...`));
    await crawler.crawl();

    const crawlTime = new Date() - crawlStartTime;
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

    const urlResults = await fetchExternalUrls(Array.from(externalUrlSet));
    console.log();

    console.log(chalk.blue.bold(`Updating GitHub issue ...`));
    await updateGithubIssue(urlResults);
  }
  catch (error) {
    console.error(error);
    errored = true;
  }

  const testTime = new Date() - testStartTime;
  console.log();
  console.log(chalk.greenBright.bold(`Test took ${testTime / 1000}s.`));
  process.exit(errored ? 1 : 0);
})();




/**
 * @typedef {Object} UrlResult
 * @property {String} url The requested URL.
 * @property {String} message User-visible information about the URL's status.
 * @property {Boolean} failed Whether the requested URL can be seen as broken.
 */

/**
 * Fetches the given URLs in small blocks that reduce the likelyhood of false negatives.
 * Pass / fail messages are constantly outputted to console.
 *
 * @param {Array.<String>} externalUrls The URLs to fetch.
 * @returns {Promise.<Array.<UrlResult>>} The fetch results of the given URLs. Note that the order may (and probably will) be different.
 */
async function fetchExternalUrls(externalUrls) {
  const urlResults = [];

  const BLOCK_SIZE = 25;
  const urlBlocks = new Array(Math.ceil(externalUrls.length / BLOCK_SIZE)).fill().map(
    (_, index) => externalUrls.slice(index * BLOCK_SIZE, (index + 1) * BLOCK_SIZE),
  );

  console.log(chalk.blue.bold(`Start fetching ${externalUrls.length} external links in blocks of ${BLOCK_SIZE} URLs ...\n`));
  const fetchStartTime = new Date();
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

  const fetchTime = new Date() - fetchStartTime;
  const colonOrPeriod = failingUrlResults.length > 0 ? `:` : `.`;
  console.log(`\nFetching done in ${fetchTime / 1000}s, ${failingUrlResults.length} of ${externalUrls.length} URLs have failed${colonOrPeriod}`);
  for (const { url, message } of failingUrlResults) {
    console.log(`- ${chalk.yellow(url)} (${chalk.redBright(message)})`);
  }

  return urlResults;
}

/**
 * @param {String} url The URL to check.
 *
 * @returns {Promise.<UrlResult>} Status of the checked url.
 */
async function testExternalLink(url) {
  const httpModule = url.startsWith(`https`) ? https : http;

  const resultHEAD = await getResult(`HEAD`);

  if (resultHEAD.failed) {
    return await getResult(`GET`);
  }
  return resultHEAD;

  /**
   * @param {String} method The HTTP requests method, e.g. GET or HEAD.
   *
   * @returns {Promise.<UrlResult>} Status of the url which has been requested with the given method.
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
 * @param {Array.<UrlResult>} urlResults Fetch results of all external URLs.
 * @returns {Promise} Promise that resolves when issue has been updated or rejects if the issue can't be updated.
 */
async function updateGithubIssue(urlResults) {
  const requiredEnvironmentVariables = [
    `GITHUB_USER_TOKEN`,
    `GITHUB_BROKEN_LINKS_ISSUE_NUMBER`,
    `TRAVIS_REPO_SLUG`,
    `TRAVIS_JOB_WEB_URL`,
  ];

  for (const environmentVariable of requiredEnvironmentVariables) {
    if (!(environmentVariable in process.env)) {
      console.log(`For updating GitHub issue, environment variable ${environmentVariable} is required. Please define it in your system or in the .env file.`);
      return;
    }
  }

  const githubClient = new Octokit({
    auth: `token ${process.env.GITHUB_USER_TOKEN}`,
  });

  const repoOwner = process.env.TRAVIS_REPO_SLUG.split(`/`)[0];
  const repoName = process.env.TRAVIS_REPO_SLUG.split(`/`)[1];

  let issue;

  try {
    issue = await githubClient.issues.get({
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

  console.log(`Updating GitHub issue body at https://github.com/${process.env.TRAVIS_REPO_SLUG}/issues/${process.env.GITHUB_BROKEN_LINKS_ISSUE_NUMBER}`);
  await githubClient.issues.update({
    owner: repoOwner,
    repo: repoName,
    'issue_number': process.env.GITHUB_BROKEN_LINKS_ISSUE_NUMBER,
    body: getBodyFromLinkData(newLinkData),
  });

  await deleteAutoGeneratedComments();
  await createCommentIfNeeded();

  /**
   * @typedef {Object.<String, LinkStatus>} LinkData URLs pointing to the last seven statuses.
   */

  /**
   * @typedef {Object} LinkStatus
   * @property {Boolean} failed Whether the requested URL can be seen as broken.
   * @property {String|null} message User-visible information about the URL's status. May be null for passing links.
   * @property {String|null} jobUrl Link to the travis job. May be null for passing links.
   */

  /**
   * @param {String} body The current GitHub issue body.
   * @returns {LinkData} The link data that is read from the body.
   */
  function getLinkDataFromBody(body) {
    const linkData = {};

    try {
      const lines = body.split(/\r?\n/); // support both \n and \r\n newline types
      const firstContentLine = lines.findIndex(line => line.startsWith(`|`)) + 2;
      lines.splice(0, firstContentLine); // delete first lines which only hold general data
      for (const line of lines) {
        const [, url, lastResults] = line.match(/^\| (.*) <td nowrap>(.*)<\/td>$/);

        linkData[url] = lastResults.split(`&nbsp;`).map(item => {
          if (item === `:heavy_check_mark:`) {
            return {
              failed: false,
              message: null,
              jobUrl: null,
            };
          }

          const [, jobUrl, message] = item.match(/<a href="(.*)" title="(.*)">:x:<\/a>/);

          return {
            failed: true,
            message,
            jobUrl,
          };
        });
      }
    }
    catch (error) {
      throw `Unable to retrieve link data from issue body: ${error}`;
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
          jobUrl: process.env.TRAVIS_JOB_WEB_URL,
        };
        const oldStatuses = oldLinkData[url];

        const statuses = [currentStatus].concat(oldStatuses.slice(0, 6));

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

        const statuses = new Array(7).fill({
          failed: false,
          message: null,
          jobUrl: null,
        });
        statuses[0] = {
          failed,
          message,
          jobUrl: process.env.TRAVIS_JOB_WEB_URL,
        };
        linkData[url] = statuses;

        newFailingUrlResults.push(urlResult);
      }
    }

    return linkData;
  }

  /**
   * @param {LinkData} linkData The new link data from which to create the issue body.
   * @returns {String} The new issue body (in Markdown and HTML) from the given link data.
   */
  function getBodyFromLinkData(linkData) {
    const lines = [
      `*Auto-generated content by \`${path.relative(path.join(__dirname, `..`), __filename)}\`.*`,
      ``,
      `**Last updated:** ${(new Date()).toISOString()}`,
      ``,
      `| URL <th nowrap>today … 6 days ago</th>`,
      `|--------------------------------------|`,
      ...Object.entries(linkData).map(([url, statuses]) => {
        const statusIcons = statuses.map(status => {
          if (!status.failed) {
            return `:heavy_check_mark:`;
          }

          const message = status.message.replace(`\n`, ` `).replace(`"`, `&quot;`);
          return `<a href="${status.jobUrl}" title="${message}">:x:</a>`;
        }).join(`&nbsp;`);

        return `| ${url} <td nowrap>${statusIcons}</td>`;
      }),
    ];

    return lines.join(`\n`);
  }

  /**
   * Deletes all auto-generated issue comments, i.e. comment that were created by this script type earlier, to keep the issue clean.
   *
   * @returns {Promise} Promise that resolves as soon as all (or none) comments have been deleted.
   */
  async function deleteAutoGeneratedComments() {
    const comments = (await githubClient.issues.listComments({
      owner: repoOwner,
      repo: repoName,
      'issue_number': process.env.GITHUB_BROKEN_LINKS_ISSUE_NUMBER,
      'per_page': 100,
    })).data;

    const autoGeneratedComments = comments.filter(
      comment => comment.body.startsWith(GITHUB_COMMENT_HEADING),
    );

    console.log(`Deleting ${autoGeneratedComments.length} auto-generated GitHub comment(s).`);
    await Promise.all(autoGeneratedComments.map(
      comment => githubClient.issues.deleteComment({
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
    if (newFailingUrlResults.length === 0 && fixedUrlResults.length === 0) {
      return;
    }

    const lines = [
      `${GITHUB_COMMENT_HEADING} (${(new Date()).toISOString()})`,
      ``,
      `[:page_with_curl: Travis job](${process.env.TRAVIS_JOB_WEB_URL})`,
      ``,
    ];

    if (newFailingUrlResults.length > 0) {
      lines.push(`### :x: New failing URLs`);
      lines.push(...newFailingUrlResults.map(
        urlResult => `- ${urlResult.url} (${urlResult.message})`,
      ));
      lines.push(``);
    }

    if (fixedUrlResults.length > 0) {
      lines.push(`### :heavy_check_mark: Fixed URLs (no fails in the last seven days)`);
      lines.push(...fixedUrlResults.map(
        urlResult => `- ${urlResult.url} (${urlResult.message})`,
      ));
      lines.push(``);
    }

    console.log(`Creating GitHub comment.`);
    await githubClient.issues.createComment({
      owner: repoOwner,
      repo: repoName,
      'issue_number': process.env.GITHUB_BROKEN_LINKS_ISSUE_NUMBER,
      body: lines.join(`\n`),
    });
  }
}
