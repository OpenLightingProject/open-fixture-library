<template>
  <div>
    <h1>{{ categoryName }} fixtures</h1>

    <div class="card">
      <ul class="list fixtures" :class="`category-${categoryClass}`">
        <li v-for="fixture of fixtures" :key="fixture.key">
          <NuxtLink
            :to="fixture.link"
            :style="{ borderLeftColor: fixture.color }"
            class="manufacturer-color">
            <span class="name">{{ fixture.name }}</span>
            <OflSvg
              v-for="cat of fixture.categories"
              :key="cat"
              :name="cat"
              class="right"
              :class="{ inactive: cat !== categoryName }"
              type="fixture" />
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import register from '../../../fixtures/register.json';

export default {
  validate({ params }) {
    return decodeURIComponent(params.category) in register.categories;
  },
  async asyncData({ $axios, error }) {
    let manufacturers;
    try {
      manufacturers = await $axios.$get(`/api/v1/manufacturers`);
    }
    catch (requestError) {
      return error(requestError);
    }
    return { manufacturers };
  },
  head() {
    const title = this.categoryName;

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
  computed: {
    categoryName() {
      return this.$route.params.category;
    },
    categoryClass() {
      return this.categoryName.toLowerCase().replaceAll(/\W+/g, `-`);
    },
    fixtures() {
      return register.categories[this.categoryName].map(fullFixtureKey => {
        const [manufacturerKey, fixtureKey] = fullFixtureKey.split(`/`);
        const manufacturerName = this.manufacturers[manufacturerKey].name;
        const fixtureName = register.filesystem[`${manufacturerKey}/${fixtureKey}`].name;

        return {
          key: fullFixtureKey,
          link: `/${fullFixtureKey}`,
          name: `${manufacturerName} ${fixtureName}`,
          categories: Object.keys(register.categories).filter(
            category => register.categories[category].includes(fullFixtureKey),
          ),
          color: this.manufacturers[manufacturerKey].color,
        };
      });
    },
  },
};
</script>
