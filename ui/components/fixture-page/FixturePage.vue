<template>
  <div>
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
        @help-wanted-clicked="$emit(`help-wanted-clicked`, $event)" />

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
        @help-wanted-clicked="$emit(`help-wanted-clicked`, $event)" />
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
  </div>
</template>

<style lang="scss" scoped>
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
</style>

<script>
import register from '../../../fixtures/register.json';

import schemaProperties from '../../../lib/schema-properties.js';
import Fixture from '../../../lib/model/Fixture.js';

import fixtureLinksMixin from '../../assets/scripts/fixture-links-mixin.js';

import CategoryBadge from '../../components/CategoryBadge.vue';
import FixturePageMatrix from '../../components/fixture-page/FixturePageMatrix.vue';
import FixturePageMode from '../../components/fixture-page/FixturePageMode.vue';
import FixturePagePhysical from '../../components/fixture-page/FixturePagePhysical.vue';
import FixturePageWheel from '../../components/fixture-page/FixturePageWheel.vue';
import HelpWantedMessage from '../../components/HelpWantedMessage.vue';
import LabeledValue from '../../components/LabeledValue.vue';

const VIDEOS_TO_EMBED = 2;

export default {
  components: {
    CategoryBadge,
    FixturePageMatrix,
    FixturePageMode,
    FixturePagePhysical,
    FixturePageWheel,
    HelpWantedMessage,
    LabeledValue,
  },
  mixins: [fixtureLinksMixin],
  props: {
    fixture: {
      type: Fixture,
      required: true,
    },
    loadAllModes: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      manufacturerColor: register.colors[this.fixture.manufacturer.key] || null,
      isBrowser: false,
      modeNumberLoadLimit: this.loadAllModes ? undefined : 5, // initially displayed modes, if limited
      modeNumberLoadThreshold: 15, // fixtures with more modes will be limited
      modeNumberLoadIncrement: 10, // how many modes a button click will load
    };
  },
  computed: {
    manKey() {
      return this.fixture.manufacturer.key;
    },
    fixKey() {
      return this.fixture.key;
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
            url => !this.videos.some(video => video.url === url),
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
            hostname: getHostname(url),
          });

          linkDisplayNumber++;
        }
      }

      return links;
    },
  },
  mounted() {
    if (process.browser) {
      this.isBrowser = true;
    }
  },
};


const supportedVideoFormats = {

  native: {
    regex: /\.(?:mp4|avi)$/,
    displayType: url => getHostname(url),
    videoId: (url, match) => url,
    startAt: (url, match) => 0,
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
    startAt: (url, match) => match[2] || 0,
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
    startAt: (url, match) => match[2] || 0,
  },

  facebook: {
    /**
     * Facebook videos can be in the following format:
     * - https://www.facebook.com/{pageName}/videos/{videoTitle}/{videoId}/
     */
    regex: /^https:\/\/www\.facebook\.com\/[^/]+\/videos\/[^/]+\/(\d+)\/$/,
    displayType: url => `Facebook`,
    videoId: (url, match) => match[1],
    startAt: (url, match) => 0,
  },

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
        startAt: format.startAt(url, match),
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
