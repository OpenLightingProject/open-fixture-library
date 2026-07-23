#!/usr/bin/env node

import '../../lib/load-env-file.js';

import { styleText } from 'util';
import * as pullRequest from './pull-request.js';

/** @import { ReviewComment } from './pull-request.js' */

try {
  await pullRequest.checkEnv();
  await pullRequest.init();
  const changedComponents = await pullRequest.fetchChangedComponents();
  const headSha = pullRequest.getHeadSha();

  const addedFixtures = changedComponents.added.fixtures;
  const modifiedFixtures = changedComponents.modified.fixtures;

  if (addedFixtures.length === 0 && modifiedFixtures.length === 0) {
    // Nothing to remind about; clear any prior review and exit.
    await pullRequest.updateReview({
      fileUrl: new URL(import.meta.url),
      body: '',
      comments: [],
    });
    process.exit(0);
  }

  const today = new Date().toISOString().replace(/T.*/, '');

  // Build the inline review comments (one per modified fixture).
  const reviewComments = [];

  const sortedModified = sortByManufacturerAndFixture(modifiedFixtures);

  for (const [manufacturerKey, fixtureKey] of sortedModified) {
    const comment = await buildModifiedFixtureComment(manufacturerKey, fixtureKey, headSha, today);
    if (comment !== null) {
      reviewComments.push(comment);
    }
  }

  // Build the brief review summary body.
  let summaryBody = 'Some fixture metadata needs updating — see the review comments below for one-click suggestions.';
  const addedFixturesSummary = buildAddedFixturesSummary(addedFixtures);
  if (addedFixturesSummary !== '') {
    summaryBody += `\n\n${addedFixturesSummary}`;
  }

  await pullRequest.updateReview({
    fileUrl: new URL(import.meta.url),
    body: summaryBody,
    comments: reviewComments,
  });
}
catch (error) {
  console.error(error);
  process.exit(1);
}

/**
 * Check if a line number in the new file is within any diff hunk.
 * @param {string} patch - The unified diff patch.
 * @param {number} lineNumber - The 1-indexed line number in the new file.
 * @returns {boolean} True if the line is within a hunk.
 */
function isLineInDiffHunk(patch, lineNumber) {
  const hunkHeaderRegex = /^@@\s+-\d+(?:,\d+)?\s+\+(\d+)(?:,(\d+))?\s+@@/gm;
  let match = hunkHeaderRegex.exec(patch);
  while (match !== null) {
    const start = Number.parseInt(match[1], 10);
    const count = match[2] ? Number.parseInt(match[2], 10) : 1;
    const end = start + count - 1;
    if (lineNumber >= start && lineNumber <= end) {
      return true;
    }
    match = hunkHeaderRegex.exec(patch);
  }
  return false;
}

/**
 * Sort an array of `[manufacturerKey, fixtureKey]` tuples by manufacturer then fixture.
 * @param {[string, string][]} fixtures - Fixtures to sort. Not mutated.
 * @returns {[string, string][]} A new sorted array.
 */
function sortByManufacturerAndFixture(fixtures) {
  return fixtures.toSorted(([manufacturerA, fixtureA], [manufacturerB, fixtureB]) => {
    const manufacturerCompare = manufacturerA.localeCompare(manufacturerB);
    if (manufacturerCompare !== 0) {
      return manufacturerCompare;
    }
    return fixtureA.localeCompare(fixtureB);
  });
}

/**
 * Build the inline review comment that suggests updating `lastModifyDate` for one
 * modified fixture. Returns `null` if the suggestion cannot be produced (e.g. the
 * file is missing at the head SHA, has no `lastModifyDate` line, or that line is
 * not inside a diff hunk); a warning is logged in each of those cases.
 * @param {string} manufacturerKey - The manufacturer key.
 * @param {string} fixtureKey - The fixture key.
 * @param {string} headSha - The PR head commit SHA used to fetch the file content.
 * @param {string} today - The replacement date as an ISO `YYYY-MM-DD` string.
 * @returns {Promise<ReviewComment | null>} The review comment, or `null` if skipped.
 */
async function buildModifiedFixtureComment(manufacturerKey, fixtureKey, headSha, today) {
  const filePath = `fixtures/${manufacturerKey}/${fixtureKey}.json`;

  let fileContent;
  try {
    fileContent = await pullRequest.getFileContent(filePath, headSha);
  }
  catch (error) {
    console.warn(styleText('yellow', 'Warning:'), `Could not fetch ${filePath} at ${headSha}:`, error.message);
    return null;
  }

  const fileLines = fileContent.split('\n');
  const lineIndex = fileLines.findIndex((line) => line.includes('"lastModifyDate"'));
  if (lineIndex === -1) {
    console.warn(styleText('yellow', 'Warning:'), `No "lastModifyDate" line found in ${filePath}; skipping review comment.`);
    return null;
  }

  const lineNumber = lineIndex + 1; // 1-indexed for the GitHub API
  const oldLine = fileLines[lineIndex];

  // Check that the line is in a diff hunk (otherwise GitHub will reject the comment)
  const patch = await pullRequest.getFilePatch(filePath);
  if (patch !== undefined) {
    const inHunk = isLineInDiffHunk(patch, lineNumber);
    if (!inHunk) {
      console.warn(styleText('yellow', 'Warning:'), `lastModifyDate line ${lineNumber} is not in a diff hunk in ${filePath}; skipping.`);
      return null;
    }
  }
  const updatedLine = oldLine.replace(/"lastModifyDate"\s*:\s*"[^"]*"/, () => `"lastModifyDate": "${today}"`);

  const body = [
    'Update `meta.lastModifyDate` to today.',
    '',
    '```suggestion',
    updatedLine,
    '```',
  ].join('\n');

  return {
    path: filePath,
    line: lineNumber,
    side: 'RIGHT',
    body,
  };
}

/**
 * Build the "Added fixtures" section of the review summary. Added fixtures have
 * no existing `lastModifyDate` line to anchor an inline suggestion to, so they
 * are listed manually.
 * @param {[string, string][]} addedFixtures - Added fixtures as `[manufacturerKey, fixtureKey]` tuples.
 * @returns {string} The markdown block, or `''` if there are no added fixtures.
 */
function buildAddedFixturesSummary(addedFixtures) {
  if (addedFixtures.length === 0) {
    return '';
  }

  const sortedAdded = sortByManufacturerAndFixture(addedFixtures);

  const lines = [
    '**Added fixtures** (no suggestion possible — set `createDate`, `lastModifyDate`, and `authors` manually):',
    ...sortedAdded.map(([manufacturerKey, fixtureKey]) => `- \`${manufacturerKey}/${fixtureKey}\``),
  ];
  return lines.join('\n');
}
