# Environment Variables

We use environment variables for configuration and storing secret credentials. They are set by [Heroku](ui.md) and [Travis](tests.md) and can also be set locally; the easiest way is to edit the (gitignored) `.env` file in the project's root directory:

```bash
MY_ENV_VARIABLE=hello

# Lines beginning with # are comments
NODE_ENV=production
```

Every script that uses environment variables must require [`lib/load-env-file.js`](../lib/load-env-file.js) first (usually placed right after all the other `require` calls). Note that `require(...)` takes a relative path beginning with `./` or `../`.

Please update these docs and [`cli/debug-env-variables.js`](../cli/debug-env-variables.js) after introducing new variables.

## Environment variables used by OFL

| Name                  | Possible values                            | Description                        |
|-----------------------|--------------------------------------------|------------------------------------|
|`ALLOW_SEARCH_INDEXING`| `allowed` or anything else                 | If the value is not `allowed`, a `<meta>` tag is added to tell search engines not to index the page. (On [Heroku](ui.md), this is `allowed` in master but not in pull request deployments) |
|`GITHUB_USER_TOKEN`    | A 40-digit [GitHub access token][gh-token] | Used to create pull request when adding fixtures and create/delete comments after running [GitHub tests](testing.md) |
|`FORCE_HTTPS`          | `force` or anything else                   | If the value is `force`, always redirect to HTTPS. | 
|`NODE_ENV`             | `production` or `development` (default)    | Introduced by Express.js, `production` enables caching, minimizing and more optimizations [improving the performance a lot][node-env-perf]. |
|`PORT`                 | A free port number, defaults to `5000`     | On which port to start the server. |
|`TRAVIS_BRANCH`        |                                            | [Set by Travis][travis-docs]       |
|`TRAVIS_COMMIT`        |                                            | [Set by Travis][travis-docs]       |
|`TRAVIS_EVENT_TYPE`    |                                            | [Set by Travis][travis-docs]       |
|`TRAVIS_PULL_REQUEST`  |                                            | [Set by Travis][travis-docs]       |
|`TRAVIS_REPO_SLUG`     |                                            | [Set by Travis][travis-docs]       |

[gh-token]: <https://github.com/settings/tokens>
[node-env-perf]: <https://www.dynatrace.com/blog/the-drastic-effects-of-omitting-node_env-in-your-express-js-applications/>
[travis-docs]: <https://docs.travis-ci.com/user/environment-variables/#Default-Environment-Variables>
