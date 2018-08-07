<template>
  <div>
    <script type="application/ld+json" v-html="organizationStructuredData" />
    <script type="application/ld+json" v-html="itemListStructuredData" />

    <h1>{{ manufacturer.name }} fixtures</h1>

    <div v-if="`website` in manufacturer || `rdmId` in manufacturer" class="grid list">
      <a
        v-if="`website` in manufacturer"
        :href="manufacturer.website"
        class="card blue dark">
        <app-svg name="web" class="left" />
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

    <p v-if="`comment` in manufacturer" class="comment" style="white-space: pre-wrap;">{{ manufacturer.comment }}</p>

    <ul :class="[`card`, `list`, `fixtures`]">
      <li v-for="fixture in fixtures" :key="fixture.key">
        <nuxt-link :to="fixture.link">
          <span class="name">{{ fixture.name }}</span>
          <app-svg
            v-for="cat in fixture.categories"
            :key="cat"
            :name="cat"
            type="category"
            class="right inactive" />
        </nuxt-link>
      </li>
    </ul>
  </div>
</template>

<script>
import svg from '~/components/svg.vue';

import packageJson from '~~/package.json';
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
    const manufacturer = manufacturers[manKey];

    const fixtures = (register.manufacturers[manKey] || []).map(
      fixKey => ({
        key: fixKey,
        link: `/${manKey}/${fixKey}`,
        name: register.filesystem[`${manKey}/${fixKey}`].name,
        categories: Object.keys(register.categories).filter(
          cat => register.categories[cat].includes(`${manKey}/${fixKey}`)
        )
      })
    );

    const organizationStructuredData = {
      '@context': `http://schema.org`,
      '@type': `Organization`,
      'name': manufacturer.name,
      'brand': manufacturer.name
    };

    if (`website` in manufacturer) {
      organizationStructuredData.sameAs = manufacturer.website;
    }

    const itemListStructuredData = {
      '@context': `http://schema.org`,
      '@type': `ItemList`,
      'itemListElement': fixtures.map((fix, index) => ({
        '@type': `ListItem`,
        'position': index + 1,
        'url': `${packageJson.homepage}${fix.link}`
      }))
    };

    return {
      manufacturer,
      fixtures,
      organizationStructuredData,
      itemListStructuredData
    };
  },
  head() {
    return {
      title: this.manufacturer.name
    };
  }
};
</script>
