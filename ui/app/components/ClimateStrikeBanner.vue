<template>
  <div v-if="isClimateStrike" id="climate-strike-overlay" class="climate-strike">

    <h1>
      The Open Fixture Library joins the
      <a :href="climateStrikeWebsite">Global Climate Strike</a>
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
        <a v-for="hashtag of hashtags" :key="hashtag" :href="`https://mastodon.social/tags/${hashtag}`">#{{ hashtag }}</a>
      </div>
    </div>

  </div>
  <div v-else-if="showClimateStrikeBanner" id="climate-strike-banner" class="climate-strike">

    We are joining the <a :href="climateStrikeWebsite" target="_blank" rel="noopener">Global Climate Strike</a>,
    so this website will not be available on {{ strikeDateString }}.<br>
    Learn more at <a href="https://fridaysforfuture.org/" target="_blank" rel="noopener">fridaysforfuture.org</a>.

  </div>
</template>

<style lang="scss" scoped>
.climate-strike {
  color: #ffffff;
  text-align: center;

  a {
    color: #ffffff;
    text-decoration: underline;
    text-decoration-color: rgba(#ffffff, 60%);

    &:hover,
    &:focus {
      opacity: 0.8;
    }
  }
}

#climate-strike-banner {
  padding: 0.5em;
  line-height: 1.7;
  background: #1b7340;
  border: 0.5em solid #1da64a;
}

#climate-strike-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  overflow: auto;
  background: #1b7340;

  h1 {
    box-sizing: border-box;
    padding: 0.5em 1em;
    margin: 2.5em 0 1em;
    font-weight: 700;
    line-height: 1.2;
    text-shadow: 0 0 5px rgba(#1b7340, 50%);
    background: #1da64a;
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

  & > div {
    h2 {
      margin: 2em 10px 10px;
      font-weight: 700;
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
      font-weight: 400;
    }
  }
}
</style>

<script setup lang="ts">
// Static-ish config (could be props if needed)
const strikeDateString = ref('2023-09-15');
const climateStrikeWebsite = ref('https://fridaysforfuture.org/september15/');
const hashtags = ref([
  'climatejustice',
  'FridaysForFuture',
  'climatestrike',
  'EndFossilFuels',
  'ClimateForChange',
]);

// Reactive state
const isClimateStrike = ref(false);
const showClimateStrikeBanner = ref(false);

// Compute dates once on setup
{
  const strikeDate = new Date(strikeDateString.value);
  strikeDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bannerStartDate = new Date(strikeDate);
  bannerStartDate.setDate(strikeDate.getDate() - 14);

  isClimateStrike.value = strikeDate.getTime() === today.getTime();
  showClimateStrikeBanner.value =
    bannerStartDate.getTime() <= today.getTime() && today.getTime() < strikeDate.getTime();
}

onMounted(() => {
  if (isClimateStrike.value) {
    document.documentElement.style.overflow = 'hidden';
  }
});
</script>
