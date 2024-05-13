import createIssue from '../../../lib/create-github-issue.js';
import { fixtureFromRepository } from '../../../lib/model.js';

/** @typedef {import('openapi-backend').Context} OpenApiBackendContext */
/** @typedef {import('../index.js').ApiResponse} ApiResponse */

/**
 * Takes the input from the client side script and creates an issue with the given feedback.
 * @param {OpenApiBackendContext} ctx Passed from OpenAPI Backend.
 * @returns {ApiResponse} The handled response.
 */
export async function createFeedbackIssue({ request }) {
  const {
    type,
    context,
    location,
    helpWanted,
    message,
    githubUsername,
  } = request.requestBody;

  let title;
  const issueContentData = {};
  const labels = [`via-editor`];

  if (type === `plugin`) {
    title = `Feedback for plugin \`${context}\``;
    labels.push(`component-plugin`);
  }
  else {
    title = `Feedback for fixture \`${context}\``;
    labels.push(`component-fixture`);

    const [manufacturerKey, fixtureKey] = context.split(`/`);
    const fixture = await fixtureFromRepository(manufacturerKey, fixtureKey);

    issueContentData.Manufacturer = fixture.manufacturer.name;
    issueContentData.Fixture = `[${fixture.name}](${fixture.url})`;
  }

  issueContentData[`Problem location`] = location;
  issueContentData[`Problem description`] = helpWanted;
  issueContentData.Message = message;

  const lines = Object.entries(issueContentData).filter(
    ([key, value]) => value !== null,
  ).map(([key, value]) => {
    const separator = value.includes(`\n`) ? `\n` : ` `;
    return `**${key}**:${separator}${value}`;
  });

  if (githubUsername) {
    const isValidUsername = /^[\dA-Za-z]+$/.test(githubUsername);
    const githubUsernameMarkdown = isValidUsername ? `@${githubUsername}` : `**${githubUsername}**`;
    lines.push(`\nThank you ${githubUsernameMarkdown}!`);
  }

  let issueUrl;
  let error;
  try {
    issueUrl = await createIssue(title, lines.join(`\n`), labels);
    console.log(`Created issue at ${issueUrl}`);
  }
  catch (createIssueError) {
    error = createIssueError.message;
  }

  return {
    statusCode: 201,
    body: {
      issueUrl,
      error,
    },
  };
}
