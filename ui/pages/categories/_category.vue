<template>
  <div>
    <h1>{{ categoryName }} fixtures</h1>

    <ul :class="[`card`, `list`, `fixtures`, `category-${categoryClass}`]">
      <li v-for="fixture in fixtures" :key="fixture.key">
        <nuxt-link
          :to="fixture.link"
          :style="{ borderLeftColor: fixture.color }"
          class="manufacturer-color">
          <span class="name">{{ fixture.name }}</span>
          <app-svg
            v-for="cat in fixture.categories"
            :key="cat"
            :name="cat"
            :class="{ inactive: cat !== categoryName, right: true }"
            type="category" />
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
  asyncData({ params }) {
    const categoryName = decodeURIComponent(params.category);

    return {
      categoryName: categoryName,
      categoryClass: categoryName.toLowerCase().replace(/[^\w]+/g, `-`),
      fixtures: register.categories[categoryName].map(fixtureKey => {
        const [manKey, fixKey] = fixtureKey.split(`/`);

        return {
          key: fixtureKey,
          link: `/${fixtureKey}`,
          name: getFixtureName(manKey, fixKey),
          categories: Object.keys(register.categories).filter(
            cat => register.categories[cat].includes(fixtureKey)
          ),
          color: register.colors[manKey]
        };
      })
    };
  },
  head() {
    return {
      title: this.categoryName
    };
  }
};

/**
 * @param {string} manKey The manufacturer key.
 * @param {string} fixKey The fixture key.
 * @returns {string} The manufacturer and fixture names, separated by a space.
 */
function getFixtureName(manKey, fixKey) {
  const manufacturerName = manufacturers[manKey].name;
  const fixtureName = register.filesystem[`${manKey}/${fixKey}`].name;

  return `${manufacturerName} ${fixtureName}`;
}
</script>
