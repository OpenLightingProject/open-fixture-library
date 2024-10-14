<template>
  <div>
    <FixtureHeader>
      <template #title>
        <h1>
          <NuxtLink :to="`/${manufacturerKey}`">{{ fixture.manufacturer.name }}</NuxtLink>
          {{ fixture.name }}
          <code v-if="fixture.hasShortName">{{ fixture.shortName }}</code>
        </h1>

        <section class="fixture-meta">
          <span class="last-modify-date">Last modified:&nbsp;<OflTime :date="fixture.meta.lastModifyDate" /></span>
          <span class="create-date">Created:&nbsp;<OflTime :date="fixture.meta.createDate" /></span>
          <span class="authors">Author{{ fixture.meta.authors.length === 1 ? `` : `s` }}:&nbsp;{{ fixture.meta.authors.join(`, `) }}</span>
          <span class="source"><a :href="`${githubRepoPath}/blob/${branch}/fixtures/${manufacturerKey}/${fixtureKey}.json`">Source</a></span>
          <span class="revisions"><a :href="`${githubRepoPath}/commits/${branch}/fixtures/${manufacturerKey}/${fixtureKey}.json`">Revisions</a></span>

          <ConditionalDetails v-if="fixture.meta.importPlugin !== null">
            <template #summary>
              Imported using the <NuxtLink :to="`/about/plugins/${fixture.meta.importPlugin}`">{{ plugins.data[fixture.meta.importPlugin].name }} plugin</NuxtLink> on <OflTime :date="fixture.meta.importDate" />.
            </template>
            <span v-if="fixture.meta.hasImportComment">{{ fixture.meta.importComment }}</span>
          </ConditionalDetails>
        </section>
      </template>

      <DownloadButton :fixture-key="`${manufacturerKey}/${fixtureKey}`" show-help />
    </FixtureHeader>

    <section v-if="redirect" class="card yellow">
      Redirected from <code>{{ redirect.from }}</code>: {{ redirect.reason }}
    </section>

    <FixturePage
      :fixture="fixture"
      :load-all-modes="`loadAllModes` in $route.query"
      @help-wanted-clicked="openHelpWantedDialog($event)" />

    <section id="contribute">
      <h2>Something wrong with this fixture definition?</h2>
      <p>It does not work in your lighting software or you see another problem? Then please help correct it!</p>
      <div class="grid-3">
        <a
          v-if="isBrowser"
          href="#"
          class="card slim"
          @click.prevent="openHelpWantedDialog({
            context: fixture,
            type: `fixture`,
          })">
          <OflSvg name="comment-alert" class="left" /><span>Send information</span>
        </a>
        <a href="https://github.com/OpenLightingProject/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Abug" rel="nofollow" class="card slim">
          <OflSvg name="bug" class="left" /><span>Create issue on GitHub</span>
        </a>
        <a :href="mailtoUrl" class="card slim">
          <OflSvg name="email" class="left" /><span>Send email</span>
        </a>
      </div>
    </section>

    <HelpWantedDialog v-model="helpWantedContext" :type="helpWantedType" />
  </div>
</template>

<style lang="scss" scoped>
.fixture-meta {
  margin: -1.5rem 0 1rem;
  font-size: 0.8rem;
  color: theme-color(text-secondary);

  & > span:not(:last-child)::after {
    padding: 0 0.7ex;
    content: " | ";
  }
}
</style>

<script>
import register from '../../../fixtures/register.json';

import Fixture from '../../../lib/model/Fixture.js';
import Manufacturer from '../../../lib/model/Manufacturer.js';

import ConditionalDetails from '../../components/ConditionalDetails.vue';
import DownloadButton from '../../components/DownloadButton.vue';
import FixturePage from '../../components/fixture-page/FixturePage.vue';
import FixtureHeader from '../../components/FixtureHeader.vue';
import HelpWantedDialog from '../../components/HelpWantedDialog.vue';

const redirectReasonExplanations = {
  FixtureRenamed: `The fixture was renamed.`,
  SameAsDifferentBrand: `The fixture is the same but sold under different brands / names.`,
};

export default {
  components: {
    ConditionalDetails,
    DownloadButton,
    FixturePage,
    FixtureHeader,
    HelpWantedDialog,
  },
  validate({ params }) {
    return `${params.manufacturerKey}/${params.fixtureKey}` in register.filesystem;
  },
  async asyncData({ params, query, $axios, redirect, error }) {
    const { manufacturerKey, fixtureKey } = params;

    const redirectTo = register.filesystem[`${manufacturerKey}/${fixtureKey}`].redirectTo;
    if (redirectTo) {
      return redirect(302, `/${redirectTo}?redirectFrom=${manufacturerKey}/${fixtureKey}`);
    }

    let fixtureJson;
    let manufacturerJson;
    let plugins;
    let redirectObject;
    try {
      [fixtureJson, manufacturerJson, plugins, redirectObject] = await Promise.all([
        $axios.$get(`/${manufacturerKey}/${fixtureKey}.json`),
        $axios.$get(`/api/v1/manufacturers/${manufacturerKey}`),
        $axios.$get(`/api/v1/plugins`),
        fetchRedirectObject($axios, query.redirectFrom),
      ]);
    }
    catch (requestError) {
      return error(requestError);
    }

    return {
      plugins,
      manufacturerKey,
      manufacturerJson,
      fixtureKey,
      fixtureJson,
      redirect: redirectObject,
    };
  },
  data() {
    return {
      isBrowser: false,
      helpWantedContext: undefined,
      helpWantedType: ``,
    };
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
      script: [
        {
          hid: `productModelStructuredData`,
          type: `application/ld+json`,
          json: this.productModelStructuredData,
        },
        {
          hid: `breadcrumbListStructuredData`,
          type: `application/ld+json`,
          json: this.breadcrumbListStructuredData,
        },
      ],
    };
  },
  computed: {
    fixture() {
      const manufacturer = new Manufacturer(this.manufacturerKey, this.manufacturerJson);
      return new Fixture(manufacturer, this.fixtureKey, this.fixtureJson);
    },
    productModelStructuredData() {
      const data = {
        '@context': `http://schema.org`,
        '@type': `ProductModel`,
        'name': this.fixture.name,
        'category': this.fixture.mainCategory,
        'manufacturer': {
          'url': `${this.$config.websiteUrl}${this.manufacturerKey}`,
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
              '@id': `${this.$config.websiteUrl}manufacturers`,
              'name': `Manufacturers`,
            },
          },
          {
            '@type': `ListItem`,
            'position': 2,
            'item': {
              '@id': `${this.$config.websiteUrl}${this.manufacturerKey}`,
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
      const slug = process.env.GITHUB_REPOSITORY || `OpenLightingProject/open-fixture-library`;
      return `https://github.com/${slug}`;
    },
    branch() {
      const gitRef = process.env.GITHUB_PR_BASE_REF || process.env.GITHUB_REF || `master`;
      // e.g. for `refs/heads/feature-branch-1`, return `feature-branch-1`
      return gitRef.split(`/`).pop();
    },
    mailtoUrl() {
      const subject = `Feedback for fixture '${this.manufacturerKey}/${this.fixtureKey}'`;
      return `mailto:flo@open-fixture-library.org?subject=${encodeURIComponent(subject)}`;
    },
  },
  mounted() {
    this.isBrowser = true;
  },
  methods: {
    openHelpWantedDialog(event) {
      this.helpWantedContext = event.context;
      this.helpWantedType = event.type;
    },
  },
};

/**
 * @param {any} axios The Axios instance.
 * @param {string | undefined} redirectFrom The query parameter with the original request's fixture key.
 * @returns {object} The redirect object.
 */
async function fetchRedirectObject(axios, redirectFrom) {
  if (!redirectFrom) {
    return undefined;
  }

  const redirectJson = await axios.$get(`/${redirectFrom}.json`);

  return {
    from: redirectFrom,
    reason: redirectReasonExplanations[redirectJson.reason],
  };
}
</script>
