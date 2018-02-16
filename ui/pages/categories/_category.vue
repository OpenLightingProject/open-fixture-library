<template>
  <div>
    <h1>{{ categoryName }} fixtures</h1>

    <ul :class="[`card`, `list`, `fixtures`, `category-${categoryClass}`]">
      <li v-for="fixture in fixtures" :key="fixture.key">
        <nuxt-link :to="fixture.link">
          <span class="name">{{ fixture.name }}</span>
          <app-svg
            v-for="cat in fixture.categories"
            :key="cat"
            type="category"
            :name="cat"
            :class="{ inactive: cat !== categoryName, right: true }" />
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
    return decodeURIComponent(params.category) in register.categories;
  },
  async asyncData({ params }) {
    const categoryName = decodeURIComponent(params.category);
    return {
      categoryName: categoryName,
      categoryClass: categoryName.toLowerCase().replace(/[^\w]+/g, `-`),
      fixtures: register.categories[categoryName].map(
        fixKey => ({
          key: fixKey,
          link: `/${fixKey}`,
          name: getFixtureName(fixKey),
          categories: Object.keys(register.categories).filter(
            cat => register.categories[cat].includes(fixKey)
          )
        })
      )
    };
  },
  head() {
    return {
      title: this.categoryName
    };
  }
};

/**
 * @param {!string} fixtureKey The combined manufacturer / fixture key.
 * @returns {!string} The manufacturer and fixture names, separated by a space.
 */
function getFixtureName(fixtureKey) {
  const manKey = fixtureKey.split(`/`)[0];
  const manufacturerName = manufacturers[manKey].name;
  const fixtureName = register.filesystem[fixtureKey].name;

  return `${manufacturerName} ${fixtureName}`;
}
</script>
