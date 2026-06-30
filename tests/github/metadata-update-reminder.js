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
