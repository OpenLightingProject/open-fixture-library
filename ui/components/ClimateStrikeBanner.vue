<template>
  <div v-if="isClimateStrike" id="climate-strike-overlay">

    <h1>
      The Open Fixture Library joins the
      <a href="https://fridaysforfuture.org/september25/">Global Day of Climate Action</a>
      and is therefore not available today.
    </h1>

    <div>
      <h2>Why should this affect me?</h2>
      <p>
        Because climate change affects everyone. Please read the
        <a href="https://fridaysforfuture.org/take-action/reasons-to-strike/">reasons to strike</a>.
      </p>

      <h2>When is OFL back again?</h2>
      <p>
        The global climate strike takes place on {{ strikeDateString }}.<br>
        After that day, OFL is back to normal again.
      </p>

      <h2>Where can I learn more?</h2>
      <p>Please refer to the <a href="https://fridaysforfuture.org/">Fridays for Future website</a>.</p>

      <div class="hashtags">
        <a href="https://twitter.com/hashtag/GlobalClimateAction2020">#GlobalClimateAction2020</a>
        <a href="https://twitter.com/hashtag/fridaysforfuture">#fridaysforfuture</a>
        <a href="https://twitter.com/hashtag/climatestrike">#climatestrike</a>
      </div>
    </div>

  </div>
  <div v-else-if="showClimateStrikeBanner" id="climate-strike-banner">

    We are joining the <a href="https://twitter.com/hashtag/GlobalClimateAction2020" target="_blank">#GlobalClimateAction2020</a>,
    so this website will not be available on {{ strikeDateString }}.<br>
    Learn more at <a href="https://www.fridaysforfuture.org/" target="_blank">fridaysforfuture.org</a>.

  </div>
</template>

<style lang="scss" scoped>
#climate-strike-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  overflow: auto;
  background: #1b7340;
  color: #fff;
  text-shadow: 0 0 5px rgba(#1b7340, 0.5);

  h1 {
    background: #1da64a;
    text-align: center;
    padding: 0.5em 1em;
    box-sizing: border-box;
    margin: 2.5em 0 1em;
    font-weight: 700;
    line-height: 1.2;
    transform: skewY(-2.5deg);

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
    margin: 3em 0 30px;
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
</style>

<script>
export default {
  data() {
    return {
      isClimateStrike: false,
      showClimateStrikeBanner: false,
      strikeDateString: `2020-09-25`,
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
    if (this.isClimateStrike) {
      document.documentElement.style.overflow = `hidden`;
    }
  },
};
</script>

