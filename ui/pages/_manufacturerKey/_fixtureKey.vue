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
            <template slot="summary">
              Imported using the <nuxt-link :to="`/about/plugins/${fixture.meta.importPlugin}`">{{ plugins.data[fixture.meta.importPlugin].name }} plugin</nuxt-link> on <span v-html="getDateHtml(fixture.meta.importDate)" />.
            </template>
            <span v-if="fixture.meta.hasImportComment">{{ fixture.meta.importComment }}</span>
          </app-conditional-details>
        </section>
      </div>

      <app-download-button :fixture-key="`${manKey}/${fixKey}`" />
    </header>

    <section v-if="redirect" class="card yellow">
      Redirected from <code>{{ redirect.from }}</code>: {{ redirect.reason }}
    </section>

    <section :style="{ borderTopColor: manufacturerColor }" class="fixture-info card">

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
        v-if="links.length"
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

      <app-help-wanted-message
        v-if="fixture.isHelpWanted"
        type="fixture"
        :context="fixture"
        @help-wanted-clicked="openHelpWantedDialog" />

      <app-labeled-value
        v-if="fixture.rdm !== null"
        name="rdm">
        <template slot="label">
          <abbr title="Remote Device Management">RDM</abbr> data
        </template>

        {{ fixture.manufacturer.rdmId }} (0x{{ fixture.manufacturer.rdmId.toString(16) }}) /
        {{ fixture.rdm.modelId }} (0x{{ fixture.rdm.modelId.toString(16) }}) /
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

      <template v-if="fixture.wheels.length > 0">
        <h3 class="wheels">Wheels</h3>
        <section class="wheels">
          <app-fixture-wheel v-for="wheel in fixture.wheels" :key="wheel.name" :wheel="wheel" />
        </section>
      </template>

    </section>

    <section class="fixture-modes">
      <app-fixture-mode
        v-for="(mode, index) in modes"
        :key="mode.name"
        :mode="mode"
        :index="index"
        @help-wanted-clicked="openHelpWantedDialog" />
      <div class="clearfix" />
    </section>

    <section v-if="modesLimited && modeNumberLoadLimit < fixture.modes.length" class="card orange dark">
      <h2><app-svg name="alert" /> This fixture is big!</h2>

      <div>Only the first {{ modeNumberLoadLimit }} of {{ fixture.modes.length }} modes are displayed. Loading more modes might take a while.</div>

      <div class="button-bar">
        <a
          v-if="isBrowser"
          href="#load-modes"
          class="button primary"
          @click.prevent="modeNumberLoadLimit += modeNumberLoadIncrement">
          Load {{ Math.min(modeNumberLoadIncrement, fixture.modes.length - modeNumberLoadLimit) }} more modes
        </a>
        <a
          href="?loadAllModes"
          :class="[`button`, isBrowser ? `secondary` : `primary`]"
          rel="nofollow noindex"
          @click.prevent="modeNumberLoadLimit = undefined">
          Load all {{ fixture.modes.length }} modes
        </a>
      </div>
    </section>

    <section id="contribute">
      <h2>Something wrong with this fixture definition?</h2>
      <p>It does not work in your lighting software or you see another problem? Then please help correct it!</p>
      <div class="grid-3">
        <a
          v-if="isBrowser"
          href="#"
          class="card slim"
          @click.prevent="() => openHelpWantedDialog({
            context: fixture,
            type: `fixture`
          })">
          <app-svg name="comment-alert" class="left" /><span>Send information</span>
        </a>
        <a href="https://github.com/OpenLightingProject/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Atype-bug" rel="nofollow" class="card slim">
          <app-svg name="bug" class="left" /><span>Create issue on GitHub</span>
        </a>
        <a :href="mailtoUrl" class="card slim">
          <app-svg name="email" class="left" /><span>Send email</span>
        </a>
      </div>
    </section>

    <app-help-wanted-dialog v-model="helpWantedContext" :type="helpWantedType" />
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

.fixture-info {
  border-top: 0.4rem solid transparent;
}

.comment /deep/ .value {
  white-space: pre-line;
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
    color: theme-color(text-secondary);
    font-size: 0.9em;
    padding-left: 1ex;
  }

  .link-other {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.wheels {
  white-space: nowrap;
  overflow: hidden;
  overflow-x: auto;
}

#contribute:target {
  animation-delay: 0.5s;
  animation-duration: 1.5s;
  animation-fill-mode: backwards;
  animation-timing-function: ease;

  @include animation-keyframes {
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
}
</style>

<script>
import packageJson from '~~/package.json';
import register from '~~/fixtures/register.json';
import plugins from '~~/plugins/plugins.json';

import schemaProperties from '~~/lib/schema-properties.js';
import Fixture from '~~/lib/model/Fixture.js';

import svg from '~/components/svg.vue';
import categoryBadge from '~/components/category-badge.vue';
import conditionalDetailsVue from '~/components/conditional-details.vue';
import downloadButtonVue from '~/components/download-button.vue';
import fixturePhysical from '~/components/fixture-physical.vue';
import fixtureMatrix from '~/components/fixture-matrix.vue';
import fixtureWheel from '~/components/fixture-wheel.vue';
import fixtureMode from '~/components/fixture-mode.vue';
import helpWantedDialog from '~/components/help-wanted-dialog.vue';
import helpWantedMessage from '~/components/help-wanted-message.vue';
import labeledValueVue from '~/components/labeled-value.vue';

import fixtureLinksMixin from '~/assets/scripts/fixture-links-mixin.js';

const VIDEOS_TO_EMBED = 2;

export default {
  components: {
    'app-svg': svg,
    'app-category-badge': categoryBadge,
    'app-conditional-details': conditionalDetailsVue,
    'app-download-button': downloadButtonVue,
    'app-fixture-physical': fixturePhysical,
    'app-fixture-matrix': fixtureMatrix,
    'app-fixture-wheel': fixtureWheel,
    'app-fixture-mode': fixtureMode,
    'app-help-wanted-dialog': helpWantedDialog,
    'app-help-wanted-message': helpWantedMessage,
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
      redirect(302, `/${redirectTo}?redirectFrom=${manKey}/${fixKey}`);
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
      manufacturerColor: register.colors[manKey],
      fixKey,
      fixtureJson,
      redirect: redirectObj,
      modeNumberLoadLimit: `loadAllModes` in query ? undefined : 5 // initially displayed modes, if limited
    };
  },
  data() {
    return {
      plugins,
      isBrowser: false,
      helpWantedContext: null,
      helpWantedType: ``,
      modeNumberLoadThreshold: 15, // fixtures with more modes will be limited
      modeNumberLoadIncrement: 10 // how many modes a button click will load
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
    modesLimited() {
      return this.fixture.modes.length > this.modeNumberLoadThreshold;
    },
    modes() {
      const modes = this.fixture.modes;

      if (!this.modesLimited) {
        return modes;
      }

      return modes.slice(0, this.modeNumberLoadLimit);
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
     * @returns {Array.<Object>} Array of videos that can be embetted.
     */
    videos() {
      const videoUrls = this.fixture.getLinksOfType(`video`);
      const embettableVideoData = [];

      for (const url of videoUrls) {
        if (embettableVideoData.length === VIDEOS_TO_EMBED) {
          break;
        }

        const videoData = getEmbettableVideoData(url);
        if (videoData !== null) {
          embettableVideoData.push(videoData);
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
            hostname: getHostname(url)
          });

          linkDisplayNumber++;
        }
      }

      return links;
    },
    mailtoUrl() {
      const subject = `Feedback for fixture '${this.manKey}/${this.fixKey}'`;
      return `mailto:florian-edelmann@online.de?subject=${encodeURIComponent(subject)}`;
    }
  },
  head() {
    const title = `${this.fixture.manufacturer.name} ${this.fixture.name} DMX fixture definition`;

    return {
      title,
      meta: [
        {
          hid: `title`,
          content: title
        }
      ]
    };
  },
  mounted() {
    if (process.browser) {
      this.isBrowser = true;
    }
  },
  methods: {
    /**
     * Format a date to display as a <time> HTML tag.
     * @param {Date} date The Date object to format.
     * @returns {String} The <time> HTML tag.
     */
    getDateHtml(date) {
      return `<time datetime="${date.toISOString()}" title="${date.toISOString()}">${date.toISOString().replace(/T.*?$/, ``)}</time>`;
    },

    openHelpWantedDialog(event) {
      this.helpWantedContext = event.context;
      this.helpWantedType = event.type;
    }
  }
};


/**
 * YouTube videos can be in one of the following formats:
 * - https://www.youtube.com/watch?v={videoId}&otherParameters
 * - https://youtu.be/{videoId]}?otherParameters
 */
const youtubeVideoUrlRegex = /^https:\/\/(?:www\.youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)(?:[?&]t=([0-9hms]+))?/;

/**
 * Vimeo videos can be in one of the following formats:
 * - https://vimeo.com/{videoId}
 * - https://vimeo.com/channels/{channelName}/{videoId}
 * - https://vimeo.com/groups/{groupId}/videos/{videoId}
 */
const vimeoVideoUrlRegex = /^https:\/\/vimeo.com\/(?:channels\/[^/]+\/|groups\/[^/]+\/videos\/)?(\d+)(?:#t=([0-9hms]+))?/;

const nativeVideoUrlRegex = /\.(?:mp4|avi)$/;


/**
 * @param {String} url The video URL.
 * @returns {Object|null} The embettable video data for the URL, or null if the video can not be embetted.
 */
function getEmbettableVideoData(url) {
  if (nativeVideoUrlRegex.test(url)) {
    return {
      url,
      type: `native`,
      displayType: getHostname(url),
      videoId: url,
      startAt: 0
    };
  }

  let match = url.match(youtubeVideoUrlRegex);
  if (match !== null) {
    return {
      url,
      type: `youtube`,
      displayType: `YouTube`,
      videoId: match[1],
      startAt: match[2] || 0
    };
  }

  match = url.match(vimeoVideoUrlRegex);
  if (match !== null) {
    return {
      url,
      type: `vimeo`,
      displayType: `Vimeo`,
      videoId: match[1],
      startAt: match[2] || 0
    };
  }

  return null;
}

/**
 * @param {String} url The URL to extract the hostname from.
 * @returns {String} The hostname of the provided URL, or the whole URL if the hostname could not be determined.
 */
function getHostname(url) {
  // adapted from https://stackoverflow.com/a/21553982/451391
  const match = url.match(/^.*?\/\/(?:([^:/?#]*)(?::([0-9]+))?)/);
  return match ? match[1] : url;
}

</script>
