<template>
  <div>
    <h1>{{ categoryName }} fixtures</h1>

    <div class="card">
      <ul :class="[`list`, `fixtures`, `category-${categoryClass}`]">
        <li v-for="fixture in fixtures" :key="fixture.key">
          <NuxtLink
            :to="fixture.link"
            :style="{ borderLeftColor: fixture.color }"
            class="manufacturer-color">
            <span class="name">{{ fixture.name }}</span>
            <OflSvg
              v-for="cat in fixture.categories"
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
import manufacturers from '../../../fixtures/manufacturers.json';

export default {
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
    const title = this.categoryName;

    return {
      title,
      meta: [
        {
          hid: `title`,
          content: title
        }
      ]
    };
  }
};

/**
 * @param {String} manKey The manufacturer key.
 * @param {String} fixKey The fixture key.
 * @returns {String} The manufacturer and fixture names, separated by a space.
 */
function getFixtureName(manKey, fixKey) {
  const manufacturerName = manufacturers[manKey].name;
  const fixtureName = register.filesystem[`${manKey}/${fixKey}`].name;

  return `${manufacturerName} ${fixtureName}`;
}
</script>
