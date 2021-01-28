<template>
  <div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <script type="application/ld+json" v-html="websiteStructuredData" />

    <!-- eslint-disable-next-line vue/no-v-html -->
    <script type="application/ld+json" v-html="organizationStructuredData" />

    <header class="fixture-header">
      <div class="title">
        <h1>Open Fixture Library</h1>
      </div>

      <DownloadButton :fixture-count="fixtureCount" button-style="home" />
    </header>


    <h3>Create and browse fixture definitions for lighting equipment online and download them in the right format for your DMX control software!</h3>

    <p><abbr title="Open Fixture Library">OFL</abbr> collects DMX fixture definitions in a JSON format and automatically exports them to the right format for every <NuxtLink to="/about/plugins">supported lighting software</NuxtLink>. Everybody can <a href="https://github.com/OpenLightingProject/open-fixture-library">contribute</a> and help to improve! Thanks!</p>


    <div class="grid-3 centered">

      <section class="card">
        <h2>Recently updated fixtures</h2>

        <ul class="list">
          <li v-for="fixture of lastUpdated" :key="fixture.key">
            <NuxtLink
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

            </NuxtLink>
          </li>
        </ul>

        <NuxtLink to="/manufacturers" class="card dark blue big-button" title="Browse all fixtures by manufacturer">
          <OflSvg name="folder-multiple" />
          <h2>Browse fixtures</h2>
        </NuxtLink>
      </section>

      <section class="card">
        <h2>Recent contributors</h2>

        <ul class="list">
          <li v-for="contributor of recentContributors" :key="contributor.name">
            <NuxtLink :to="`/${contributor.latestFixtureKey}`">
              {{ contributor.name }}
              <div class="hint">
                {{ contributor.number }} fixture{{ contributor.number === 1 ? `` : `s` }}, latest: {{ contributor.latestFixtureName }}
              </div>
            </NuxtLink>
          </li>
        </ul>

        <NuxtLink to="/fixture-editor" class="card dark light-green big-button" title="Become a top contributer yourself!">
          <OflSvg name="plus" />
          <h2>Add fixture</h2>
        </NuxtLink>
      </section>

    </div>

    <div class="grid-3 centered">
      <a href="https://github.com/OpenLightingProject/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+-label%3Abug" rel="nofollow" class="card slim">
        <OflSvg name="lightbulb-on-outline" class="left" />
        <span>Request feature</span>
      </a>
      <a href="https://github.com/OpenLightingProject/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Abug" rel="nofollow" class="card slim">
        <OflSvg name="bug" class="left" />
        <span>Report problem</span>
      </a>
      <a href="https://github.com/OpenLightingProject/open-fixture-library" class="card slim">
        <OflSvg name="github-circle" class="left" />
        <span>View source</span>
      </a>
    </div>
  </div>
</template>

<script>
import register from '../../fixtures/register.json';

import DownloadButton from '../components/DownloadButton.vue';

export default {
  components: {
    DownloadButton,
  },
  async asyncData({ $axios, error }) {
    try {
      const manufacturers = await $axios.$get(`/api/v1/manufacturers`);

      return {
        manufacturers,
      };
    }
    catch (requestError) {
      return error(requestError);
    }
  },
  data() {
    return {
      lastUpdated: [],
      recentContributors: [],

      fixtureCount: Object.keys(register.filesystem).filter(
        fixtureKey => !(`redirectTo` in register.filesystem[fixtureKey]) || register.filesystem[fixtureKey].reason === `SameAsDifferentBrand`,
      ).length,

      websiteStructuredData: {
        '@context': `http://schema.org`,
        '@type': `WebSite`,
        'name': `Open Fixture Library`,
        'url': this.$config.websiteUrl,
        'potentialAction': {
          '@type': `SearchAction`,
          'target': `${this.$config.websiteUrl}search?q={search_term_string}`,
          'query-input': `required name=search_term_string`,
        },
      },
      organizationStructuredData: {
        '@context': `http://schema.org`,
        '@type': `Organization`,
        'name': `Open Fixture Library`,
        'description': `Create and browse fixture definitions for lighting equipment online and download them in the right format for your DMX control software!`,
        'url': this.$config.websiteUrl,
        'logo': `${this.$config.websiteUrl}ofl-logo.svg`,
      },
    };
  },
  created() {
    this.lastUpdated = register.lastUpdated.slice(0, 5).map(
      fixtureKey => ({
        key: fixtureKey,
        name: this.getFixtureName(fixtureKey),
        action: register.filesystem[fixtureKey].lastAction,
        date: new Date(register.filesystem[fixtureKey].lastActionDate),
        color: register.colors[fixtureKey.split(`/`)[0]],
      }),
    );

    this.recentContributors = Object.keys(register.contributors).slice(0, 5).map(
      contributor => {
        const latestFixtureKey = getLatestFixtureKey(contributor);

        return {
          name: contributor,
          number: register.contributors[contributor].fixtures.length,
          latestFixtureKey,
          latestFixtureName: this.getFixtureName(latestFixtureKey),
        };
      },
    );
  },
  methods: {
    /**
     * @param {String} fixtureKey The combined manufacturer / fixture key.
     * @returns {String} The manufacturer and fixture names, separated by a space.
     */
    getFixtureName(fixtureKey) {
      const manufacturerKey = fixtureKey.split(`/`)[0];
      const manufacturerName = this.manufacturers[manufacturerKey].name;
      const fixtureName = register.filesystem[fixtureKey].name;

      return `${manufacturerName} ${fixtureName}`;
    },
  },
};


/**
 * @param {String} contributor The contributor name.
 * @returns {String} The combined key of the latest fixture contributed to by this contributor.
 */
function getLatestFixtureKey(contributor) {
  return register.lastUpdated.find(
    key => register.contributors[contributor].fixtures.includes(key),
  );
}
</script>
