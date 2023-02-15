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

    <HeaderBar @focus-content="focusContent()" />

    <div id="content" ref="content" tabindex="-1">
      <ClimateStrikeBanner />
      <Nuxt />
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


<script>
import ClimateStrikeBanner from '../components/ClimateStrikeBanner.vue';
import HeaderBar from '../components/HeaderBar.vue';

export default {
  components: {
    HeaderBar,
    ClimateStrikeBanner,
  },
  data() {
    return {
      isBrowser: false,
      isTouchScreen: false,
      lastTouchTime: 0,
    };
  },
  mounted() {
    this.isBrowser = true;

    // adapted from https://stackoverflow.com/a/30303898/451391
    document.addEventListener(`touchstart`, this.onTouchStart, true);
    document.addEventListener(`mousemove`, this.onMouseMove, true);
  },
  beforeDestroy() {
    document.removeEventListener(`touchstart`, this.onTouchStart, true);
    document.removeEventListener(`mousemove`, this.onMouseMove, true);
  },
  methods: {
    focusContent() {
      this.$refs.content.focus();
    },

    onMouseMove() {
      // filter emulated events coming from touch events
      if (Date.now() - this.lastTouchTime < 500) {
        return;
      }

      this.isTouchScreen = false;
    },

    onTouchStart() {
      this.isTouchScreen = true;
      this.lastTouchTime = Date.now();
    },
  },
};
</script>
