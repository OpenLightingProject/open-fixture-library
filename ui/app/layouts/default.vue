<template>
  <div
    id="ofl-root"
    :class="{
      js: isBrowser,
      'no-js': !isBrowser,
      touch: isTouchScreen,
      'no-touch': !isTouchScreen,
    }">

    <a href="#content" class="accessibility">Skip to content</a>

    <!-- <HeaderBar @focus-content="focusContent()" /> -->

    <div id="content" ref="content" tabindex="-1">
      <ClimateStrikeBanner />
      <slot />
    </div>

  </div>
</template>

<script lang="ts" setup>

const isBrowser = import.meta.client;

const isTouchScreen = ref(false);
const lastTouchTime = ref(0);
const contentRef = useTemplateRef('content')

function focusContent() {
  contentRef.value?.focus();
}

function onMouseMove() {
  // filter emulated events coming from touch events
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
  // adapted from https://stackoverflow.com/a/30303898/451391
  document.addEventListener('touchstart', onTouchStart, true);
  document.addEventListener('mousemove', onMouseMove, true);
});

onUnmounted(() => {
  document.removeEventListener('touchstart', onTouchStart, true);
  document.removeEventListener('mousemove', onMouseMove, true);
});
</script>


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
