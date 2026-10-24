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

<script setup lang="ts">
const route = useRoute();

const categoryName = computed(() => route.params.category as string);
const categoryClass = computed(() => categoryName.value.toLowerCase().replaceAll(/\W+/g, '-'));

const { data, error } = await useFetch(
  () => `/api/v1/categories/${encodeURIComponent(categoryName.value)}`,
);

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode ?? 404,
    statusMessage: 'Category not found',
  });
}

const fixtures = computed(() => data.value?.fixtures ?? []);

useHead({
  title: categoryName,
});
</script>
