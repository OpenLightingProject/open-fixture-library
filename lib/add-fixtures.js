const path = require('path');
const createPullRequest = require('./create-github-prjs');

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