<template>
  <EmbettyVideo
    :type="video.type"
    :video-id="video.videoId"
    :start-at="video.startAt"
    server-url="https://embetty.open-fixture-library.org" />
</template>

<script setup lang="ts">
import { EmbettyVideo } from 'embetty-vue-3';

interface Video {
  url: string;
  type: string;
  videoId: string;
  startAt: number;
  displayType: string;
}

defineProps<{
  video: Video;
}>();
</script>
