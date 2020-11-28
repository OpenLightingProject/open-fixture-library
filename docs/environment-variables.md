# Environment Variables

We use environment variables for configuration and storing secret credentials. They are set by [the production / test servers](ui.md#deployment) and [CI environments](testing.md) and can also be set locally; the easiest way is to edit the (gitignored) `.env` file in the project's root directory:

```bash
MY_ENV_VARIABLE=hello

# Lines beginning with # are comments
NODE_ENV=production
```

Every script that uses environment variables must require [`lib/load-env-file.js`](../lib/load-env-file.js) first (usually placed right after all the other `require` calls). Note that `require(...)` takes a relative path beginning with `./` or `../`.

Please update these docs and [`cli/debug-env-variables.js`](../cli/debug-env-variables.js) after introducing new variables.

## Environment variables used by OFL

| Name                              | Possible values                            | Description                        |
|-----------------------------------|--------------------------------------------|------------------------------------|
|`ALLOW_SEARCH_INDEXING`            | `allowed` or anything else                 | If the value is not `allowed`, a `<meta>` tag is added to tell search engines not to index the page. (This is only `allowed` in the [production deployment](ui.md#deployment)) |
|`GITHUB_USER_TOKEN`                | A 40-digit [GitHub access token][gh-token] | Used to create pull request when adding fixtures and create/delete comments after running [GitHub tests](testing.md) |
|`GITHUB_BROKEN_LINKS_ISSUE_NUMBER` | A GitHub issue number                      | Used by [tests/external-links.js](../tests/external-links.js) |
|`NODE_ENV`                         | `production` or `development` (default)    | Introduced by Express.js, `production` enables caching, minimizing and more optimizations [improving the performance a lot][node-env-perf]. |
|`PORT`                             | A free port number, defaults to `5000`     | On which port to start the server. |
|`GITHUB_PR_NUMBER`                 | A GitHub pull request number               | If set, specifies which in which PR this test is running. |
|`GITHUB_REPOSITORY`                |                                            | [Set by GitHub Actions][gh-actions-docs] |
|`GITHUB_RUN_ID`                    |                                            | [Set by GitHub Actions][gh-actions-docs] |
|`GITHUB_REF`                       |                                            | [Set by GitHub Actions][gh-actions-docs] |

[gh-token]: <https://github.com/settings/tokens>
[node-env-perf]: <https://www.dynatrace.com/blog/the-drastic-effects-of-omitting-node_env-in-your-express-js-applications/>
[gh-actions-docs]: <https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables>
