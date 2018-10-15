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

          <app-conditional-details v-if="fixture.meta.importPlugin !== null">
            <template slot="summary">Imported using the {{ plugins.data[fixture.meta.importPlugin].name }} plugin on <span v-html="getDateHtml(fixture.meta.importDate)" />.</template>
            <span v-if="fixture.meta.hasImportComment">{{ fixture.meta.importComment }}</span>
          </app-conditional-details>
        </section>
      </div>

      <app-download-button :download="`${manKey}/${fixKey}`" />
    </header>

    <section v-if="redirect" class="card yellow">
      Redirected from <code>{{ redirect.from }}</code>: {{ redirect.reason }}
    </section>

    <section class="fixture-info card">

      <app-labeled-value
        name="categories"
        label="Categories">
        <app-category-badge
          v-for="cat in fixture.categories"
          :key="cat"
          :category="cat" />
      </app-labeled-value>

      <app-labeled-value
        v-if="fixture.hasComment"
        :value="fixture.comment"
        name="comment"
        label="Comment" />

      <section v-if="videos" class="fixture-videos">
        <div v-for="video in videos" :key="video.url" class="fixture-video">
          <embetty-video
            :type="video.type"
            :video-id="video.videoId"
            :start-at="video.startAt" />
          <a
            :href="video.url"
            rel="nofollow"
            target="_blank">
            <app-svg name="youtube" />
            Watch video at {{ video.displayType }}
          </a>
        </div>
      </section>

      <app-labeled-value
        v-if="fixture.links !== null"
        name="links"
        label="Relevant links">
        <ul class="fixture-links">
          <li v-for="link in links" :key="`${link.type}-${link.url}`" :class="`link-${link.type}`">
            <a
              :href="link.url"
              :title="link.title"
              rel="nofollow"
              target="_blank">
              <app-svg :name="link.iconName" />
              {{ link.name }}
              <span v-if="link.type !== `other`" class="hostname">({{ link.hostname }})</span>
            </a>
          </li>
        </ul>
      </app-labeled-value>

      <section v-if="fixture.isHelpWanted" class="help-wanted">
        <app-svg name="comment-question-outline" title="Help wanted!" /><a href="#contribute">You can help to improve this fixture definition!</a>
        {{ fixture.helpWanted !== null ? fixture.helpWanted : `Specific questions are included in the capabilities below.` }}
      </section>

      <app-labeled-value
        v-if="fixture.rdm !== null"
        name="rdm">
        <template slot="label">
          <abbr title="Remote Device Management">RDM</abbr> data
        </template>

        {{ fixture.manufacturer.rdmId }} /
        {{ fixture.rdm.modelId }} /
        {{ `softwareVersion` in fixture.rdm ? fixture.rdm.softwareVersion : `?` }} –
        <a :href="`http://rdm.openlighting.org/model/display?manufacturer=${fixture.manufacturer.rdmId}&model=${fixture.rdm.modelId}`" rel="nofollow">
          <app-svg name="ola" /> View in Open Lighting RDM database
        </a>
        <span class="hint">manufacturer ID / model ID / software version</span>
      </app-labeled-value>

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
      <div class="grid-3 list">
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

.fixture-videos {
  text-align: center;
  line-height: 1;
  margin: 1rem 0 0;
  padding: 0;
}
.fixture-video {
  margin-bottom: 1rem;

  @media screen and (min-width: $phone-landscape) {
    display: inline-block;
    width: 50%;
  }

  & a {
    display: inline-block;
    margin-top: 4px;
  }
}

.fixture-links {
  margin: 0;
  padding: 0;
  list-style: none;

  .hostname {
    color: $secondary-text-dark;
    font-size: 0.9em;
    padding-left: 1ex;
  }

  .link-other {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

#contribute:target {
  animation: contribute-highlight 1.5s ease;
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

<style lang="scss">
.comment > .value {
  white-space: pre-line;
}
</style>

<script>
import packageJson from '~~/package.json';
import register from '~~/fixtures/register.json';
import plugins from '~~/plugins/plugins.json';

import schemaProperties from '~~/lib/schema-properties.js';
import Fixture from '~~/lib/model/Fixture.mjs';

import svg from '~/components/svg.vue';
import categoryBadge from '~/components/category-badge.vue';
import conditionalDetailsVue from '~/components/conditional-details.vue';
import downloadButtonVue from '~/components/download-button.vue';
import fixturePhysical from '~/components/fixture-physical.vue';
import fixtureMatrix from '~/components/fixture-matrix.vue';
import fixtureMode from '~/components/fixture-mode.vue';
import labeledValueVue from '~/components/labeled-value.vue';

import fixtureLinksMixin from '~/assets/scripts/fixture-links-mixin.mjs';

const VIDEOS_TO_EMBED = 2;

export default {
  components: {
    'app-svg': svg,
    'app-category-badge': categoryBadge,
    'app-conditional-details': conditionalDetailsVue,
    'app-download-button': downloadButtonVue,
    'app-fixture-physical': fixturePhysical,
    'app-fixture-matrix': fixtureMatrix,
    'app-fixture-mode': fixtureMode,
    'app-labeled-value': labeledValueVue
  },
  mixins: [fixtureLinksMixin],
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
  data() {
    return {
      plugins
    };
  },
  computed: {
    fixture() {
      return new Fixture(this.manKey, this.fixKey, this.fixtureJson);
    },
    lastModifyDate() {
      return this.getDateHtml(this.fixture.meta.lastModifyDate);
    },
    createDate() {
      return this.getDateHtml(this.fixture.meta.createDate);
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
    },

    /**
     * @returns {array.<object>} Array of videos that can be embetted.
     */
    videos() {
      const videoUrls = this.fixture.getLinksOfType(`video`);
      const embettableVideoData = [];

      /**
       * YouTube videos can be in one of the following formats:
       * - https://www.youtube.com/watch?v={videoId}&otherParameters
       * - https://youtu.be/{videoId]}?otherParameters
       */
      const youtubeRegex = /^https:\/\/(?:www\.youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)(?:[?&]t=([0-9hms]+))?/;

      /**
       * Vimeo videos can be in one of the following formats:
       * - https://vimeo.com/{videoId}
       * - https://vimeo.com/channels/{channelName}/{videoId}
       * - https://vimeo.com/groups/{groupId}/videos/{videoId}
       */
      const vimeoRegex = /^https:\/\/vimeo.com\/(?:channels\/[^/]+\/|groups\/[^/]+\/videos\/)?(\d+)(?:#t=([0-9hms]+))?/;

      for (const url of videoUrls) {
        if (embettableVideoData.length === VIDEOS_TO_EMBED) {
          break;
        }

        let match = url.match(youtubeRegex);
        if (match !== null) {
          embettableVideoData.push({
            url,
            type: `youtube`,
            displayType: `YouTube`,
            videoId: match[1],
            startAt: match[2] || 0
          });
          continue;
        }

        match = url.match(vimeoRegex);
        if (match !== null) {
          embettableVideoData.push({
            url,
            type: `vimeo`,
            displayType: `Vimeo`,
            videoId: match[1],
            startAt: match[2] || 0
          });
          continue;
        }
      }

      return embettableVideoData;
    },

    links() {
      const links = [];

      for (const linkType of Object.keys(schemaProperties.links)) {
        let linkDisplayNumber = 1;
        let linksOfType = this.fixture.getLinksOfType(linkType);

        if (linkType === `video`) {
          linksOfType = linksOfType.filter(
            url => !this.videos.some(video => video.url === url)
          );
          linkDisplayNumber += this.videos.length;
        }

        for (const url of linksOfType) {
          let name = this.linkTypeNames[linkType];
          const title = `${name} at ${url}`;

          if (linkType === `other`) {
            name = url;
          }
          else if (linkDisplayNumber > 1) {
            name += ` ${linkDisplayNumber}`;
          }

          links.push({
            url,
            name,
            title,
            type: linkType,
            iconName: this.linkTypeIconNames[linkType],
            hostname: this.getHostname(url)
          });

          linkDisplayNumber++;
        }
      }

      return links;
    }
  },
  head() {
    return {
      title: `${this.fixture.manufacturer.name} ${this.fixture.name} DMX fixture definition`
    };
  },
  methods: {
    getHostname(url) {
      // adapted from https://stackoverflow.com/a/21553982/451391
      const match = url.match(/^.*?\/\/(?:([^:/?#]*)(?::([0-9]+))?)/);
      return match ? match[1] : url;
    },
    /**
     * Format a date to display as a <time> HTML tag.
     * @param {Date} date The Date object to format.
     * @returns {string} The <time> HTML tag.
     */
    getDateHtml(date) {
      return `<time datetime="${date.toISOString()}" title="${date.toISOString()}">${date.toISOString().replace(/T.*?$/, ``)}</time>`;
    }
  }
};

</script>
