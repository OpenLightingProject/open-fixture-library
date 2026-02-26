<template>
  <div class="search">
    <h1 v-if="searchFor">Search <em>{{ searchFor }}</em></h1>
    <h1 v-else>Search</h1>

    <form class="filter" action="/search" @submit.prevent="onSubmit()">
      <LabeledInput label="Search query">
        <input v-model="searchQuery" type="search" name="q">
      </LabeledInput>

      <ConditionalDetails :open="detailsInitiallyOpen">
        <template #summary>Filter results</template>

        <select v-model="manufacturersQuery" name="manufacturers" multiple>
          <option
            :selected="manufacturersQuery.length === 0"
            value="">Filter by manufacturer</option>

          <option
            v-for="(man, manufacturerKey) in manufacturers"
            :key="manufacturerKey"
            :selected="manufacturersQuery.includes(manufacturerKey)"
            :value="manufacturerKey">{{ man.name }}</option>
        </select>

        <select v-model="categoriesQuery" name="categories" multiple>
          <option
            :selected="categoriesQuery.length === 0"
            value="">Filter by category</option>

          <option
            v-for="cat in categories"
            :key="cat"
            :selected="categoriesQuery.includes(cat)"
            :value="cat">{{ cat }}</option>
        </select>
      </ConditionalDetails>

      <button :disabled="buttonDisabled" type="submit" class="primary">Search</button>
    </form>

    <div class="search-results">
      <div v-if="!searchFor" class="card">
        Please enter a search query in the form above.
      </div>

      <div v-else-if="loading" class="card">
        Loading…
      </div>

      <div v-else-if="results.length > 0" class="card">
        <ul class="list fixtures">
          <li
            v-for="fixture in fixtureResults"
            :key="fixture.key">
            <NuxtLink
              :to="`/${fixture.key}`"
              :style="{ borderLeftColor: fixture.color }"
              class="manufacturer-color">
              <span class="name">{{ fixture.name }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div v-else class="card">
        Your search for <em>{{ searchFor }}</em> did not match any fixtures. Try using another query or browse by <NuxtLink to="/manufacturers">manufacturer</NuxtLink> or <NuxtLink to="/categories">category</NuxtLink>.
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-results {
  margin-top: 2rem;
}

.search :deep(select[multiple]) {
  margin-right: 1ex;
}

.search :deep(details) {
  margin: 1rem 0;
}
</style>

<script setup lang="ts">
import register from '~~/fixtures/register.json';

const route = useRoute();
const router = useRouter();

const { data: manufacturers } = await useFetch('/api/v1/manufacturers');

const searchFor = ref('');
const searchQuery = ref('');
const manufacturersQuery = ref<string[]>([]);
const categoriesQuery = ref<string[]>([]);
const detailsInitiallyOpen = ref<boolean | null>(null);
const results = ref<string[]>([]);
const categories = Object.keys(register.categories).sort((a, b) => a.localeCompare(b, 'en'));
const loading = ref(false);

const buttonDisabled = computed(() => {
  return searchQuery.value === '' && import.meta.client;
});

const fixtureResults = computed(() => {
  return results.value.map(key => {
    const manufacturer = key.split('/')[0];

    return {
      key,
      name: `${manufacturers.value?.[manufacturer]?.name ?? ''} ${register.filesystem[key]?.name ?? ''}`,
      color: register.colors[manufacturer],
    };
  });
});

/**
 * @param {object} query The raw query returned by Vue Router
 * @returns {object} Object with properties "search" (string), "manufacturers" and "categories" (arrays of strings).
 */
function getSanitizedQuery(query: Record<string, unknown>) {
  const searchQueryRaw = (query.q || '') as string;
  const searchQueryTrimmed = searchQueryRaw.trim();

  let manufacturersQueryRaw = query.manufacturers;
  if (typeof manufacturersQueryRaw === 'string') {
    manufacturersQueryRaw = [manufacturersQueryRaw];
  }
  const manufacturersQueryArr = Array.isArray(manufacturersQueryRaw) ? manufacturersQueryRaw as string[] : [];

  let categoriesQueryRaw = query.categories;
  if (typeof categoriesQueryRaw === 'string') {
    categoriesQueryRaw = [categoriesQueryRaw];
  }
  const categoriesQueryArr = Array.isArray(categoriesQueryRaw) ? categoriesQueryRaw as string[] : [];

  return {
    search: searchQueryTrimmed,
    manufacturers: manufacturersQueryArr,
    categories: categoriesQueryArr,
  };
}

async function performSearch() {
  loading.value = true;

  const sanitizedQuery = getSanitizedQuery(route.query as Record<string, unknown>);
  searchQuery.value = sanitizedQuery.search;
  manufacturersQuery.value = sanitizedQuery.manufacturers;
  categoriesQuery.value = sanitizedQuery.categories;
  searchFor.value = sanitizedQuery.search;

  if (detailsInitiallyOpen.value === null) {
    detailsInitiallyOpen.value = manufacturersQuery.value.length > 0 || categoriesQuery.value.length > 0;
  }

  try {
    results.value = await $fetch('/api/v1/get-search-results', {
      method: 'POST',
      body: {
        searchQuery: sanitizedQuery.search,
        manufacturersQuery: sanitizedQuery.manufacturers,
        categoriesQuery: sanitizedQuery.categories,
      },
    });
  }
  catch {
    results.value = [];
  }
  finally {
    loading.value = false;
  }
}

await performSearch();

watch(() => route.query, () => {
  performSearch();
});

function onSubmit() {
  if (searchQuery.value === '') {
    return;
  }

  router.push({
    path: route.path,
    query: {
      q: searchQuery.value,
      manufacturers: manufacturersQuery.value,
      categories: categoriesQuery.value,
    },
  });
}

const title = computed(() => searchFor.value ? `Search "${searchFor.value}"` : 'Search');

useHead({
  title,
});
</script>
