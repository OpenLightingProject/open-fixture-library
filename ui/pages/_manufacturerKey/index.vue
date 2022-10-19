<template>
  <div>
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
export default {
  async asyncData({ params, $axios, error }) {
    let manufacturer;
    try {
      manufacturer = await $axios.$get(`/api/v1/manufacturers/${params.manufacturerKey}`);
    }
    catch (requestError) {
      return error(requestError);
    }
    return { manufacturer };
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
      script: [
        {
          hid: `organizationStructuredData`,
          type: `application/ld+json`,
          json: this.organizationStructuredData,
        },
        {
          hid: `itemListStructuredData`,
          type: `application/ld+json`,
          json: this.itemListStructuredData,
        },
      ],
    };
  },
  computed: {
    fixtures() {
      return this.manufacturer.fixtures;
    },
    organizationStructuredData() {
      return {
        '@context': `http://schema.org`,
        '@type': `Organization`,
        name: this.manufacturer.name,
        brand: this.manufacturer.name,
        sameAs: `website` in this.manufacturer ? this.manufacturer.website : undefined,
      };
    },
    itemListStructuredData() {
      return {
        '@context': `http://schema.org`,
        '@type': `ItemList`,
        itemListElement: this.fixtures.map((fixture, index) => ({
          '@type': `ListItem`,
          position: index + 1,
          url: `${this.$config.websiteUrl}${this.manufacturer.key}/${fixture.key}`,
        })),
      };
    },
  },
};
</script>
