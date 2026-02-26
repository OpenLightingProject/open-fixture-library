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
import register from '~~/fixtures/register.json';

interface Category {
  name: string;
  fixtureCount: number;
}

const categories = Object.keys(register.categories).sort((a, b) => a.localeCompare(b, 'en')).map(
  category => ({
    name: category,
    fixtureCount: register.categories[category].length,
  }),
) as Category[];

useHead({
  title: 'Categories',
});
</script>
