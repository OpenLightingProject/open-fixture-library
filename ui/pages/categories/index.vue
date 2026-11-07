<template>
  <div>
    <h1>Categories</h1>

    <div class="categories grid-3">
      <NuxtLink
        v-for="category of categories"
        :key="category.name"
        :to="`/categories/${encodeURIComponent(category.name)}`"
        class="card card-category">
        <OflSvg :name="category.name" type="fixture" />
        <h2>{{ category.name }}</h2>
        <div class="fixtures">{{ category.fixtureCount }} fixture{{ category.fixtureCount === 1 ? `` : `s` }}</div>
      </NuxtLink>
    </div>
  </div>
</template>

<script>
export default {
  async asyncData({ $axios, error }) {
    let categories;
    try {
      categories = await $axios.$get('/api/v1/categories');
    }
    catch (requestError) {
      return error(requestError);
    }
    return { categories };
  },
  head() {
    const title = 'Categories';

    return {
      title,
      meta: [
        {
          hid: 'title',
          content: title,
        },
      ],
    };
  },
};
</script>
