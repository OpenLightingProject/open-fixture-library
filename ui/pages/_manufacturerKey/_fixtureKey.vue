<template>
  <div>
    <script type="application/ld+json" v-html="productModelStructuredData" />
    <script type="application/ld+json" v-html="breadcrumbListStructuredData" />

    <header class="fixture-header">
      <div class="title">
        <h1>
          <nuxt-link :to="`/${fixture.manufacturer.key}`">{{ fixture.manufacturer.name }}</nuxt-link>
          {{ fixture.name }}
          <code v-if="fixture.hasShortName">{{ fixture.shortName }}</code>
        </h1>

        <section class="fixture-meta">
          <span class="last-modify-date">Last modified:&nbsp;<span v-html="lastModifyDate" /></span>
          <span class="create-date">Created:&nbsp;<span v-html="createDate" /></span>
          <span class="authors">Author{{ fixture.meta.authors.length === 1 ? `` : `s` }}:&nbsp;{{ fixture.meta.authors.join(`, `) }}</span>
          <span class="source"><a :href="`${githubRepoPath}/blob/${branch}/fixtures/${manKey}/${fixKey}.json`">Source</a></span>
          <span class="revisions"><a :href="`${githubRepoPath}/commits/${branch}/fixtures/${manKey}/${fixKey}.json`">Revisions</a></span>
        </section>
      </div>

      <app-download-button :download="`${manKey}/${fixKey}`" />
    </header>

    <section v-if="redirect" class="card yellow">
      Redirected from <code>{{ redirect.from }}</code>: {{ redirect.reason }}
    </section>

    <section class="fixture-info card">

      <section class="categories">
        <span class="label">Categories</span>
        <span class="value">
          <app-category-badge
            v-for="cat in fixture.categories"
            :key="cat"
            :category="cat" />
        </span>
      </section>

      <section v-if="fixture.hasComment" class="comment">
        <span class="label">Comment</span>
        <span class="value">{{ fixture.comment }}</span>
      </section>

      <section v-if="fixture.manualURL !== null" class="manualURL">
        <span class="label">Manual</span>
        <span class="value"><a :href="fixture.manualURL" rel="nofollow">{{ fixture.manualURL }}</a></span>
      </section>

      <section v-if="fixture.isHelpWanted" class="help-wanted">
        <app-svg name="comment-question-outline" title="Help wanted!" /><a href="#contribute">You can help to improve this fixture!</a>
        {{ fixture.helpWanted !== null ? fixture.helpWanted : `Specific questions are included in the capabilities below.` }}
      </section>

      <section v-if="fixture.rdm !== null" class="rdm">
        <span class="label"><abbr title="Remote Device Management">RDM</abbr> data</span>
        <span class="value">
          {{ fixture.manufacturer.rdmId }} /
          {{ fixture.rdm.modelId }} /
          {{ `softwareVersion` in fixture.rdm ? fixture.rdm.softwareVersion : `?` }} –
          <a :href="`http://rdm.openlighting.org/model/display?manufacturer=${fixture.manufacturer.rdmId}&model=${fixture.rdm.modelId}`" rel="nofollow">
            <app-svg name="ola" /> View in Open Lighting RDM database
          </a>
          <span class="hint">manufacturer ID / model ID / software version</span>
        </span>
      </section>

      <template v-if="fixture.physical !== null">
        <h3 class="physical">Physical data</h3>
        <section class="physical">
          <app-fixture-physical :physical="fixture.physical" />
        </section>
      </template>

      <template v-if="fixture.matrix !== null">
        <h3 class="matrix">Matrix</h3>
        <section class="matrix">
          <app-fixture-matrix :matrix="fixture.matrix" :physical="fixture.physical" />
        </section>
      </template>

    </section>

    <section class="fixture-modes">
      <app-fixture-mode
        v-for="(mode, index) in fixture.modes"
        :key="mode.name"
        :mode="mode"
        :index="index" />
      <div class="clearfix" />
    </section>

    <section id="contribute">
      <h2>Something wrong with this fixture definition?</h2>
      <p>It does not work in your lighting software or you see another problem? Then please help correct it!</p>
      <div class="grid list">
        <a href="https://github.com/OpenLightingProject/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Atype-bug" rel="nofollow" class="card"><app-svg name="bug" class="left" /><span>Report issue on GitHub</span></a>
        <a href="/about#contact" class="card"><app-svg name="email" class="left" /><span>Contact</span></a>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@import '~assets/styles/vars.scss';

.fixture-meta {
  margin: -1.5rem 0 1rem;
  font-size: 0.8rem;
  color: $secondary-text-dark;

  & > span:not(:last-child)::after {
    content: ' | ';
    padding: 0 0.7ex;
  }
}

.comment > .value {
  white-space: pre-line;
}

.manualURL {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  & > .value {
    display: inline;
  }
}

#contribute:target {
  animation: contribute-highlight 1.3s ease;
  animation-delay: 0.5s;
  animation-fill-mode: backwards;
}

@keyframes contribute-highlight {
  0% {
    background-color: $blue-100;
    box-shadow: 0 0 3px 5px $blue-100;
  }
  35% {
    background-color: $blue-100;
    box-shadow: 0 0 3px 5px $blue-100;
  }
  100% {
    background-color: $grey-200; // page background color
    box-shadow: 0 0 3px 5px $grey-200;
  }
}
</style>

<script>
import svg from '~/components/svg.vue';
import categoryBadge from '~/components/category-badge.vue';
import downloadButtonVue from '~/components/download-button.vue';
import fixturePhysical from '~/components/fixture-physical.vue';
import fixtureMatrix from '~/components/fixture-matrix.vue';
import fixtureMode from '~/components/fixture-mode.vue';

import packageJson from '~~/package.json';
import register from '~~/fixtures/register.json';

import Fixture from '~~/lib/model/Fixture.mjs';

export default {
  components: {
    'app-svg': svg,
    'app-category-badge': categoryBadge,
    'app-download-button': downloadButtonVue,
    'app-fixture-physical': fixturePhysical,
    'app-fixture-matrix': fixtureMatrix,
    'app-fixture-mode': fixtureMode
  },
  validate({ params }) {
    return `${params.manufacturerKey}/${params.fixtureKey}` in register.filesystem;
  },
  async asyncData({ params, query, app, redirect }) {
    const manKey = params.manufacturerKey;
    const fixKey = params.fixtureKey;

    const redirectTo = register.filesystem[`${manKey}/${fixKey}`].redirectTo;
    if (redirectTo) {
      redirect(301, `/${redirectTo}?redirectFrom=${manKey}/${fixKey}`);
      return {};
    }

    const fixtureJson = await app.$axios.$get(`/${manKey}/${fixKey}.json`);

    let redirectObj = null;
    if (query.redirectFrom) {
      const redirectJson = await app.$axios.$get(`/${query.redirectFrom}.json`);

      const reasonExplanations = {
        FixtureRenamed: `The fixture was renamed by the manufacturer.`,
        SameAsDifferentBrand: `The fixture is the same but sold under different brands / names.`
      };

      redirectObj = {
        from: query.redirectFrom,
        reason: reasonExplanations[redirectJson.reason]
      };
    }

    return {
      manKey,
      fixKey,
      fixtureJson,
      redirect: redirectObj
    };
  },
  computed: {
    fixture() {
      return new Fixture(this.manKey, this.fixKey, this.fixtureJson);
    },
    lastModifyDate() {
      return getDateHtml(this.fixture.meta.lastModifyDate);
    },
    createDate() {
      return getDateHtml(this.fixture.meta.lastModifyDate);
    },
    githubRepoPath() {
      const slug = process.env.TRAVIS_PULL_REQUEST_SLUG || process.env.TRAVIS_REPO_SLUG || `OpenLightingProject/open-fixture-library`;

      return `https://github.com/${slug}`;
    },
    branch() {
      return process.env.TRAVIS_PULL_REQUEST_BRANCH || process.env.TRAVIS_BRANCH || `master`;
    },
    productModelStructuredData() {
      const data = {
        '@context': `http://schema.org`,
        '@type': `ProductModel`,
        'name': this.fixture.name,
        'category': this.fixture.mainCategory,
        'manufacturer': {
          'url': `${packageJson.homepage}${this.fixture.manufacturer.key}`
        }
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
              'name': `Manufacturers`
            }
          },
          {
            '@type': `ListItem`,
            'position': 2,
            'item': {
              '@id': `${packageJson.homepage}${this.fixture.manufacturer.key}`,
              'name': this.fixture.manufacturer.name
            }
          },
          {
            '@type': `ListItem`,
            'position': 3,
            'item': {
              '@id': this.fixture.url,
              'name': this.fixture.name
            }
          }
        ]
      };
    }
  },
  head() {
    return {
      title: `${this.fixture.manufacturer.name} ${this.fixture.name} DMX fixture definition`
    };
  }
};

/**
 * Format a date to display as a <time> HTML tag.
 * @param {!Date} date The Date object to format.
 * @returns {!string} The <time> HTML tag.
 */
function getDateHtml(date) {
  return `<time datetime="${date.toISOString()}" title="${date.toISOString()}">${date.toISOString().replace(/T.*?$/, ``)}</time>`;
}
</script>
