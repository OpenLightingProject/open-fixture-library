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

      <section v-if="embettableVideos" class="fixture-videos">
        <div v-for="videoData of embettableVideos" :key="videoData.url" class="fixture-video">
          <FixtureVideo :video="videoData" />
          <a
            :href="videoData.url"
            target="_blank"
            rel="nofollow noopener">
            <OflSvg name="youtube" />
            Watch video at {{ videoData.displayType }}
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
              <span class="link-name">{{ link.name }}</span>
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

    <MasonryCardContainer>
      <FixturePageMode
        v-for="mode of modes"
        :key="mode.name"
        :mode="mode"
        @help-wanted-clicked="$emit(`help-wanted-clicked`, $event)" />
    </MasonryCardContainer>

    <section v-if="modesLimited && modeNumberLoadLimit < fixture.modes.length" class="card orange dark">
      <h2><OflSvg name="alert" /> This fixture is big!</h2>

      <div>Only the first {{ modeNumberLoadLimit }} of {{ fixture.modes.length }} modes are displayed. Loading more modes might take a while.</div>

      <div class="button-bar">
        <a
          v-if="client"
          href="#load-modes"
          class="button primary"
          @click.prevent="modeNumberLoadLimit += modeNumberLoadIncrement">
          Load {{ Math.min(modeNumberLoadIncrement, fixture.modes.length - modeNumberLoadLimit) }} more modes
        </a>
        <a
          href="?loadAllModes"
          class="button"
          :class="client ? `secondary` : `primary`"
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

.comment :deep(.value) {
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
    display: inline-flex;
    gap: 0.5ex;
    align-items: center;
    margin-top: 4px;
  }
}

.fixture-links {
  padding: 0;
  margin: 0;
  list-style: none;

  a {
    display: inline-flex;
    flex-flow: row wrap;
    align-items: center;
    text-decoration-line: none;
  }

  .link-name {
    margin-right: 1ex;
    margin-left: 0.5ex;
    text-decoration-line: underline;
    text-decoration-color: inherit;
  }

  .hostname {
    min-width: 0;
    font-size: 0.9em;
    color: theme-color(text-secondary);
    overflow-wrap: anywhere;
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

<script setup lang="ts">
import fixtureLinkTypes from '@/assets/scripts/fixture-link-types.js';
import { linksProperties } from '~~/lib/schema-properties.js';
import FixtureVideo from './FixtureVideo.vue';
import type { Fixture } from '~/types/models';

interface Properties {
  fixture: Fixture;
  loadAllModes?: boolean;
  manufacturerColor?: string | null;
}

const properties = withDefaults(defineProps<Properties>(), {
  loadAllModes: false,
  manufacturerColor: null,
});

defineEmits<{
  'help-wanted-clicked': [event: { context: object; type: string }];
}>();

const { linkTypeIconNames, linkTypeNames } = fixtureLinkTypes;

// Must start as `false` during SSR and hydration, exactly like the Nuxt 2
// `isBrowser` data property. `import.meta.client` is already `true` on the
// first client render and would hydrate the client-only button differently.
const client = ref(false);
onMounted(() => {
  client.value = true;
});

const modeNumberLoadLimit = ref<number | undefined>(properties.loadAllModes ? undefined : 5);
const modeNumberLoadThreshold = 15;
const modeNumberLoadIncrement = 10;

const modesLimited = computed(() => properties.fixture.modes.length > modeNumberLoadThreshold);

const modes = computed(() => {
  const allModes = properties.fixture.modes;

  return modesLimited.value ? allModes.slice(0, modeNumberLoadLimit.value) : allModes;
});

const embettableVideos = computed(() => {
  const videoUrls = properties.fixture.getLinksOfType('video');
  const embettableVideoData = [];

  for (const url of videoUrls) {
    if (embettableVideoData.length === VIDEOS_TO_EMBED) {
      break;
    }

    const videoInfo = getEmbettableVideoData(url);
    if (videoInfo !== null) {
      embettableVideoData.push(videoInfo);
    }
  }

  return embettableVideoData;
});

const links = computed(() => {
  const linkList = [];

  for (const linkType of Object.keys(linksProperties)) {
    let linkDisplayNumber = 1;
    let linksOfType = properties.fixture.getLinksOfType(linkType);

    if (linkType === 'video') {
      linksOfType = linksOfType.filter(
        (url) => embettableVideos.value.every((video) => video.url !== url),
      );
      linkDisplayNumber += embettableVideos.value.length;
    }

    for (const url of linksOfType) {
      let name = linkTypeNames[linkType];
      const title = `${name} at ${url}`;

      if (linkType === 'other') {
        name = url;
      }
      else if (linkDisplayNumber > 1) {
        name += ` ${linkDisplayNumber}`;
      }

      linkList.push({
        url,
        name,
        title,
        type: linkType,
        iconName: linkTypeIconNames[linkType],
        hostname: getHostname(url),
      });

      linkDisplayNumber++;
    }
  }

  return linkList;
});

const VIDEOS_TO_EMBED = 2;

const supportedVideoFormats = {

  native: {
    regex: /\.(?:mp4|avi)$/,
    displayType: (url: string) => getHostname(url),
    videoId: (url: string, match: RegExpMatchArray | null) => url,
    startAt: (url: string, match: RegExpMatchArray | null) => 0,
  },

  youtube: {
    regex: /^https:\/\/www\.youtube\.com\/watch\?v=([\w-]+)(?:&t=([\dhms]+)|)/,
    displayType: () => 'YouTube',
    videoId: (url: string, match: RegExpMatchArray | null) => match?.[1] ?? '',
    startAt: (url: string, match: RegExpMatchArray | null) => match?.[2] ?? 0,
  },

  vimeo: {
    regex: /^https:\/\/vimeo.com\/(?:channels\/[^/]+\/|groups\/[^/]+\/videos\/)?(\d+)(?:#t=([\dhms]+))?/,
    displayType: () => 'Vimeo',
    videoId: (url: string, match: RegExpMatchArray | null) => match?.[1] ?? '',
    startAt: (url: string, match: RegExpMatchArray | null) => match?.[2] ?? 0,
  },

  facebook: {
    regex: /^https:\/\/www\.facebook\.com\/[^/]+\/videos\/[^/]+\/(\d+)\/$/,
    displayType: () => 'Facebook',
    videoId: (url: string, match: RegExpMatchArray | null) => match?.[1] ?? '',
    startAt: (url: string, match: RegExpMatchArray | null) => 0,
  },

};

/**
 * Detects a supported embeddable video URL.
 * @param url - The video URL.
 * @returns The video data, or `null` for unsupported URLs.
 */
function getEmbettableVideoData(url: string) {
  const videoTypes = Object.keys(supportedVideoFormats);

  for (const type of videoTypes) {
    const format = supportedVideoFormats[type as keyof typeof supportedVideoFormats];
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
 * Extracts the hostname from a URL.
 * @param url - The URL to inspect.
 * @returns The hostname, or the original string if parsing fails.
 */
function getHostname(url: string) {
  const match = url.match(/^.*?\/\/([^#/:?]*)(?::(\d+)|)/);
  return match ? match[1] : url;
}
</script>
