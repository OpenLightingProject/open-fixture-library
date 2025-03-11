<template>
  <div>
    <section :style="{ borderTopColor: manufacturerColor }" class="fixture-info card">

      <LabeledValue
        name="categories"
        label="Categories">
        <CategoryBadge
          v-for="cat of fixture.categories"
          :key="cat"
          :category="cat" />
      </LabeledValue>

      <LabeledValue
        v-if="fixture.hasComment"
        key="comment"
        :value="fixture.comment"
        name="comment"
        label="Comment" />

      <section v-if="videos" class="fixture-videos">
        <div v-for="video of videos" :key="video.url" class="fixture-video">
          <EmbettyVideo
            :type="video.type"
            :video-id="video.videoId"
            :start-at="video.startAt"
            server-url="https://embetty.open-fixture-library.org" />
          <a
            :href="video.url"
            target="_blank"
            rel="nofollow noopener">
            <OflSvg name="youtube" />
            Watch video at {{ video.displayType }}
          </a>
        </div>
      </section>

      <LabeledValue
        v-if="links.length > 0"
        key="links"
        name="links"
        label="Relevant links">
        <ul class="fixture-links">
          <li v-for="link of links" :key="`${link.type}-${link.url}`" :class="`link-${link.type}`">
            <a
              :href="link.url"
              :title="link.title"
              target="_blank"
              rel="nofollow noopener">
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
        key="rdm"
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
          <FixturePageWheel v-for="wheel of fixture.wheels" :key="wheel.name" :wheel="wheel" />
        </section>
      </template>

    </section>

    <section class="fixture-modes">
      <FixturePageMode
        v-for="mode of modes"
        :key="mode.name"
        :mode="mode"
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
          class="button"
          :class="isBrowser ? `secondary` : `primary`"
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

.comment ::v-deep .value {
  white-space: pre-line;
}

.fixture-videos {
  padding: 0;
  margin: 1rem 0 0;
  line-height: 1;
  text-align: center;
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
  padding: 0;
  margin: 0;
  list-style: none;

  .hostname {
    padding-left: 1ex;
    font-size: 0.9em;
    color: theme-color(text-secondary);
  }

  .link-other {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.wheels {
  overflow: hidden;
  overflow-x: auto;
  white-space: nowrap;
}
</style>

<script>
import { EmbettyVideo } from 'embetty-vue';
import { booleanProp, instanceOfProp } from 'vue-ts-types';
import register from '../../../fixtures/register.json';

import Fixture from '../../../lib/model/Fixture.js';
import { linksProperties } from '../../../lib/schema-properties.js';

import fixtureLinkTypes from '../../assets/scripts/fixture-link-types.js';

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
    EmbettyVideo,
    FixturePageMatrix,
    FixturePageMode,
    FixturePagePhysical,
    FixturePageWheel,
    HelpWantedMessage,
    LabeledValue,
  },
  props: {
    fixture: instanceOfProp(Fixture).required,
    loadAllModes: booleanProp().withDefault(false),
  },
  emits: {
    'help-wanted-clicked': payload => true,
  },
  data() {
    const { linkTypeIconNames, linkTypeNames } = fixtureLinkTypes;
    return {
      manufacturerColor: register.colors[this.fixture.manufacturer.key] || null,
      isBrowser: false,
      modeNumberLoadLimit: this.loadAllModes ? undefined : 5, // initially displayed modes, if limited
      modeNumberLoadThreshold: 15, // fixtures with more modes will be limited
      modeNumberLoadIncrement: 10, // how many modes a button click will load
      linkTypeIconNames,
      linkTypeNames,
    };
  },
  computed: {
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
     * @returns {object[]} Array of videos that can be embetted.
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

      for (const linkType of Object.keys(linksProperties)) {
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
    this.isBrowser = true;
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
     * YouTube videos can be in the following format:
     * - https://www.youtube.com/watch?v={videoId}&otherParameters
     */
    regex: /^https:\/\/www\.youtube\.com\/watch\?v=([\w-]+)(?:&t=([\dhms]+)|)/,
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
    regex: /^https:\/\/vimeo.com\/(?:channels\/[^/]+\/|groups\/[^/]+\/videos\/)?(\d+)(?:#t=([\dhms]+))?/,
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
 * @param {string} url The video URL.
 * @returns {object | null} The embettable video data for the URL, or null if the video can not be embetted.
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
 * @param {string} url The URL to extract the hostname from.
 * @returns {string} The hostname of the provided URL, or the whole URL if the hostname could not be determined.
 */
function getHostname(url) {
  // adapted from https://stackoverflow.com/a/21553982/451391
  const match = url.match(/^.*?\/\/([^#/:?]*)(?::(\d+)|)/);
  return match ? match[1] : url;
}

</script>
