<template>
  <div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <script type="application/ld+json" v-html="productModelStructuredData" />

    <!-- eslint-disable-next-line vue/no-v-html -->
    <script type="application/ld+json" v-html="breadcrumbListStructuredData" />

    <header class="fixture-header">
      <div class="title">
        <h1>
          <NuxtLink :to="`/${fixture.manufacturer.key}`">{{ fixture.manufacturer.name }}</NuxtLink>
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

    <section :style="{ borderTopColor: manufacturerColor }" class="fixture-info card">

      <LabeledValue
        name="categories"
        label="Categories">
        <CategoryBadge
          v-for="cat in fixture.categories"
          :key="cat"
          :category="cat" />
      </LabeledValue>

      <LabeledValue
        v-if="fixture.hasComment"
        :value="fixture.comment"
        name="comment"
        label="Comment" />

      <section v-if="videos" class="fixture-videos">
        <div v-for="video in videos" :key="video.url" class="fixture-video">
          <EmbettyVideo
            :type="video.type"
            :video-id="video.videoId"
            :start-at="video.startAt" />
          <a
            :href="video.url"
            rel="nofollow"
            target="_blank">
            <OflSvg name="youtube" />
            Watch video at {{ video.displayType }}
          </a>
        </div>
      </section>

      <LabeledValue
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
              <OflSvg :name="link.iconName" />
              {{ link.name }}
              <span v-if="link.type !== `other`" class="hostname">({{ link.hostname }})</span>
            </a>
          </li>
        </ul>
      </LabeledValue>

      <HelpWantedMessage
        v-if="fixture.isHelpWanted"
        type="fixture"
        :context="fixture"
        @help-wanted-clicked="openHelpWantedDialog" />

      <LabeledValue
        v-if="fixture.rdm !== null"
        name="rdm">
        <template #label>
          <abbr title="Remote Device Management">RDM</abbr> data
        </template>

        {{ fixture.manufacturer.rdmId }} (0x{{ fixture.manufacturer.rdmId.toString(16) }}) /
        {{ fixture.rdm.modelId }} (0x{{ fixture.rdm.modelId.toString(16) }}) /
        {{ `softwareVersion` in fixture.rdm ? fixture.rdm.softwareVersion : `?` }} –
        <a :href="`http://rdm.openlighting.org/model/display?manufacturer=${fixture.manufacturer.rdmId}&model=${fixture.rdm.modelId}`" rel="nofollow">
          <OflSvg name="ola" /> View in Open Lighting RDM database
        </a>
        <span class="hint">manufacturer ID / model ID / software version</span>
      </LabeledValue>

      <template v-if="fixture.physical !== null">
        <h3 class="physical">Physical data</h3>
        <section class="physical">
          <FixturePagePhysical :physical="fixture.physical" />
        </section>
      </template>

      <template v-if="fixture.matrix !== null">
        <h3 class="matrix">Matrix</h3>
        <section class="matrix">
          <FixturePageMatrix :matrix="fixture.matrix" :physical="fixture.physical" />
        </section>
      </template>

      <template v-if="fixture.wheels.length > 0">
        <h3 class="wheels">Wheels</h3>
        <section class="wheels">
          <FixturePageWheel v-for="wheel in fixture.wheels" :key="wheel.name" :wheel="wheel" />
        </section>
      </template>

    </section>

    <section class="fixture-modes">
      <FixturePageMode
        v-for="(mode, index) in modes"
        :key="mode.name"
        :mode="mode"
        :index="index"
        @help-wanted-clicked="openHelpWantedDialog" />
      <div class="clearfix" />
    </section>

    <section v-if="modesLimited && modeNumberLoadLimit < fixture.modes.length" class="card orange dark">
      <h2><OflSvg name="alert" /> This fixture is big!</h2>

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
          <OflSvg name="comment-alert" class="left" /><span>Send information</span>
        </a>
        <a href="https://github.com/OpenLightingProject/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Atype-bug" rel="nofollow" class="card slim">
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
import packageJson from '../../../package.json';
import register from '../../../fixtures/register.json';
import plugins from '../../../plugins/plugins.json';

import schemaProperties from '../../../lib/schema-properties.js';
import Fixture from '../../../lib/model/Fixture.js';

import fixtureLinksMixin from '../../assets/scripts/fixture-links-mixin.js';

import CategoryBadge from '../../components/CategoryBadge.vue';
import ConditionalDetails from '../../components/ConditionalDetails.vue';
import DownloadButton from '../../components/DownloadButton.vue';
import FixturePageMatrix from '../../components/fixture-page/FixturePageMatrix.vue';
import FixturePageMode from '../../components/fixture-page/FixturePageMode.vue';
import FixturePagePhysical from '../../components/fixture-page/FixturePagePhysical.vue';
import FixturePageWheel from '../../components/fixture-page/FixturePageWheel.vue';
import HelpWantedDialog from '../../components/HelpWantedDialog.vue';
import HelpWantedMessage from '../../components/HelpWantedMessage.vue';
import LabeledValue from '../../components/LabeledValue.vue';

const VIDEOS_TO_EMBED = 2;

export default {
  components: {
    CategoryBadge,
    ConditionalDetails,
    DownloadButton,
    FixturePageMatrix,
    FixturePageMode,
    FixturePagePhysical,
    FixturePageWheel,
    HelpWantedDialog,
    HelpWantedMessage,
    LabeledValue
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
        FixtureRenamed: `The fixture was renamed.`,
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
    openHelpWantedDialog(event) {
      this.helpWantedContext = event.context;
      this.helpWantedType = event.type;
    }
  }
};


const supportedVideoFormats = {

  native: {
    regex: /\.(?:mp4|avi)$/,
    displayType: url => getHostname(url),
    videoId: (url, match) => url,
    startAt: (url, match) => 0
  },

  youtube: {
    /**
     * YouTube videos can be in one of the following formats:
     * - https://www.youtube.com/watch?v={videoId}&otherParameters
     * - https://youtu.be/{videoId]}?otherParameters
     */
    regex: /^https:\/\/(?:www\.youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)(?:[?&]t=([0-9hms]+))?/,
    displayType: url => `YouTube`,
    videoId: (url, match) => match[1],
    startAt: (url, match) => match[2] || 0
  },

  vimeo: {
    /**
     * Vimeo videos can be in one of the following formats:
     * - https://vimeo.com/{videoId}
     * - https://vimeo.com/channels/{channelName}/{videoId}
     * - https://vimeo.com/groups/{groupId}/videos/{videoId}
     */
    regex: /^https:\/\/vimeo.com\/(?:channels\/[^/]+\/|groups\/[^/]+\/videos\/)?(\d+)(?:#t=([0-9hms]+))?/,
    displayType: url => `Vimeo`,
    videoId: (url, match) => match[1],
    startAt: (url, match) => match[2] || 0
  },

  facebook: {
    /**
     * Facebook videos can be in the following format:
     * - https://www.facebook.com/{pageName}/videos/{videoTitle}/{videoId}/
     */
    regex: /^https:\/\/www\.facebook\.com\/[^/]+\/videos\/[^/]+\/(\d+)\/$/,
    displayType: url => `Facebook`,
    videoId: (url, match) => match[1],
    startAt: (url, match) => 0
  }

};


/**
 * @param {String} url The video URL.
 * @returns {Object|null} The embettable video data for the URL, or null if the video can not be embetted.
 */
function getEmbettableVideoData(url) {
  const videoTypes = Object.keys(supportedVideoFormats);

  for (const type of videoTypes) {
    const format = supportedVideoFormats[type];
    const match = url.match(format.regex);

    if (match) {
      return {
        url,
        type,
        displayType: format.displayType(url),
        videoId: format.videoId(url, match),
        startAt: format.startAt(url, match)
      };
    }
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
