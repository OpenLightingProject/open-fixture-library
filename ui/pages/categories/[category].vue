<template>
  <div>
    <h1>{{ categoryName }} fixtures</h1>

    <div class="card">
      <ul class="list fixtures" :class="`category-${categoryClass}`">
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
import register from '~~/fixtures/register.json';

const route = useRoute();

const categoryName = computed(() => route.params.category as string);
const categoryClass = computed(() => categoryName.value.toLowerCase().replaceAll(/\W+/g, '-'));

const { data: manufacturers } = await useFetch('/api/v1/manufacturers');

const fixtures = computed(() => {
  const category = decodeURIComponent(categoryName.value);
  if (!register.categories[category] || !manufacturers.value) return [];
  
  return register.categories[category].map(fullFixtureKey => {
    const [manufacturerKey, fixtureKey] = fullFixtureKey.split('/');
    const manufacturerName = manufacturers.value[manufacturerKey]?.name ?? '';
    const fixtureName = register.filesystem[`${manufacturerKey}/${fixtureKey}`]?.name ?? '';

    return {
      key: fullFixtureKey,
      link: `/${fullFixtureKey}`,
      name: `${manufacturerName} ${fixtureName}`,
      categories: Object.keys(register.categories).filter(
        cat => register.categories[cat]?.includes(fullFixtureKey),
      ),
      color: manufacturers.value[manufacturerKey]?.color ?? '',
    };
  });
});

useHead({
  title: categoryName,
});
</script>
