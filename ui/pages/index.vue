<template>
  <div>
    <FixtureHeader>
      <template #title>
        <h1>Open Fixture Library</h1>
      </template>

      <DownloadButton :fixture-count="fixtureCount" button-style="home" show-help />
    </FixtureHeader>

    <h3>Create and browse fixture definitions for lighting equipment online and download them in the right format for your DMX control software!</h3>

    <p><abbr title="Open Fixture Library">OFL</abbr> collects DMX fixture definitions in a JSON format and automatically exports them to the right format for every <NuxtLink to="/about/plugins">supported lighting software</NuxtLink>. Everybody can <a href="https://github.com/OpenLightingProject/open-fixture-library/blob/master/docs/CONTRIBUTING.md">contribute</a> and help to improve! Thanks!</p>

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
                <time :datetime="fixture.date">
                  {{ fixture.date }}
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
                {{ contributor.fixtureCount }} fixture{{ contributor.fixtureCount === 1 ? `` : `s` }}, latest: {{ contributor.latestFixtureName }}
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

    <p><strong>🙏 Help wanted!</strong> There are <a href="https://github.com/OpenLightingProject/open-fixture-library/pulls?q=is%3Apr+is%3Aopen+label%3Anew-fixture+sort%3Aupdated-desc">a lot of pull requests</a> for new fixtures that are not yet reviewed and merged. Reviewing them (and maybe fixing smaller issues) helps get this number down and the number of fixtures in OFL up! See the <a href="https://github.com/OpenLightingProject/open-fixture-library/blob/master/docs/CONTRIBUTING.md#fixtures">step-by-step instructions for fixture reviews</a>.</p>

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
import DownloadButton from '../components/DownloadButton.vue';
import FixtureHeader from '../components/FixtureHeader.vue';

export default {
  components: {
    DownloadButton,
    FixtureHeader,
  },
  async asyncData({ $axios, error }) {
    let fixtureCount;
    let lastUpdated;
    let recentContributors;
    try {
      const [fixtureCountResponse, updatedFixtures, contributors] = await Promise.all([
        $axios.$get('/api/v1/fixtures/count'),
        $axios.$get('/api/v1/fixtures/last-updated'),
        $axios.$get('/api/v1/contributors/recent'),
      ]);
      fixtureCount = fixtureCountResponse.count;
      lastUpdated = updatedFixtures;
      recentContributors = contributors;
    }
    catch (requestError) {
      return error(requestError);
    }
    return { fixtureCount, lastUpdated, recentContributors };
  },
  head() {
    return {
      script: [
        {
          hid: 'websiteStructuredData',
          type: 'application/ld+json',
          json: {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            'name': 'Open Fixture Library',
            'url': this.$config.websiteUrl,
            'potentialAction': {
              '@type': 'SearchAction',
              // eslint-disable-next-line unicorn/no-incorrect-template-string-interpolation -- `{search_term_string}` is a literal schema.org SearchAction placeholder
              'target': `${this.$config.websiteUrl}search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          },
        },
        {
          hid: 'organizationStructuredData',
          type: 'application/ld+json',
          json: {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            'name': 'Open Fixture Library',
            'description': 'Create and browse fixture definitions for lighting equipment online and download them in the right format for your DMX control software!',
            'url': this.$config.websiteUrl,
            'logo': `${this.$config.websiteUrl}ofl-logo.svg`,
          },
        },
      ],
    };
  },
};
</script>
