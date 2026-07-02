#!/usr/bin/env node

import '../../lib/load-env-file.js';

import { styleText } from 'util';
import * as pullRequest from './pull-request.js';

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

  const today = new Date().toISOString().slice(0, 10);

  // Build the inline review comments (one per modified fixture).
  const reviewComments = [];

  const sortedModified = modifiedFixtures.toSorted(([manufacturerA, fixtureA], [manufacturerB, fixtureB]) => {
    const manufacturerCompare = manufacturerA.localeCompare(manufacturerB);
    if (manufacturerCompare !== 0) {
      return manufacturerCompare;
    }
    return fixtureA.localeCompare(fixtureB);
  });

  for (const [manufacturerKey, fixtureKey] of sortedModified) {
    const filePath = `fixtures/${manufacturerKey}/${fixtureKey}.json`;

    let fileContent;
    try {
      fileContent = await pullRequest.getFileContent(filePath, headSha);
    }
    catch (error) {
      console.warn(styleText('yellow', 'Warning:'), `Could not fetch ${filePath} at ${headSha}:`, error.message);
      continue;
    }

    const fileLines = fileContent.split('\n');
    const lineIndex = fileLines.findIndex((line) => line.includes('"lastModifyDate"'));
    if (lineIndex === -1) {
      console.warn(styleText('yellow', 'Warning:'), `No "lastModifyDate" line found in ${filePath}; skipping review comment.`);
      continue;
    }

    const lineNumber = lineIndex + 1; // 1-indexed for the GitHub API
    const oldLine = fileLines[lineIndex];

    // Check that the line is in a diff hunk (otherwise GitHub will reject the comment)
    const patch = await pullRequest.getFilePatch(filePath);
    if (patch !== null) {
      const inHunk = isLineInDiffHunk(patch, lineNumber);
      if (!inHunk) {
        console.warn(styleText('yellow', 'Warning:'), `lastModifyDate line ${lineNumber} is not in a diff hunk in ${filePath}; skipping.`);
        continue;
      }
    }
    const updatedLine = oldLine.replace(/"lastModifyDate"\s*:\s*"[^"]*"/, `"lastModifyDate": "${today}"`);

    const commentBody = [
      'Update `meta.lastModifyDate` to today.',
      '',
      '```suggestion',
      updatedLine,
      '```',
    ].join('\n');

    reviewComments.push({
      path: filePath,
      line: lineNumber,
      side: 'RIGHT',
      body: commentBody,
    });
  }

  // Build the brief review summary body.
  let summaryBody = 'Some fixture metadata needs updating — see the review comments below for one-click suggestions.';

  if (addedFixtures.length > 0) {
    const sortedAdded = addedFixtures.toSorted(([manufacturerA, fixtureA], [manufacturerB, fixtureB]) => {
      const manufacturerCompare = manufacturerA.localeCompare(manufacturerB);
      if (manufacturerCompare !== 0) {
        return manufacturerCompare;
      }
      return fixtureA.localeCompare(fixtureB);
    });

    summaryBody += '\n\n**Added fixtures** (no suggestion possible — set `createDate`, `lastModifyDate`, and `authors` manually):\n';
    for (const [manufacturerKey, fixtureKey] of sortedAdded) {
      summaryBody += `- \`${manufacturerKey}/${fixtureKey}\`\n`;
    }
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
