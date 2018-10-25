const createIssue = require(`../../lib/create-github-issue.js`);
const { fixtureFromRepository } = require(`../../lib/model.js`);

const GITHUB_LABELS = [`component-fixture`, `via-editor`];

/**
 * Takes the input from the client side script and creates an issue with the given feedback.
 * @param {object} request Passed from Express.
 * @param {object} response Passed from Express.
 */
module.exports = async function createFeedbackIssue(request, response) {
  const {
    manKey,
    fixKey,
    location,
    helpWanted,
    message,
    githubUsername
  } = request.body;

  const title = `Feedback for fixture '${manKey}/${fixKey}'`;

  const fixture = fixtureFromRepository(manKey, fixKey);

  const issueContentData = {
    'Manufacturer': fixture.manufacturer.name,
    'Fixture': fixture.name,
    'Problem location': location,
    'Problem description': helpWanted,
    'Message': message
  };

  const lines = Object.entries(issueContentData).filter(
    ([key, value]) => value !== null
  ).map(
    ([key, value]) => `**${key}**:${value.includes(`\n`) ? `\n` : ` `}${value}`
  );

  if (githubUsername) {
    const isValidUsername = /^[a-zA-Z0-9]+$/.test(githubUsername);
    lines.push(`\nThank you ${isValidUsername ? `@${githubUsername}` : `**${githubUsername}**`}!`);
  }

  let issueUrl;
  let error;
  try {
    issueUrl = await createIssue(title, lines.join(`\n`), GITHUB_LABELS);
    console.log(`Created issue at ${issueUrl}`);
  }
  catch (e) {
    error = e.message;
  }

  response.status(201).json({
    issueUrl,
    error
  });
};
