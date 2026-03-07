<template>
  <div
    id="ofl-root"
    :class="{
      js: client,
      'no-js': !client,
      touch: isTouchScreen,
      'no-touch': !isTouchScreen,
    }">

    <NuxtLoadingIndicator color="#1e88e5" />

    <a href="#content" class="accessibility"> Skip to content</a>

    <HeaderBar @focus-content="focusContent()" />

    <div id="content" ref="contentRef" tabindex="-1">
      <ClimateStrikeBanner />
      <slot />
    </div>

  </div>
</template>

<style lang="scss" scoped>
.accessibility {
  position: absolute;
  top: -1000px;
  left: -1000px;
  z-index: 9999;
  width: 1px;
  height: 1px;
  overflow: hidden;

  &:active,
  &:focus,
  &:hover {
    top: 0;
    left: 0;
    width: auto;
    height: auto;
    padding: 4px;
    overflow: visible;
    color: #ffffff;
    background: red;
  }
}

#content {
  box-sizing: border-box;
  max-width: 1000px;
  min-height: 100vh;
  padding: 5em 10px 10px;
  margin: 0 auto;
  overflow: hidden;

  @media (max-width: $tablet) {
    padding-top: 6.2em;
  }
}

#content:focus {
  outline: 0;
}
</style>

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} – Open Fixture Library` : 'Open Fixture Library';
  },
});

<script setup lang="ts">
useSeoMeta({
  twitterCard: 'summary',
  ogSiteName: 'Open Fixture Library',
  ogLocale: 'en_US',
  ogType: 'website',
  ogDescription: 'Create and browse fixture definitions for lighting equipment online and download them in the right format for your DMX control software!',
  ogImage: 'https://open-fixture-library.org/open-graph.png',
  ogImageType: 'image/png',
  ogImageWidth: 1280,
  ogImageHeight: 640,
});

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} – Open Fixture Library` : 'Open Fixture Library';
  },
});

const client = import.meta.client;
const isTouchScreen = ref(false);
const lastTouchTime = ref(0);
const contentRef = ref<HTMLElement | null>(null);

function focusContent() {
  contentRef.value?.focus();
}

function onMouseMove() {
  if (Date.now() - lastTouchTime.value < 500) {
    return;
  }

  isTouchScreen.value = false;
}

function onTouchStart() {
  isTouchScreen.value = true;
  lastTouchTime.value = Date.now();
}

onMounted(() => {
  document.addEventListener('touchstart', onTouchStart, true);
  document.addEventListener('mousemove', onMouseMove, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('touchstart', onTouchStart, true);
  document.removeEventListener('mousemove', onMouseMove, true);
});
</script>
