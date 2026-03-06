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
            v-for="(man, manufacturerKey) of manufacturers"
            :key="manufacturerKey"
            :selected="manufacturersQuery.includes(manufacturerKey)"
            :value="manufacturerKey">{{ man.name }}</option>
        </select>

        <select v-model="categoriesQuery" name="categories" multiple>
          <option
            :selected="categoriesQuery.length === 0"
            value="">Filter by category</option>

          <option
            v-for="cat of categories"
            :key="cat"
            :selected="categoriesQuery.includes(cat)"
            :value="cat">{{ cat }}</option>
        </select>
      </ConditionalDetails>

      <button :disabled="searchQuery === `` && isBrowser" type="submit" class="primary">Search</button>
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
            v-for="fixture of fixtureResults"
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

<script>
import register from '../../fixtures/register.json';
import ConditionalDetails from '../components/ConditionalDetails.vue';
import LabeledInput from '../components/LabeledInput.vue';

export default {
  components: {
    ConditionalDetails,
    LabeledInput,
  },
  async setup() {
    const { data: manufacturers, error } = await useAsyncData('manufacturers', () => $fetch('/api/v1/manufacturers'));
    if (error.value) {
      throw createError({ statusCode: 500, statusMessage: error.value.message });
    }
    return { manufacturers: manufacturers.value };
  },
  data() {
    return {
      searchFor: '',
      searchQuery: '',
      manufacturersQuery: [],
      categoriesQuery: [],
      detailsInitiallyOpen: null,
      results: [],
      categories: Object.keys(register.categories).toSorted((a, b) => a.localeCompare(b, 'en')),
      loading: false,
      isBrowser: false,
    };
  },
  async mounted() {
    this.isBrowser = true;
    await this.fetchSearchResults();
  },
  computed: {
    fixtureResults() {
      return this.results.map((key) => {
        const manufacturer = key.split('/')[0];

        return {
          key,
          name: `${this.manufacturers[manufacturer].name} ${register.filesystem[key].name}`,
          color: register.colors[manufacturer],
        };
      });
    },
    pageTitle() {
      return this.searchFor ? `Search "${this.searchFor}"` : 'Search';
    },
  },
  watch: {
    '$route.query'() {
      this.fetchSearchResults();
    },
  },
  methods: {
    async fetchSearchResults() {
      this.loading = true;

      const sanitizedQuery = getSanitizedQuery(this.$route.query);
      this.searchQuery = sanitizedQuery.search;
      this.manufacturersQuery = sanitizedQuery.manufacturers;
      this.categoriesQuery = sanitizedQuery.categories;
      this.searchFor = sanitizedQuery.search;

      if (this.detailsInitiallyOpen === null) {
        this.detailsInitiallyOpen = this.manufacturersQuery.length > 0 || this.categoriesQuery.length > 0;
      }

      try {
        this.results = await $fetch('/api/v1/get-search-results', {
          method: 'POST',
          body: {
            searchQuery: sanitizedQuery.search,
            manufacturersQuery: sanitizedQuery.manufacturers,
            categoriesQuery: sanitizedQuery.categories,
          },
        });
      }
      catch {
        this.results = [];
      }
      finally {
        this.loading = false;
      }
    },
    onSubmit() {
      if (this.searchQuery === '') {
        return;
      }

      this.$router.push({
        path: this.$route.path,
        query: {
          q: this.searchQuery,
          manufacturers: this.manufacturersQuery,
          categories: this.categoriesQuery,
        },
      });
    },
  },
};

/**
 * @param {object} query The raw query returned by Vue Router
 * @returns {object} Object with properties "search" (string), "manufacturers" and "categories" (arrays of strings).
 */
function getSanitizedQuery(query) {
  const searchQuery = (query.q || '').trim();

  let manufacturersQuery = query.manufacturers || [];
  if (typeof manufacturersQuery === 'string') {
    manufacturersQuery = [manufacturersQuery];
  }

  let categoriesQuery = query.categories || [];
  if (typeof categoriesQuery === 'string') {
    categoriesQuery = [categoriesQuery];
  }

  return {
    search: searchQuery,
    manufacturers: manufacturersQuery,
    categories: categoriesQuery,
  };
}
</script>
