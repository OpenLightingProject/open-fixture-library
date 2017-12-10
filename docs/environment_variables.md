# Environment Variables

We use environment variables for configuration and storing secret credentials. The easiest way to set them is editing the (gitignored) [`.env`](../.env) file:

```
MY_ENV_VARIABLE=hello

# This is a comment
NODE_ENV=production
```

Every script that uses environment variables must require [`lib/load-env-file.js`](../lib/load-env-file.js) first (usually placed right after all the other requires). Note that `require(...)` takes a relative path to the module beginning with `./` or `../`.

## Environment variables used by OFL

Name                    | Possible values | Explanation
|--                     |--               |--
`ALLOW_SEARCH_INDEXING` | `allowed` or anything else | If it's not allowed, a meta tag is added to the website that tells search engines not to index the page. (On Heroku, this is `allowed` in master but not in pull request deployments)
`GITHUB_USER_TOKEN`     | A 40-digit [GitHub access token](https://github.com/settings/tokens) | Used to create pull request when adding fixtures and create/delete comments after running [GitHub tests](testing.md)
`NODE_ENV`              | `production` or `development` (default) | Introduced by Express.js, `production` enables caching, minimizing and more optimizations [improving the performance a lot](https://www.dynatrace.com/blog/the-drastic-effects-of-omitting-node_env-in-your-express-js-applications/).
`PORT`                  | a free port number, defaults to `5000` | On which port to start the server.
`TRAVIS_BRANCH`         |  | [Set by Travis](https://docs.travis-ci.com/user/environment-variables/#Default-Environment-Variables)
`TRAVIS_COMMIT`         |  | [Set by Travis](https://docs.travis-ci.com/user/environment-variables/#Default-Environment-Variables)
`TRAVIS_EVENT_TYPE`     |  | [Set by Travis](https://docs.travis-ci.com/user/environment-variables/#Default-Environment-Variables)
`TRAVIS_PULL_REQUEST`   |  | [Set by Travis](https://docs.travis-ci.com/user/environment-variables/#Default-Environment-Variables)
`TRAVIS_REPO_SLUG`      |  | [Set by Travis](https://docs.travis-ci.com/user/environment-variables/#Default-Environment-Variables)