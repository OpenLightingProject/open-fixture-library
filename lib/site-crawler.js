const EventEmitter = require(`events`);
const { SiteChecker } = require(`broken-link-checker`);

const exportPluginKeys = require(`../plugins/plugins.json`).exportPlugins;

const BASE_URL = `http://localhost:5000/`;

/**
 * @emits passingPage The URL of a passing (internal) page.
 * @emits failingPage The URL of a failing (internal) page and an error string.
 * @emits externalLinkFound The URL of an external link.
 */
class SiteCrawler extends EventEmitter {
  /**
   * Crawls the local deployment. Updates about crawled pages are given using events.
   * @returns {Promise} Promise that resolves as soon as the crawling has finished.
   */
  run() {
    return new Promise((resolve, reject) => {
      const siteChecker = new SiteChecker({
        excludeExternalLinks: true,
        filterLevel: 3,
        honorRobotExclusions: false,
        maxSocketsPerHost: 10,
        rateLimit: 25,

        excludedKeywords: [
          // form targets are not meant to be called without parameters / with GET instead of POST
          `http://localhost:5000/ajax/*`,

          // large fixtures shouldn't be tested twice
          `*?loadAllModes`,

          ...exportPluginKeys.map(pluginKey => `${BASE_URL}*.${pluginKey}`)
        ]
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
        }
      });

      siteChecker.enqueue(BASE_URL);
    });
  }
}

module.exports = SiteCrawler;
