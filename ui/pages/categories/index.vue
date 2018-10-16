<template>
  <div>
    <h1>Categories</h1>

    <div class="categories grid-3">
      <nuxt-link
        v-for="category in categories"
        :key="category.name"
        :to="`/categories/${encodeURIComponent(category.name)}`"
        class="card card-category">
        <app-svg :name="category.name" type="category" />
        <h2>{{ category.name }}</h2>
        <div class="fixtures">{{ category.fixtureCount }} fixture{{ category.fixtureCount === 1 ? `` : `s` }}</div>
      </nuxt-link>
    </div>
  </div>
</template>

<script>
import svg from '~/components/svg.vue';

import register from '~~/fixtures/register.json';

export default {
  components: {
    'app-svg': svg
  },
  head() {
    return {
      title: `Categories`
    };
  },
  data() {
    return {
      categories: Object.keys(register.categories).sort((a, b) => a.localeCompare(b, `en`)).map(
        catName => ({
          name: catName,
          fixtureCount: register.categories[catName].length
        })
      )
    };
  }
};
</script>
