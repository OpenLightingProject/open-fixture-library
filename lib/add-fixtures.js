const timers = require('timers');
const path = require('path');
const createPullRequest = require(path.join(__dirname, 'create-github-pr'));

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