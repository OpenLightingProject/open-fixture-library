const createIssue = require(`../../../lib/create-github-issue.js`);
const { fixtureFromRepository } = require(`../../../lib/model.js`);

/** @typedef {import('openapi-backend').Context} OpenApiBackendContext */

/**
 * Takes the input from the client side script and creates an issue with the given feedback.
 * @param {OpenApiBackendContext} ctx Passed from OpenAPI Backend.
 * @param {Object} request Passed from Express.
 * @param {Object} response Passed from Express.
 */
async function createFeedbackIssue(ctx, request, response) {
  const {
    type,
    context,
    location,
    helpWanted,
    message,
    githubUsername,
  } = request.body;

  let title;
  const issueContentData = {};
  const labels = [`via-editor`];

  if (type === `plugin`) {
    title = `Feedback for plugin '${context}'`;
    labels.push(`component-plugin`);
  }
  else {
    title = `Feedback for fixture '${context}'`;
    labels.push(`component-fixture`);

    const [manKey, fixKey] = context.split(`/`);
    const fixture = fixtureFromRepository(manKey, fixKey);

    issueContentData.Manufacturer = fixture.manufacturer.name;
    issueContentData.Fixture = fixture.name;
  }

  issueContentData[`Problem location`] = location;
  issueContentData[`Problem description`] = helpWanted;
  issueContentData.Message = message;

  const lines = Object.entries(issueContentData).filter(
    ([key, value]) => value !== null,
  ).map(
    ([key, value]) => `**${key}**:${value.includes(`\n`) ? `\n` : ` `}${value}`,
  );

  if (githubUsername) {
    const isValidUsername = /^[a-zA-Z0-9]+$/.test(githubUsername);
    lines.push(`\nThank you ${isValidUsername ? `@${githubUsername}` : `**${githubUsername}**`}!`);
  }

  let issueUrl;
  let error;
  try {
    issueUrl = await createIssue(title, lines.join(`\n`), labels);
    console.log(`Created issue at ${issueUrl}`);
  }
  catch (e) {
    error = e.message;
  }

  response.status(201).json({
    issueUrl,
    error,
  });
}

module.exports = { createFeedbackIssue };
