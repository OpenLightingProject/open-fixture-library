const createPullRequest = require('./create-github-pr.js');

module.exports = function addFixtures(request, response) {
  createPullRequest(request.body.out, (error, pullRequestUrl) => {
    response
      .status(201)
      .type('application/json')
      .send(Buffer.from(
        JSON.stringify({
          pullRequestUrl: pullRequestUrl,
          error: error
        })
      ));
  });
};