<template>
  <div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <script type="application/ld+json" v-html="productModelStructuredData" />

    <!-- eslint-disable-next-line vue/no-v-html -->
    <script type="application/ld+json" v-html="breadcrumbListStructuredData" />

    <header class="fixture-header">
      <div class="title">
        <h1>
          <NuxtLink :to="`/${manKey}`">{{ fixture.manufacturer.name }}</NuxtLink>
          {{ fixture.name }}
          <code v-if="fixture.hasShortName">{{ fixture.shortName }}</code>
        </h1>

        <section class="fixture-meta">
          <span class="last-modify-date">Last modified:&nbsp;<OflTime :date="fixture.meta.lastModifyDate" /></span>
          <span class="create-date">Created:&nbsp;<OflTime :date="fixture.meta.createDate" /></span>
          <span class="authors">Author{{ fixture.meta.authors.length === 1 ? `` : `s` }}:&nbsp;{{ fixture.meta.authors.join(`, `) }}</span>
          <span class="source"><a :href="`${githubRepoPath}/blob/${branch}/fixtures/${manKey}/${fixKey}.json`">Source</a></span>
          <span class="revisions"><a :href="`${githubRepoPath}/commits/${branch}/fixtures/${manKey}/${fixKey}.json`">Revisions</a></span>

          <ConditionalDetails v-if="fixture.meta.importPlugin !== null">
            <template #summary>
              Imported using the <NuxtLink :to="`/about/plugins/${fixture.meta.importPlugin}`">{{ plugins.data[fixture.meta.importPlugin].name }} plugin</NuxtLink> on <OflTime :date="fixture.meta.importDate" />.
            </template>
            <span v-if="fixture.meta.hasImportComment">{{ fixture.meta.importComment }}</span>
          </ConditionalDetails>
        </section>
      </div>

      <DownloadButton :fixture-key="`${manKey}/${fixKey}`" />
    </header>

    <section v-if="redirect" class="card yellow">
      Redirected from <code>{{ redirect.from }}</code>: {{ redirect.reason }}
    </section>

    <FixturePage :fixture="fixture" :load-all-modes="loadAllModes" />
  </div>
</template>

<style lang="scss" scoped>
.fixture-meta {
  margin: -1.5rem 0 1rem;
  font-size: 0.8rem;
  color: theme-color(text-secondary);

  & > span:not(:last-child)::after {
    content: ' | ';
    padding: 0 0.7ex;
  }
}
</style>

<script>
import packageJson from '../../../package.json';
import register from '../../../fixtures/register.json';
import plugins from '../../../plugins/plugins.json';

import Fixture from '../../../lib/model/Fixture.js';

import ConditionalDetails from '../../components/ConditionalDetails.vue';
import DownloadButton from '../../components/DownloadButton.vue';
import FixturePage from '../../components/fixture-page/FixturePage.vue';

export default {
  components: {
    ConditionalDetails,
    DownloadButton,
    FixturePage,
  },
  validate({ params }) {
    return `${params.manufacturerKey}/${params.fixtureKey}` in register.filesystem;
  },
  async asyncData({ params, query, app, redirect }) {
    const manKey = params.manufacturerKey;
    const fixKey = params.fixtureKey;

    const redirectTo = register.filesystem[`${manKey}/${fixKey}`].redirectTo;
    if (redirectTo) {
      redirect(302, `/${redirectTo}?redirectFrom=${manKey}/${fixKey}`);
      return {};
    }

    const fixtureJson = await app.$axios.$get(`/${manKey}/${fixKey}.json`);

    let redirectObj = null;
    if (query.redirectFrom) {
      const redirectJson = await app.$axios.$get(`/${query.redirectFrom}.json`);

      const reasonExplanations = {
        FixtureRenamed: `The fixture was renamed.`,
        SameAsDifferentBrand: `The fixture is the same but sold under different brands / names.`,
      };

      redirectObj = {
        from: query.redirectFrom,
        reason: reasonExplanations[redirectJson.reason],
      };
    }

    return {
      plugins,
      manKey,
      fixKey,
      fixtureJson,
      redirect: redirectObj,
      loadAllModes: `loadAllModes` in query,
    };
  },
  computed: {
    fixture() {
      return new Fixture(this.manKey, this.fixKey, this.fixtureJson);
    },
    productModelStructuredData() {
      const data = {
        '@context': `http://schema.org`,
        '@type': `ProductModel`,
        'name': this.fixture.name,
        'category': this.fixture.mainCategory,
        'manufacturer': {
          'url': `${packageJson.homepage}${this.manKey}`,
        },
      };

      if (this.fixture.hasComment) {
        data.description = this.fixture.comment;
      }

      if (this.fixture.physical !== null && this.fixture.physical.dimensions !== null) {
        data.depth = this.fixture.physical.depth;
        data.width = this.fixture.physical.width;
        data.height = this.fixture.physical.height;
      }

      return data;
    },
    breadcrumbListStructuredData() {
      return {
        '@context': `http://schema.org`,
        '@type': `BreadcrumbList`,
        'itemListElement': [
          {
            '@type': `ListItem`,
            'position': 1,
            'item': {
              '@id': `${packageJson.homepage}manufacturers`,
              'name': `Manufacturers`,
            },
          },
          {
            '@type': `ListItem`,
            'position': 2,
            'item': {
              '@id': `${packageJson.homepage}${this.manKey}`,
              'name': this.fixture.manufacturer.name,
            },
          },
          {
            '@type': `ListItem`,
            'position': 3,
            'item': {
              '@id': this.fixture.url,
              'name': this.fixture.name,
            },
          },
        ],
      };
    },
    githubRepoPath() {
      const slug = process.env.TRAVIS_PULL_REQUEST_SLUG || process.env.TRAVIS_REPO_SLUG || `OpenLightingProject/open-fixture-library`;

      return `https://github.com/${slug}`;
    },
    branch() {
      return process.env.TRAVIS_PULL_REQUEST_BRANCH || process.env.TRAVIS_BRANCH || `master`;
    },
  },
  head() {
    const title = `${this.fixture.manufacturer.name} ${this.fixture.name} DMX fixture definition`;

    return {
      title,
      meta: [
        {
          hid: `title`,
          content: title,
        },
      ],
    };
  },
};

</script>
