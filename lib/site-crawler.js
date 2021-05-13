import childProcess from 'child_process';
import EventEmitter from 'events';
import brokenLinkChecker from 'broken-link-checker';
import { fileURLToPath } from 'url';

import importJson from './import-json.js';

const BASE_URL = `http://localhost:5000/`;

/**
 * @emits passingPage The URL of a passing (internal) page.
 * @emits failingPage The URL of a failing (internal) page and an error string.
 * @emits externalLinkFound The URL of an external link.
 */
export default class SiteCrawler extends EventEmitter {
  /**
   * Starts the production OFL server by creating a new child process.
   * Make sure that 'npm run build' has been called before this function is executed!
   * @returns {Promise} Promise that resolves as soon as the OFL server is up and running, or rejects if the process stops with an error before.
   */
  async startServer() {
    const onServerData = new Promise((resolve, reject) => {
      const serverScriptPath = fileURLToPath(new URL(`../main.js`, import.meta.url));
      this.serverProcess = childProcess.execFile(`node`, [serverScriptPath], {
        env: process.env,
      }, (error, stdout, stderr) => {
        // when server has been stopped

        if (error && !error.killed) {
          reject(error);
          return;
        }

        // save stdout and stderr so that they can be returned by stopServer()
        this.serverStdout = stdout;
        this.serverStderr = stderr;
      });

      // wait until server has started
      this.serverProcess.stdout.on(`data`, output => {
        if (output === `Nuxt.js is ready.\n`) {
          resolve();
        }
      });
    });
    await onServerData;
  }

  /**
   * Crawls the local deployment. Updates about crawled pages are given using events.
   * @returns {Promise} Promise that resolves as soon as the crawling has finished.
   */
  async crawl() {
    const exportPluginKeys = (await importJson(`../plugins/plugins.json`, import.meta.url)).exportPlugins;

    return new Promise((resolve, reject) => {
      const siteChecker = new brokenLinkChecker.SiteChecker({
        excludeExternalLinks: true,
        filterLevel: 3,
        honorRobotExclusions: false,
        maxSocketsPerHost: 10,
        rateLimit: 25,

        excludedKeywords: [
          // form targets are not meant to be called without parameters / with GET instead of POST
          `http://localhost:5000/api/*`,

          // large fixtures shouldn't be tested twice
          `*?loadAllModes`,

          // Exports are excluded as they are no real pages and take too long to load.
          // They are tested by exports-valid script.
          ...exportPluginKeys.map(pluginKey => `${BASE_URL}*.${pluginKey}`),
        ],
      },
      {
        html: (tree, robots, response, pageUrl, customData) => {
          // HTML page successfully retrieved and rendered

          this.emit(`passingPage`, pageUrl);
        },
        junk: (result, customData) => {
          // new link on current HTML page discovered, but skipped

          if (!result.internal && result.url.resolved !== null) {
            this.emit(`externalLinkFound`, result.url.resolved);
          }
        },
        link: (result, customData) => {
          // new link on current HTML page discovered and fetched

          const allowedStatusCodes = [200, 301, 302];
          if (result.http.response !== null && !allowedStatusCodes.includes(result.http.response.statusCode)) {
            this.emit(`failingPage`, result.url.resolved, `${result.http.response.statusCode} ${result.http.response.statusMessage}`);
          }
          else if (result.broken) {
            this.emit(`failingPage`, result.url.resolved, result.brokenReason);
          }
        },
        page: (error, pageUrl, customData) => {
          // all links of current HTML page have been tested
          // this is also called if the first page errored

          if (error) {
            this.emit(`failingPage`, pageUrl, error);
          }
        },
        end: () => {
          resolve();
        },
      });

      siteChecker.enqueue(BASE_URL);
    });
  }

  /**
   * Kills the server process.
   * @returns {Promise.<Object>} Promise that resolves with stdout and stderr as soon as the server process is closed.
   */
  async stopServer() {
    const onServerClosed = new Promise((resolve, reject) => {
      this.serverProcess.on(`close`, resolve);
    });
    this.serverProcess.kill();
    await onServerClosed;

    return { stdout: this.serverStdout, stderr: this.serverStderr };
  }
}
