<template>
  <div v-if="isClimateStrike" id="climate-strike">

    <h1>
      The Open Fixture Library joins the
      <a href="https://globalclimatestrike.net/">Global Climate Strike</a>
      and is therefore not available today.
    </h1>

    <div>
      <h2>Why should this affect me?</h2>
      <p>Because climate change affects everyone.</p>

      <h2>When is OFL back again?</h2>
      <p>
        The global climate strike takes place on {{ strikeDateString }}.<br>
        After that day, OFL is back to normal again.
      </p>

      <h2>Where can I learn more?</h2>
      <p>
        Go to <a href="https://globalclimatestrike.net/">globalclimatestrike.net</a>
        or <a href="https://www.fridaysforfuture.org/">fridaysforfuture.org</a>.
      </p>

      <div class="hashtags">
        <a href="https://twitter.com/hashtag/fridaysforfuture">#fridaysforfuture</a>
        <a href="https://twitter.com/hashtag/climatestrike">#climatestrike</a>
      </div>
    </div>

  </div>

  <div
    v-else
    id="ofl-root"
    :class="{
      js: isBrowser,
      'no-js': !isBrowser,
      touch: isTouchScreen,
      'no-touch': !isTouchScreen
    }">

    <a href="#content" class="accessibility">Skip to content</a>

    <HeaderBar @focus-content="focusContent" />

    <div id="content" ref="content" tabindex="-1">
      <div v-if="showClimateStrikeBanner" id="climate-strike-banner">
        We are joining the global climate strike, so this website will
        not be available on {{ strikeDateString }}.<br>
        Learn more at
        <a href="https://globalclimatestrike.net/">globalclimatestrike.net</a>
        or <a href="https://www.fridaysforfuture.org/">fridaysforfuture.org</a>.
      </div>
      <Nuxt />
    </div>

  </div>
</template>

<style lang="scss" scoped>
#climate-strike {
  background: #1b7340;
  color: #fff;
  box-sizing: border-box;
  min-height: 100vh;
  padding-bottom: 30px;
  overflow: hidden;
  text-shadow: 0 0 5px rgba(#1b7340, 0.5);

  h1 {
    background: #1da64a;
    text-align: center;
    padding: 0.5em 1em;
    box-sizing: border-box;
    width: calc(100% + 1em);
    margin: 2em -0.5em 1em;
    font-weight: 700;
    line-height: 1.2;
    transform: rotate(-2.5deg);

    a {
      display: block;
      font-size: 1.8em;
      text-transform: uppercase;
    }

    @media (max-width: $phone) {
      font-size: 1.5em;
    }
  }

  a {
    color: #fff;
    text-decoration: underline;
    text-decoration-color: rgba(#fff, 0.6);
  }

  a:hover,
  a:focus {
    opacity: 0.8;
  }

  & > div {
    text-align: center;

    h2 {
      font-weight: 700;
      margin: 2em 10px 10px;
      line-height: 1.2;
    }

    p {
      margin: 10px;
    }
  }

  .hashtags {
    margin-top: 3em;
    font-size: 1.5em;

    a {
      display: inline-block;
      padding: 0 4px;
      margin: 4px;
      font-family: $font-stack-code;
    }
  }
}

#climate-strike-banner {
  text-align: center;
  border: 0.5em solid #1da64a;
  background: #1b7340;
  padding: 0.5em;
  color: #fff;
  line-height: 1.7;

  a {
    color: #fff;
    text-decoration: underline;
    text-decoration-color: rgba(#fff, 0.6);

    &:hover, &:focus {
      opacity: 0.8;
    }
  }
}

.accessibility {
  position: absolute;
  top: -1000px;
  left: -1000px;
  height: 1px;
  width: 1px;
  overflow: hidden;
  z-index: 9999;

  &:active,
  &:focus,
  &:hover {
    left: 0;
    top: 0;
    width: auto;
    height: auto;
    overflow: visible;
    background: red;
    color: #fff;
    padding: 4px;
  }
}

#content {
  max-width: 1000px;
  margin: 0 auto;
  min-height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
  padding: 5em 10px 10px;

  @media (max-width: $tablet) {
    padding-top: 6.2em;
  }
}
#content:focus {
  outline: 0;
}
</style>


<script>
import HeaderBar from '../components/HeaderBar.vue';

export default {
  components: {
    HeaderBar
  },
  data() {
    return {
      isBrowser: false,
      isTouchScreen: false,
      lastTouchTime: 0,
      isClimateStrike: false,
      showClimateStrikeBanner: false,
      strikeDateString: `2019-11-29`
    };
  },
  created() {
    const climateStrikeDate = new Date(this.strikeDateString);
    const today = new Date();

    this.isClimateStrike = climateStrikeDate.getDate() === today.getDate() &&
      climateStrikeDate.getMonth() === today.getMonth() &&
      climateStrikeDate.getFullYear() === today.getFullYear();

    this.showClimateStrikeBanner = climateStrikeDate.getDate() >= today.getDate() &&
      climateStrikeDate.getMonth() >= today.getMonth() &&
      climateStrikeDate.getFullYear() >= today.getFullYear();
  },
  mounted() {
    if (process.browser) {
      this.isBrowser = true;

      // adapted from https://stackoverflow.com/a/30303898/451391
      document.addEventListener(`touchstart`, this.onTouchStart, true);
      document.addEventListener(`mousemove`, this.onMouseMove, true);
    }
  },
  beforeDestroy() {
    if (process.browser) {
      document.removeEventListener(`touchstart`, this.onTouchStart, true);
      document.removeEventListener(`mousemove`, this.onMouseMove, true);
    }
  },
  methods: {
    focusContent() {
      this.$refs.content.focus();
    },

    onMouseMove() {
      // filter emulated events coming from touch events
      if (new Date() - this.lastTouchTime < 500) {
        return;
      }

      this.isTouchScreen = false;
    },

    onTouchStart() {
      this.isTouchScreen = true;
      this.lastTouchTime = new Date();
    }
  }
};
</script>
