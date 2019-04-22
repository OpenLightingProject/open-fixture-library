<template>
  <div>
    <script type="application/ld+json" v-html="websiteStructuredData" />
    <script type="application/ld+json" v-html="organizationStructuredData" />

    <header class="fixture-header">
      <div class="title">
        <h1>Open Fixture Library</h1>
      </div>

      <app-download-button :fixture-count="fixtureCount" :button-style="'home'" />
    </header>


    <h3>Create and browse fixture definitions for lighting equipment online and download them in the right format for your DMX control software!</h3>

    <p><abbr title="Open Fixture Library">OFL</abbr> collects DMX fixture definitions in a JSON format and automatically exports them to the right format for every supported lighting software. Everybody can <a href="https://github.com/OpenLightingProject/open-fixture-library">contribute</a> and help to improve! Thanks!</p>


    <div class="grid-3 centered">

      <section class="card">
        <h2>Recently updated fixtures</h2>

        <ul class="list">
          <li v-for="fixture in lastUpdated" :key="fixture.key">
            <nuxt-link
              :to="`/${fixture.key}`"
              :style="{ borderLeftColor: fixture.color }"
              class="manufacturer-color">

              {{ fixture.name }}
              <div class="hint">
                {{ fixture.action }}
                <time
                  :datetime="fixture.date.toISOString()"
                  :title="fixture.date.toISOString()">
                  {{ fixture.date.toISOString().replace(/T.*?$/, ``) }}
                </time>
              </div>

            </nuxt-link>
          </li>
        </ul>

        <nuxt-link to="/manufacturers" class="card dark blue big-button" title="Browse all fixtures by manufacturer">
          <app-svg name="folder-multiple" />
          <h2>Browse fixtures</h2>
        </nuxt-link>
      </section>

      <section class="card">
        <h2>Recent contributors</h2>

        <ul class="list">
          <li v-for="contributor in recentContributors" :key="contributor.name">
            <nuxt-link :to="`/${contributor.latestFixtureKey}`">
              {{ contributor.name }}
              <div class="hint">
                {{ contributor.number }} fixture{{ contributor.number === 1 ? `` : `s` }}, latest: {{ contributor.latestFixtureName }}
              </div>
            </nuxt-link>
          </li>
        </ul>

        <nuxt-link to="/fixture-editor" class="card dark light-green big-button" title="Become a top contributer yourself!">
          <app-svg name="plus" />
          <h2>Add fixture</h2>
        </nuxt-link>
      </section>

    </div>

    <div class="grid-3 centered">
      <a href="https://github.com/OpenLightingProject/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+-label%3Atype-bug" rel="nofollow" class="card slim">
        <app-svg name="lightbulb-on-outline" class="left" />
        <span>Request feature</span>
      </a>
      <a href="https://github.com/OpenLightingProject/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Atype-bug" rel="nofollow" class="card slim">
        <app-svg name="bug" class="left" />
        <span>Report problem</span>
      </a>
      <a href="https://github.com/OpenLightingProject/open-fixture-library" class="card slim">
        <app-svg name="github-circle" class="left" />
        <span>View source</span>
      </a>
    </div>
  </div>
</template>

<script>
import svg from '~/components/svg.vue';
import downloadButtonVue from '~/components/download-button.vue';

import packageJson from '~~/package.json';
import register from '~~/fixtures/register.json';
import manufacturers from '~~/fixtures/manufacturers.json';

export default {
  components: {
    'app-svg': svg,
    'app-download-button': downloadButtonVue
  },
  data() {
    return {
      lastUpdated: register.lastUpdated.slice(0, 5).map(
        fixtureKey => ({
          key: fixtureKey,
          name: getFixtureName(fixtureKey),
          action: register.filesystem[fixtureKey].lastAction,
          date: new Date(register.filesystem[fixtureKey].lastActionDate),
          color: register.colors[fixtureKey.split(`/`)[0]]
        })
      ),
      recentContributors: Object.keys(register.contributors).slice(0, 5).map(
        contributor => {
          const latestFixtureKey = getLatestFixtureKey(contributor);

          return {
            name: contributor,
            number: register.contributors[contributor].fixtures.length,
            latestFixtureKey: latestFixtureKey,
            latestFixtureName: getFixtureName(latestFixtureKey)
          };
        }
      ),
      fixtureCount: Object.keys(register.filesystem).filter(
        fixKey => !(`redirectTo` in register.filesystem[fixKey]) || register.filesystem[fixKey].reason === `SameAsDifferentBrand`
      ).length,

      websiteStructuredData: {
        '@context': `http://schema.org`,
        '@type': `WebSite`,
        'name': `Open Fixture Library`,
        'url': packageJson.homepage,
        'potentialAction': {
          '@type': `SearchAction`,
          'target': `${packageJson.homepage}search?q={search_term_string}`,
          'query-input': `required name=search_term_string`
        }
      },
      organizationStructuredData: {
        '@context': `http://schema.org`,
        '@type': `Organization`,
        'name': `Open Fixture Library`,
        'description': `Create and browse fixture definitions for lighting equipment online and download them in the right format for your DMX control software!`,
        'url': packageJson.homepage,
        'logo': `${packageJson.homepage}ofl-logo.svg`
      }
    };
  }
};

/**
 * @param {string} fixtureKey The combined manufacturer / fixture key.
 * @returns {string} The manufacturer and fixture names, separated by a space.
 */
function getFixtureName(fixtureKey) {
  const manKey = fixtureKey.split(`/`)[0];
  const manufacturerName = manufacturers[manKey].name;
  const fixtureName = register.filesystem[fixtureKey].name;

  return `${manufacturerName} ${fixtureName}`;
}

/**
 * @param {string} contributor The contributor name.
 * @returns {string} The combined key of the latest fixture contributed to by this contributor.
 */
function getLatestFixtureKey(contributor) {
  return register.lastUpdated.find(
    key => register.contributors[contributor].fixtures.includes(key)
  );
}
</script>
