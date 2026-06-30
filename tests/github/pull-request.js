import '../../lib/load-env-file.js';

import path from 'path';
import { fileURLToPath } from 'url';
import { styleText } from 'util';
import { Octokit } from '@octokit/rest';

const requiredEnvironmentVariables = [
  'GITHUB_USER_TOKEN',
  'GITHUB_REPOSITORY',
  'GITHUB_PR_NUMBER',
  'GITHUB_PR_HEAD_REF',
  'GITHUB_PR_BASE_REF',
];
const GITHUB_BODY_MAX_BYTES = 262_144; // = max 65_536 4-byte Unicode characters
const RESERVED_COMMENT_BYTES = 2144; // reserve space for comment/issue body header

/** @type {Octokit} */
let githubClient;

let repoOwner;
let repoName;
let prData;

/**
 * Checks if the environment variables for GitHub operations are correct.
 * @returns {Promise} Rejects an error message if the environment is not correct.
 */
export async function checkEnv() {
  for (const environmentVariable of requiredEnvironmentVariables) {
    if (!(environmentVariable in process.env)) {
      throw `Environment variable ${environmentVariable} is required for this script. Please define it in your system or in the .env file.`;
    }
  }
}

/**
 * Fetch data about the current pull request from the GitHub API.
 * @returns {Promise} A Promise that resolves to the returned pull request data.
 */
export async function init() {
  await checkEnv();

  repoOwner = process.env.GITHUB_REPOSITORY.split('/', 1)[0];
  repoName = process.env.GITHUB_REPOSITORY.split('/', 2)[1];

  githubClient = new Octokit({
    auth: `token ${process.env.GITHUB_USER_TOKEN}`,
  });

  const pr = await githubClient.rest.pulls.get({
    owner: repoOwner,
    repo: repoName,
    // eslint-disable-next-line camelcase -- required by GitHub API
    pull_number: process.env.GITHUB_PR_NUMBER,
  });

  // save PR for later use
  prData = pr.data;

  return pr.data;
}

/**
 * @returns {Promise} A Promise that resolves to an object which describes the OFL components changed in this pull request.
 */
export async function fetchChangedComponents() {
  // fetch changed files in blocks of 100
  const filePromises = [];
  for (let index = 0; index < prData.changed_files / 100; index++) {
    filePromises.push(githubClient.rest.pulls.listFiles({
      owner: repoOwner,
      repo: repoName,
      // eslint-disable-next-line camelcase -- required by GitHub API
      pull_number: process.env.GITHUB_PR_NUMBER,
      // eslint-disable-next-line camelcase -- required by GitHub API
      per_page: 100,
      page: index + 1,
    }));
  }

  // check which model components, plugins and fixtures have been changed in the PR
  const fileBlocks = await Promise.all(filePromises);

  const changedComponents = {
    added: {
      schema: false,
      model: false,
      imports: [], // array of plugin keys
      exports: [], // array of plugin keys
      exportTests: [], // array of [plugin key, test key]
      fixtures: [], // array of [man key, fix key]
    },
    modified: {
      schema: false,
      model: false,
      imports: [], // array of plugin keys
      exports: [], // array of plugin keys
      exportTests: [], // array of [plugin key, test key]
      fixtures: [], // array of [man key, fix key]
    },
    removed: {
      schema: false,
      model: false,
      imports: [], // array of plugin keys
      exports: [], // array of plugin keys
      exportTests: [], // array of [plugin key, test key]
      fixtures: [], // array of [man key, fix key]
    },
  };

  for (const block of fileBlocks) {
    for (const fileData of block.data) {
      handleFileData(fileData);
    }
  }

  return changedComponents;

  /**
   * Forwards the file's status and path to handleFile(...) with the specialty of splitting renamed files into added/removed.
   * @param {object} fileData - The file object from GitHub.
   */
  function handleFileData(fileData) {
    if (fileData.status === 'renamed') {
      // Handling renamed files would be a bit tricky, as we also had to store the previous filename.
      // That's why we simply treat the old file name as removed and the new one as added.
      handleFile('added', fileData.filename);
      handleFile('removed', fileData.previous_filename);
    }
    else {
      handleFile(fileData.status, fileData.filename);
    }
  }

  /**
   * Parse the file type by its path and update the change summary of the file's status accordingly.
   * @param {'added' | 'removed' | 'modified'} fileStatus - What happened with the file in this pull request.
   * @param {string} filePath - The file name, relative to the repository's root.
   */
  function handleFile(fileStatus, filePath) {
    const changeSummary = changedComponents[fileStatus];
    const segments = filePath.split('/');

    if (segments[0] === 'lib' && segments[1] === 'model') {
      changeSummary.model = true;
      return;
    }

    if (segments[0] === 'plugins' && segments[2] === 'import.js') {
      changeSummary.imports.push(segments[1]); // plugin key
      return;
    }

    if (segments[0] === 'plugins' && segments[2] === 'export.js') {
      changeSummary.exports.push(segments[1]); // plugin key
      return;
    }

    if (segments[0] === 'plugins' && segments[2] === 'exportTests') {
      changeSummary.exportTests.push([
        segments[1], // plugin key
        segments[3].split('.', 1)[0], // test key
      ]);
      return;
    }

    if (segments[0] === 'schemas') {
      changeSummary.schema = true;
      return;
    }

    if (segments[0] === 'fixtures' && segments.length === 3) {
      changeSummary.fixtures.push([
        segments[1], // man key
        segments[2].split('.', 1)[0], // fix key
      ]);
    }
  }
}

/**
 * Creates a new comment in the PR if test.lines is not empty and if there is not already an exactly equal comment.
 * Deletes old comments from the same test (determined by test.fileUrl).
 * @param {object} test - Information about the test script that wants to update the comment.
 * @param {URL} test.fileUrl - URL of the test file.
 * @param {string} test.name - Heading to be used in the comment
 * @param {string[]} test.lines - The comment's lines of text
 * @returns {Promise} A Promise that is fulfilled as soon as all GitHub operations have finished
 */
export async function updateComment(test) {
  if (prData.head.repo.full_name !== prData.base.repo.full_name) {
    console.warn(styleText('yellow', 'Warning:'), 'This PR is created from a forked repository, so there is no write permission for the repo.');
    return undefined;
  }

  const oflRootPath = fileURLToPath(new URL('../../', import.meta.url));
  const relativeFilePath = path.relative(oflRootPath, fileURLToPath(test.fileUrl));

  const lines = [
    `<!-- GITHUB-TEST: ${relativeFilePath} -->`,
    `# ${test.name}`,
    `(Output of test script \`${relativeFilePath}\`.)`,
    '',
    ...test.lines,
  ];
  const message = lines.join('\n');

  const commentPromises = [];
  for (let index = 0; index < prData.comments / 100; index++) {
    commentPromises.push(
      githubClient.rest.issues.listComments({
        owner: repoOwner,
        repo: repoName,
        // eslint-disable-next-line camelcase -- required by GitHub API
        issue_number: process.env.GITHUB_PR_NUMBER,
        // eslint-disable-next-line camelcase -- required by GitHub API
        per_page: 100,
        page: index + 1,
      }),
    );
  }

  const commentBlocks = await Promise.all(commentPromises);
  const comments = commentBlocks.flatMap((block) => block.data);

  let equalFound = false;
  const promises = comments.flatMap((comment) => {
    // get rid of \r linebreaks
    comment.body = comment.body.replaceAll('\r', '');

    if (lines[0] !== comment.body.split('\n', 1)[0]) {
      // the comment was not created by this test script
      return [];
    }

    if (!equalFound && message === comment.body && test.lines.length > 0) {
      equalFound = true;
      console.log(`Test comment with same content already exists at ${process.env.GITHUB_REPOSITORY}#${process.env.GITHUB_PR_NUMBER}.`);
      return [];
    }

    console.log(`Deleting old test comment at ${process.env.GITHUB_REPOSITORY}#${process.env.GITHUB_PR_NUMBER}.`);

    return githubClient.rest.issues.deleteComment({
      owner: repoOwner,
      repo: repoName,
      // eslint-disable-next-line camelcase -- required by GitHub API
      comment_id: comment.id,
    });
  });

  if (!equalFound && test.lines.length > 0) {
    console.log(`Creating test comment at ${process.env.GITHUB_REPOSITORY}#${process.env.GITHUB_PR_NUMBER}.`);
    promises.push(githubClient.rest.issues.createComment({
      owner: repoOwner,
      repo: repoName,
      // eslint-disable-next-line camelcase -- required by GitHub API
      issue_number: process.env.GITHUB_PR_NUMBER,
      body: message,
    }));
  }

  return Promise.all(promises);
}

/**
 * Tries to append `newLines` to `lines`. If adding `newLines` plus `tooLongMessage`
 * (plus any `trailingLines`) would exceed the byte limit, appends `tooLongMessage`
 * instead and returns `true`. Otherwise appends `newLines` and returns `false`.
 *
 * @param {string[]} lines - Accumulated lines so far (mutated in place).
 * @param {readonly string[]} newLines - Lines to append.
 * @param {string} tooLongMessage - Line to append when truncation is needed.
 * @param {readonly string[]} trailingLines - Lines always appended after the loop (not yet in `lines`), used in the byte check.
 * @returns {boolean} `true` if truncation occurred, `false` otherwise.
 */
export function appendOrTruncate(lines, newLines, tooLongMessage, trailingLines = []) {
  const testContent = [...lines, ...newLines, tooLongMessage, ...trailingLines].join('\r\n');

  if (Buffer.byteLength(testContent, 'utf-8') > GITHUB_BODY_MAX_BYTES - RESERVED_COMMENT_BYTES) {
    lines.push(tooLongMessage);
    return true;
  }

  lines.push(...newLines);
  return false;
}

/**
 * @returns {string} The SHA of the head commit of the current pull request.
 * @throws {Error} If `init()` has not been called.
 */
export function getHeadSha() {
  if (!prData) {
    throw new Error('init() must be called before getHeadSha().');
  }
  return prData.head.sha;
}

/**
 * Posts (or updates) a pull request review with a summary body and an array of inline
 * review comments. Each inline comment may contain a `suggestion` code block, which
 * only renders GitHub's "Apply suggestion" button when posted via the review API
 * (not via `updateComment` / `issues.createComment`).
 *
 * Cleanup: any prior review whose body starts with the marker (derived from
 * `test.fileUrl`) is dismissed, and its individual review comments are deleted.
 * This keeps the PR clean across re-runs.
 *
 * If both `test.body` and `test.comments` are empty, the function only performs cleanup
 * (dismiss prior reviews, delete orphan comments) and skips creating a new review. This
 * is useful for "nothing to remind about" cases where a prior review should be cleared
 * without leaving a stub.
 *
 * @param {object} test - Information about the test script that wants to update the review.
 * @param {URL} test.fileUrl - URL of the test file. Used to derive the marker.
 * @param {string} test.body - The review summary body (shown once, above the inline comments).
 * @param {{path: string, line: number, side?: 'LEFT'|'RIGHT', body: string}[]} test.comments - The inline review comments to attach. Each is anchored to a specific line in a file.
 * @returns {Promise} A promise that is fulfilled once all GitHub operations have completed.
 */
export async function updateReview(test) {
  if (prData.head.repo.full_name !== prData.base.repo.full_name) {
    console.warn(styleText('yellow', 'Warning:'), 'This PR is created from a forked repository, so there is no write permission for the repo.');
    return undefined;
  }

  const oflRootPath = fileURLToPath(new URL('../../', import.meta.url));
  const relativeFilePath = path.relative(oflRootPath, fileURLToPath(test.fileUrl));
  const marker = `<!-- GITHUB-TEST-REVIEW: ${relativeFilePath} -->`;

  // 1) Dismiss any prior reviews from this test.
  // Paginate up to 5 pages of 100 (500 reviews) — more than enough for typical re-runs,
  // and prevents silently missing old reviews on long-lived PRs.
  const reviewPromises = [];
  for (let index = 0; index < 5; index++) {
    reviewPromises.push(
      githubClient.rest.pulls.listReviews({
        owner: repoOwner,
        repo: repoName,
        // eslint-disable-next-line camelcase -- required by GitHub API
        pull_number: process.env.GITHUB_PR_NUMBER,
        // eslint-disable-next-line camelcase -- required by GitHub API
        per_page: 100,
        page: index + 1,
      }),
    );
  }

  const reviewBlocks = await Promise.all(reviewPromises);
  const existingReviews = reviewBlocks.flatMap((block) => block.data);

  const dismissPromises = existingReviews
    .filter((review) => review.body && review.body.startsWith(marker))
    .map((review) => {
      console.log(`Dismissing old review ${review.id} at ${process.env.GITHUB_REPOSITORY}#${process.env.GITHUB_PR_NUMBER}.`);
      return githubClient.rest.pulls.updateReview({
        owner: repoOwner,
        repo: repoName,
        // eslint-disable-next-line camelcase -- required by GitHub API
        pull_number: process.env.GITHUB_PR_NUMBER,
        // eslint-disable-next-line camelcase -- required by GitHub API
        review_id: review.id,
        state: 'DISMISSED',
      });
    });

  // 2) Delete any prior review comments from this test (orphan cleanup).
  // Paginate using prData.review_comments count, mirroring the updateComment pattern.
  const commentPromises = [];
  for (let index = 0; index < prData.review_comments / 100; index++) {
    commentPromises.push(
      githubClient.rest.pulls.listReviewComments({
        owner: repoOwner,
        repo: repoName,
        // eslint-disable-next-line camelcase -- required by GitHub API
        pull_number: process.env.GITHUB_PR_NUMBER,
        // eslint-disable-next-line camelcase -- required by GitHub API
        per_page: 100,
        page: index + 1,
      }),
    );
  }

  const commentBlocks = await Promise.all(commentPromises);
  const existingComments = commentBlocks.flatMap((block) => block.data);

  const deletePromises = existingComments
    .filter((comment) => comment.body && comment.body.startsWith(marker))
    .map((comment) => {
      console.log(`Deleting old review comment ${comment.id} at ${process.env.GITHUB_REPOSITORY}#${process.env.GITHUB_PR_NUMBER}.`);
      return githubClient.rest.pulls.deleteReviewComment({
        owner: repoOwner,
        repo: repoName,
        // eslint-disable-next-line camelcase -- required by GitHub API
        comment_id: comment.id,
      });
    });

  await Promise.all([...dismissPromises, ...deletePromises]);

  // 3) Post the new review, unless the caller only wanted cleanup.
  if (test.body === '' && test.comments.length === 0) {
    console.log(`Skipping review creation at ${process.env.GITHUB_REPOSITORY}#${process.env.GITHUB_PR_NUMBER} (no body, no comments — cleanup-only mode).`);
    return undefined;
  }

  console.log(`Creating review at ${process.env.GITHUB_REPOSITORY}#${process.env.GITHUB_PR_NUMBER} with ${test.comments.length} inline comment(s).`);
  return githubClient.rest.pulls.createReview({
    owner: repoOwner,
    repo: repoName,
    // eslint-disable-next-line camelcase -- required by GitHub API
    pull_number: process.env.GITHUB_PR_NUMBER,
    // eslint-disable-next-line camelcase -- required by GitHub API
    commit_id: getHeadSha(),
    body: `${marker}\n${test.body}`,
    event: 'COMMENT',
    comments: test.comments.map((comment) => ({
      ...comment,
      side: comment.side || 'RIGHT',
    })),
  });
}

/**
 * Fetch the UTF-8 text content of a file at a specific ref.
 * @param {string} filePath - Path of the file relative to the repo root.
 * @param {string} ref - The git ref (branch name, tag, or commit SHA) to fetch from.
 * @returns {Promise<string>} The file content as a UTF-8 string.
 */
export async function getFileContent(filePath, ref) {
  const { data } = await githubClient.rest.repos.getContent({
    owner: repoOwner,
    repo: repoName,
    path: filePath,
    ref,
  });

  if (Array.isArray(data) || data.type !== 'file') {
    throw new Error(`${filePath} at ${ref} is not a regular file.`);
  }

  return Buffer.from(data.content, 'base64').toString('utf-8');
}

/**
 * Fetch the unified diff patch for a file in the PR. Returns null if the patch is not
 * available (e.g., file too large, binary file, or no diff).
 * @param {string} filePath - Path of the file relative to the repo root.
 * @returns {Promise<string|null>} The unified diff patch, or null if not available.
 */
export async function getFilePatch(filePath) {
  // Paginate listFiles to find the file (up to 10 pages × 100 = 1000 files)
  const filePromises = [];
  for (let index = 0; index < 10; index++) {
    filePromises.push(
      githubClient.rest.pulls.listFiles({
        owner: repoOwner,
        repo: repoName,
        // eslint-disable-next-line camelcase -- required by GitHub API
        pull_number: process.env.GITHUB_PR_NUMBER,
        // eslint-disable-next-line camelcase -- required by GitHub API
        per_page: 100,
        page: index + 1,
      }),
    );
  }

  const blocks = await Promise.all(filePromises);
  const files = blocks.flatMap((block) => block.data);
  const file = files.find((f) => f.filename === filePath);
  return file ? file.patch : null;
}
