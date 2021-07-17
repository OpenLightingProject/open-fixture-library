# Environment Variables

We use environment variables for configuration and storing secret credentials. They are set by [the production / test servers](ui.md#deployment) and [CI environments](testing.md) and can also be set locally; the easiest way is to edit the (gitignored) `.env` file in the project's root directory:

```bash
MY_ENV_VARIABLE=hello

# Lines beginning with # are comments
NODE_ENV=production
```

Every script that uses environment variables must import [`lib/load-env-file.js`](../lib/load-env-file.js) as the very first statement.

Please update these docs and [`cli/debug-env-variables.js`](../cli/debug-env-variables.js) after introducing new variables.

## Environment variables used by OFL

| Name                              | Possible values                           | Description                        |
|-----------------------------------|-------------------------------------------|------------------------------------|
|`ALLOW_SEARCH_INDEXING`            | `allowed` or anything else                | If the value is not `allowed`, a `<meta>` tag is added to tell search engines not to index the page. (This is only `allowed` in the [production deployment](ui.md#deployment)) |
|`GITHUB_USER_TOKEN`                | A 40-char [GitHub access token][gh-token] | Used to create pull request when adding fixtures and create/delete comments after running [GitHub tests](testing.md) |
|`GITHUB_BROKEN_LINKS_ISSUE_NUMBER` | A GitHub issue number                     | Used by [tests/external-links.js](../tests/external-links.js) |
|`NODE_ENV`                         | `production` or `development` (default)   | Introduced by Express.js, `production` enables caching, minimizing and more optimizations [improving the performance a lot][node-env-perf]. |
|`PORT`                             | A free port number                        | On which port to start the Nuxt.js server, defaults to `3000`. |
|`HOST`                             | A host name or IP address                 | On which host to start the Nuxt.js server, defaults to `localhost`. |
|`WEBSITE_URL`                      | An absolute URL with a trailing slash.    | The public URL of the website. Defaults to `http://localhost:${PORT}/`. |
|`GITHUB_PR_NUMBER`                 | A GitHub pull request number              | In a pull request, the PR number. |
|`GITHUB_PR_HEAD_REF`               | A git ref                                 | In a pull request, the PR head ref (e.g. `feature-branch`). |
|`GITHUB_PR_BASE_REF`               | A git ref                                 | In a pull request, the PR base ref (e.g. `master`). |
|`GITHUB_REPOSITORY`                |                                           | [Set by GitHub Actions][gh-actions-docs] |
|`GITHUB_RUN_ID`                    |                                           | [Set by GitHub Actions][gh-actions-docs] |
|`GITHUB_REF`                       |                                           | [Set by GitHub Actions][gh-actions-docs] |

[gh-token]: <https://github.com/settings/tokens>
[node-env-perf]: <https://www.dynatrace.com/blog/the-drastic-effects-of-omitting-node_env-in-your-express-js-applications/>
[gh-actions-docs]: <https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables>
