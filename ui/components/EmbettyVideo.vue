<template>
  <div class="embetty-video">
    <div v-if="!playing" class="poster-wrapper" @click="play()">
      <img
        v-if="posterUrl"
        :src="posterUrl"
        :alt="`Video thumbnail for ${type} video ${videoId}`"
        class="poster" />
      <div class="play-button" aria-label="Play video">
        <OflSvg name="youtube" />
      </div>
    </div>
    <iframe
      v-else
      :src="embedUrl"
      allow="autoplay; encrypted-media"
      allowfullscreen
      class="video-frame" />
  </div>
</template>

<style lang="scss" scoped>
.embetty-video {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; // 16:9

  .poster-wrapper,
  .video-frame {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  .poster {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .play-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 68px;
    height: 48px;
    background: rgba(0, 0, 0, 70%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    .icon {
      width: 32px;
      height: 32px;
      fill: white;
    }
  }
}
</style>

<script>
export default {
  props: {
    type: {
      type: String,
      required: true,
    },
    videoId: {
      type: String,
      required: true,
    },
    startAt: {
      type: Number,
      default: 0,
    },
    serverUrl: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      playing: false,
    };
  },
  computed: {
    posterUrl() {
      if (this.serverUrl) {
        return `${this.serverUrl}/${this.type}/${this.videoId}/poster-image`;
      }
      if (this.type === 'youtube') {
        return `https://img.youtube.com/vi/${this.videoId}/hqdefault.jpg`;
      }
      return null;
    },
    embedUrl() {
      if (this.type === 'youtube') {
        const params = new URLSearchParams({ autoplay: '1' });
        if (this.startAt) {
          params.set('start', String(this.startAt));
        }
        return `https://www.youtube-nocookie.com/embed/${this.videoId}?${params.toString()}`;
      }
      if (this.type === 'vimeo') {
        const params = new URLSearchParams({ autoplay: '1' });
        if (this.startAt) {
          params.set('t', String(this.startAt));
        }
        return `https://player.vimeo.com/video/${this.videoId}?${params.toString()}`;
      }
      return '';
    },
  },
  methods: {
    play() {
      this.playing = true;
    },
  },
};
</script>
