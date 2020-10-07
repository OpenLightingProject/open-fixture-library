<template>
  <div>
    <h1>{{ categoryName }} fixtures</h1>

    <div class="card">
      <ul :class="[`list`, `fixtures`, `category-${categoryClass}`]">
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
              :class="{ inactive: cat !== categoryName, right: true }"
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
  async asyncData({ params, $axios, error }) {
    const categoryName = decodeURIComponent(params.category);

    try {
      const manufacturers = await $axios.$get(`/api/v1/manufacturers`);

      return {
        categoryName,
        categoryClass: categoryName.toLowerCase().replace(/[^\w]+/g, `-`),
        fixtures: [],
        manufacturers,
      };
    }
    catch (requestError) {
      return error(requestError);
    }
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
  created() {
    this.fixtures = register.categories[this.categoryName].map(fixtureKey => {
      const [manKey, fixKey] = fixtureKey.split(`/`);
      const manufacturerName = this.manufacturers[manKey].name;
      const fixtureName = register.filesystem[`${manKey}/${fixKey}`].name;

      return {
        key: fixtureKey,
        link: `/${fixtureKey}`,
        name: `${manufacturerName} ${fixtureName}`,
        categories: Object.keys(register.categories).filter(
          cat => register.categories[cat].includes(fixtureKey),
        ),
        color: this.manufacturers[manKey].color,
      };
    });
  },
};
</script>
