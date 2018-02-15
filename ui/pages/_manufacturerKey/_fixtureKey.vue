<template>
  <div>
    <h1><nuxt-link :to="`/${fixture.manufacturer.key}`">{{ fixture.manufacturer.name }}</nuxt-link> {{ fixture.name }}</h1>
  </div>
</template>

<script>
import svg from '~/components/svg.vue';

import register from '~~/fixtures/register.json';

import Fixture from '~~/lib/model/Fixture.mjs';

export default {
  components: {
    'app-svg': svg
  },
  validate({ params }) {
    return `${params.manufacturerKey}/${params.fixtureKey}` in register.filesystem;
  },
  async asyncData({ params, app }) {
    const manKey = params.manufacturerKey;
    const fixKey = params.fixtureKey;

    const fixtureJson = await app.$axios.$get(`/${manKey}/${fixKey}.json`);

    return {
      manKey,
      fixKey,
      fixtureJson
    };
  },
  computed: {
    fixture() {
      return new Fixture(this.manKey, this.fixKey, this.fixtureJson);
    }
  },
  head() {
    return {
      title: `${this.fixture.manufacturer.name} ${this.fixture.name}`
    };
  }
};
</script>
