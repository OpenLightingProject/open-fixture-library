<template>
  <div class="embetty-video">
    <div v-if="activated" class="wrapper default-height">
      <!-- eslint-disable-next-line vuejs-accessibility/media-has-caption -- fixture videos have no caption tracks -->
      <video
        v-if="video.type === 'native'"
        autoplay
        controls>
        <source :src="video.videoId">
      </video>
      <iframe
        v-else
        :src="embedUrl ?? undefined"
        :title="`${video.displayType} video`"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen />
    </div>

    <template v-else>
      <button
        type="button"
        class="playbutton"
        @click="activated = true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="72"
          height="72"
          viewBox="0 0 48 48"
          fill="#fff">
          <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm-4 29V15l12 9-12 9z" />
        </svg>
      </button>
      <div
        class="poster default-height"
        :style="posterStyle" />
      <a
        href="https://www.heise.de/embetty"
        target="_blank"
        rel="noopener"
        class="powered-by"
        title="embetty - displaying remote content without compromising your privacy.">
        powered by
      </a>
    </template>
  </div>
</template>

<style scoped lang="scss">
.embetty-video {
  position: relative;
  box-sizing: border-box;
  display: block;
  max-width: 100%;
  overflow: hidden;
  font-family: var(--embetty-font-family, Helvetica, Roboto, "Segoe UI", Calibri, sans-serif);
  font-size: 16px;
  line-height: 1;
  border: 1px solid var(--embetty-border-color, #cccccc);
  border-radius: 4px;
}

.poster,
.wrapper {
  position: relative;
  overflow: hidden;
  background: no-repeat center black;
  background-size: cover;

  &.default-height {
    height: 0;
    padding-top: 56.25%;
  }
}

.playbutton {
  position: absolute;
  z-index: 1;
  box-sizing: border-box;
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  cursor: pointer;
  outline: 0;
  background: linear-gradient(rgba(0, 0, 0, 20%), rgba(0, 0, 0, 80%));
  border: 0;
  opacity: 0.9;
  transition: opacity 0.15s;

  &:hover,
  &:focus {
    opacity: 1;
  }
}

.powered-by {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 3;
  padding: 20px 10px 5px 20px;
  font-size: 14px;
  color: #ffffff;
  text-decoration: none;
  opacity: 0.6;

  &::after {
    content: " embetty";
  }

  &:hover,
  &:focus {
    opacity: 1;
  }
}

.wrapper :is(iframe, video) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>

<script setup lang="ts">
interface Video {
  url: string;
  type: string;
  displayType: string;
  videoId: string;
  startAt: number | string;
}

const properties = defineProps<{
  video: Video;
}>();

const config = useRuntimeConfig();
const embettyServerUrl = config.public.embettyServerUrl.replace(/\/+$/, '');

const activated = ref(false);

const posterUrl = computed(() => (properties.video.type === 'native'
  ? null
  : `${embettyServerUrl}/video/${properties.video.type}/${properties.video.videoId}-poster-image`));

const posterStyle = computed(() => (posterUrl.value ? { backgroundImage: `url(${posterUrl.value})` } : {}));

const startAtSeconds = computed(() => {
  if (typeof properties.video.startAt === 'number') {
    return properties.video.startAt;
  }

  const match = properties.video.startAt.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/);
  const hours = Number(match?.[1] ?? 0);
  const minutes = Number(match?.[2] ?? 0);
  const seconds = Number(match?.[3] ?? 0);

  return hours * 3600 + minutes * 60 + seconds;
});

const embedUrl = computed(() => {
  switch (properties.video.type) {
    case 'youtube': {
      return `https://www.youtube-nocookie.com/embed/${properties.video.videoId}?autoplay=1&start=${startAtSeconds.value}`;
    }

    case 'vimeo': {
      return `https://player.vimeo.com/video/${properties.video.videoId}?autoplay=1#t=${startAtSeconds.value}`;
    }

    case 'facebook': {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(properties.video.url)}&show_text=0&autoplay=1&mute=0`;
    }

    default: {
      return null;
    }
  }
});
</script>
