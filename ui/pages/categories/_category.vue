<template>
  <div>
    <h1>{{ categoryName }} fixtures</h1>

    <div class="card">
      <ul class="list fixtures" :class="`category-${categoryClass}`">
        <li v-for="fixture of fixtures" :key="fixture.key">
          <NuxtLink
            :to="`/${fixture.key}`"
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
export default {
  async asyncData({ params, $axios, error }) {
    let fixtures;
    try {
      ({ fixtures } = await $axios.$get(`/api/v1/categories/${encodeURIComponent(params.category)}`));
    }
    catch (requestError) {
      return error(requestError);
    }
    return { fixtures };
  },
  head() {
    const title = this.categoryName;

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
  computed: {
    categoryName() {
      return this.$route.params.category;
    },
    categoryClass() {
      return this.categoryName.toLowerCase().replaceAll(/\W+/g, '-');
    },
  },
};
</script>
