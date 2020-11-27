<template>
  <div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <script type="application/ld+json" v-html="organizationStructuredData" />

    <!-- eslint-disable-next-line vue/no-v-html -->
    <script type="application/ld+json" v-html="itemListStructuredData" />

    <h1>{{ manufacturer.name }} fixtures</h1>

    <div v-if="`website` in manufacturer || `rdmId` in manufacturer" class="grid-3">
      <a
        v-if="`website` in manufacturer"
        :href="manufacturer.website"
        class="card slim blue dark">
        <OflSvg name="web" class="left" />
        <span>Manufacturer website</span>
      </a>
      <a
        v-if="`rdmId` in manufacturer"
        :href="`http://rdm.openlighting.org/manufacturer/display?manufacturer=${manufacturer.rdmId}`"
        rel="nofollow"
        class="card slim">
        <OflSvg name="ola" class="left" />
        <span>Open Lighting RDM database</span>
      </a>
    </div>

    <p v-if="`comment` in manufacturer" class="comment" style="white-space: pre-wrap;">{{ manufacturer.comment }}</p>

    <div class="card">
      <ul class="list fixtures">
        <li v-for="fixture of fixtures" :key="fixture.key">
          <NuxtLink
            :to="`/${manufacturer.key}/${fixture.key}`"
            :style="{ borderLeftColor: manufacturer.color }"
            class="manufacturer-color">
            <span class="name">{{ fixture.name }}</span>
            <OflSvg
              v-for="cat of fixture.categories"
              :key="cat"
              :name="cat"
              type="fixture"
              class="right inactive" />
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import packageJson from '../../../package.json';

export default {
  async asyncData({ params, $axios, error }) {
    const manufacturerKey = params.manufacturerKey;

    try {
      const manufacturer = await $axios.$get(`/api/v1/manufacturers/${manufacturerKey}`);
      const fixtures = manufacturer.fixtures;

      const organizationStructuredData = {
        '@context': `http://schema.org`,
        '@type': `Organization`,
        'name': manufacturer.name,
        'brand': manufacturer.name,
      };

      if (`website` in manufacturer) {
        organizationStructuredData.sameAs = manufacturer.website;
      }

      const itemListStructuredData = {
        '@context': `http://schema.org`,
        '@type': `ItemList`,
        'itemListElement': fixtures.map((fixture, index) => ({
          '@type': `ListItem`,
          'position': index + 1,
          'url': `${packageJson.homepage}/${manufacturer.key}/${fixture.key}`,
        })),
      };

      return {
        manufacturer,
        fixtures,
        organizationStructuredData,
        itemListStructuredData,
      };
    }
    catch (requestError) {
      return error(requestError);
    }
  },
  head() {
    const title = this.manufacturer.name;

    return {
      title,
      meta: [
        {
          hid: `title`,
          content: title,
        },
      ],
    };
  },
};
</script>
