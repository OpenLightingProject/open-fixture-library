import createPullRequest from '~~/lib/create-github-pr.js';

defineRouteMeta({
  openAPI: {
    operationId: 'submitFixtures',
    description: 'Creates a GitHub pull request with the given fixture data.',
    tags: ['fixtures'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              fixtureCreateResult: { type: 'object' },
              githubUsername: { type: 'string', nullable: true },
              githubComment: { type: 'string', nullable: true },
            },
            required: ['fixtureCreateResult', 'githubUsername', 'githubComment'],
          },
        },
      },
    },
    responses: {
      '201': {
        description: 'OK',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                pullRequestUrl: { type: 'string' },
              },
              required: ['pullRequestUrl'],
            },
          },
        },
      },
      '400': {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { error: { type: 'string' } },
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  try {
    const pullRequestUrl = await createPullRequest(
      body.fixtureCreateResult,
      body.githubUsername,
      body.githubComment,
    );

    setResponseStatus(event, 201);
    return { pullRequestUrl };
  }
  catch (error) {
    setResponseStatus(event, 500);
    return { error: `${error.toString()}\n${error.stack}` };
  }
});
