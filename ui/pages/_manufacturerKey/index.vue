<template>
  <div>
    <h1>{{ manufacturer.name }} fixtures</h1>

    <div v-if="`website` in manufacturer || `rdmId` in manufacturer" class="grid list">
      <a
        v-if="`website` in manufacturer"
        :href="manufacturer.website"
        rel="nofollow"
        class="card blue dark">
        <app-svg name="earth" class="left" />
        <span>Manufacturer website</span>
      </a>
      <a
        v-if="`rdmId` in manufacturer"
        :href="`http://rdm.openlighting.org/manufacturer/display?manufacturer=${manufacturer.rdmId}`"
        rel="nofollow"
        class="card">
        <app-svg name="ola" class="left" />
        <span>Open Lighting RDM database</span>
      </a>
    </div>

    <p v-if="`comment` in manufacturer" class="comment" style="white-space: pre;">{{ manufacturer.comment }}</p>

    <ul :class="[`card`, `list`, `fixtures`]">
      <li v-for="fixture in fixtures" :key="fixture.key">
        <nuxt-link :to="fixture.link">
          <span class="name">{{ fixture.name }}</span>
          <app-svg
            v-for="cat in fixture.categories"
            :key="cat"
            type="category"
            :name="cat" />
        </nuxt-link>
      </li>
    </ul>
  </div>
</template>

<script>
import svg from '~/components/svg.vue';

import register from '~~/fixtures/register.json';
import manufacturers from '~~/fixtures/manufacturers.json';

export default {
  components: {
    'app-svg': svg
  },
  validate({ params }) {
    return params.manufacturerKey in manufacturers && params.manufacturerKey !== `$schema`;
  },
  async asyncData({ params }) {
    const manKey = params.manufacturerKey;
    return {
      manufacturer: manufacturers[manKey],
      fixtures: (register.manufacturers[manKey] || []).map(
        fixKey => ({
          key: fixKey,
          link: `/${manKey}/${fixKey}`,
          name: register.filesystem[`${manKey}/${fixKey}`].name,
          categories: Object.keys(register.categories).filter(
            cat => register.categories[cat].includes(fixKey)
          )
        })
      )
    };
  },
  head() {
    return {
      title: this.manufacturer.name
    };
  }
};
</script>
