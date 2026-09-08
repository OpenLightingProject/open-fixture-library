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

  const modifiedComments = await collectFixtureReviewComments(
    modifiedFixtures,
    headSha,
    today,
    ['lastModifyDate'],
    true,
  );
  const addedComments = await collectFixtureReviewComments(
    addedFixtures,
    headSha,
    today,
    ['createDate', 'lastModifyDate'],
  );

  const reviewComments = [...modifiedComments, ...addedComments];
  const inlineReviewComments = reviewComments.filter((comment) => comment.isIncludedInDiffHunk);
  const bodyOnlyComments = reviewComments.filter((comment) => !comment.isIncludedInDiffHunk);

  if (bodyOnlyComments.length === 0 && inlineReviewComments.length === 0) {
    // Remove the previous review
    await pullRequest.updateReview({
      fileUrl: new URL(import.meta.url),
      body: '',
      comments: [],
    });
    process.exit(0);
  }

  // Build the brief review summary body.
  let summaryBody = 'Some fixture metadata needs updating — see the review comments below for one-click suggestions.';
  if (bodyOnlyComments.length > 0) {
    summaryBody += `\n\n${buildBodyOnlySummary(bodyOnlyComments)}`;
  }

  await pullRequest.updateReview({
    fileUrl: new URL(import.meta.url),
    body: summaryBody,
    comments: inlineReviewComments,
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
 * Sort fixtures and build their date update comments.
 * @param {[string, string][]} fixtures - Fixtures to check.
 * @param {string} headSha - The PR head commit SHA used to fetch file content.
 * @param {string} today - Today's date as an ISO `YYYY-MM-DD` string.
 * @param {string[]} fields - The fixture metadata date fields to update.
 * @param {boolean} [requiresDiffHunk=false] - Whether suggestions must be inside a diff hunk.
 * @returns {Promise<ReviewComment[]>} Date update comments for all fixtures.
 */
async function collectFixtureReviewComments(fixtures, headSha, today, fields, requiresDiffHunk = false) {
  const fixtureResults = await Promise.all(sortByManufacturerAndFixture(fixtures).map(
    ([manufacturerKey, fixtureKey]) => buildFixtureReviewComments(
      manufacturerKey,
      fixtureKey,
      headSha,
      today,
      fields,
      requiresDiffHunk,
    ),
  ));
  return fixtureResults.flat();
}

/**
 * Build date-field update review comments for a fixture. Modified fixtures can fall back to a
 * comments are marked as not included in a diff hunk when their date line is outside one.
 * @param {string} manufacturerKey - The manufacturer key.
 * @param {string} fixtureKey - The fixture key.
 * @param {string} headSha - The PR head commit SHA used to fetch the file content.
 * @param {string} today - Today's date as an ISO `YYYY-MM-DD` string.
 * @param {string[]} fields - The fixture metadata date fields to update.
 * @param {boolean} [isModifiedFile=false] - Whether the fixture file existed in the target branch before this PR.
 * @returns {Promise<ReviewComment[]>} Date update comments.
 */
async function buildFixtureReviewComments(manufacturerKey, fixtureKey, headSha, today, fields, isModifiedFile = false) {
  const filePath = `fixtures/${manufacturerKey}/${fixtureKey}.json`;

  let fileContent;
  try {
    fileContent = await pullRequest.getFileContent(filePath, headSha);
  }
  catch (error) {
    console.warn(styleText('yellow', 'Warning:'), `Could not fetch ${filePath} at ${headSha}:`, error.message);
    return [];
  }

  const fileLines = fileContent.split('\n');
  return Promise.all(fields.flatMap(async (field) => {
    const lineIndex = fileLines.findIndex((line) => line.includes(`"${field}"`));
    if (lineIndex === -1) {
      console.warn(styleText('yellow', 'Warning:'), `No "${field}" line found in ${filePath}; skipping review comment.`);
      return [];
    }

    const oldLine = fileLines[lineIndex];
    const currentDateMatch = new RegExp(String.raw`"${field}"\s*:\s*"([^"]*)"`).exec(oldLine);
    if (currentDateMatch && currentDateMatch[1] === today) {
      console.warn(styleText('yellow', 'Warning:'), `"${field}" is already today in ${filePath}; skipping review comment.`);
      return [];
    }

    let isIncludedInDiffHunk = true;
    const lineNumber = lineIndex + 1; // 1-indexed for the GitHub API
    if (isModifiedFile) {
      // GitHub rejects suggestions outside diff hunks.
      const patch = await pullRequest.getFilePatch(filePath);
      isIncludedInDiffHunk = patch === undefined || isLineInDiffHunk(patch, lineNumber);
    }

    const updatedLine = oldLine.replace(
      new RegExp(String.raw`"${field}"\s*:\s*"[^"]*"`),
      () => `"${field}": "${today}"`,
    );

    const body = [
      `Update \`meta.${field}\` to today.`,
      '',
      '```suggestion',
      updatedLine,
      '```',
    ].join('\n');

    return [{
      path: filePath,
      line: lineNumber,
      side: 'RIGHT',
      body,
      isIncludedInDiffHunk,
    }];
  }));
}

/**
 * Build the review-body section listing modified fixtures whose `lastModifyDate`
 * line is outside any diff hunk (so no inline suggestion is possible).
 * @param {ReviewComment[]} comments - Comments that cannot be posted inline.
 * @returns {string} The markdown block.
 */
function buildBodyOnlySummary(comments) {
  const lines = [
    '**Modified fixtures** (suggestion not possible — update `lastModifyDate` manually):',
    ...comments.map((comment) => `- \`${comment.path.replaceAll(/^fixtures\/|\.json$/g, '')}\``),
  ];
  return lines.join('\n');
}
