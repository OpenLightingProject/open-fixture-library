import createIssue from '~~/lib/create-github-issue.js';
import { fixtureFromRepository } from '~~/lib/model.js';

defineRouteMeta({
  openAPI: {
    operationId: 'createFeedbackIssue',
    description: 'Takes the input from the client side script and creates a GitHub issue with the given feedback.',
    tags: ['root'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['fixture', 'capability', 'plugin'] },
              context: { type: 'string', description: 'The fixture key or plugin key.' },
              location: { type: 'string', nullable: true },
              helpWanted: { type: 'string', nullable: true },
              message: { type: 'string' },
              githubUsername: { type: 'string' },
            },
            required: ['type', 'context', 'location', 'helpWanted', 'message', 'githubUsername'],
          },
        },
      },
    },
    responses: {
      '201': {
        description: 'Issue created or error occurred.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                issueUrl: { type: 'string', nullable: true },
                error: { type: 'string', nullable: true },
              },
              required: ['issueUrl', 'error'],
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const {
    type,
    context,
    location,
    helpWanted,
    message,
    githubUsername,
  } = body;

  let title;
  const issueContentData: Record<string, string> = {};
  const labels = ['via-editor'];

  if (type === 'plugin') {
    title = `Feedback for plugin \`${context}\``;
    labels.push('component-plugin');
  }
  else {
    title = `Feedback for fixture \`${context}\``;
    labels.push('component-fixture');

    const [manufacturerKey, fixtureKey] = context.split('/');
    const fixture = await fixtureFromRepository(manufacturerKey, fixtureKey);

    issueContentData.Manufacturer = fixture.manufacturer.name;
    issueContentData.Fixture = `[${fixture.name}](${fixture.url})`;
  }

  issueContentData['Problem location'] = location;
  issueContentData['Problem description'] = helpWanted;
  issueContentData.Message = message;

  const lines = Object.entries(issueContentData).filter(
    ([, value]) => value !== null,
  ).map(([key, value]) => {
    const separator = value.includes('\n') ? '\n' : ' ';
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
    issueUrl = await createIssue(title, lines.join('\n'), labels);
    console.log(`Created issue at ${issueUrl}`);
  }
  catch (createIssueError) {
    error = createIssueError.message;
  }

  setResponseStatus(event, 201);
  return {
    issueUrl,
    error,
  };
});
