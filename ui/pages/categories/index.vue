<template>
  <div>
    <h1>Categories</h1>

    <div class="categories grid-3">
      <NuxtLink
        v-for="category in categories"
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

<script setup lang="ts">
interface Category {
  name: string;
  fixtureCount: number;
}

const { data: categories, error } = await useFetch<Category[]>('/api/v1/categories');

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode ?? 500,
    statusMessage: 'Could not load categories',
  });
}

useHead({
  title: 'Categories',
});
</script>
