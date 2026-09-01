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

        <select v-model="channelTypesQuery" name="channelTypes" multiple>
          <option
            :selected="channelTypesQuery.length === 0"
            value="">Filter by channel type</option>

          <option
            v-for="channelType of channelTypes"
            :key="channelType"
            :selected="channelTypesQuery.includes(channelType)"
            :value="channelType">{{ channelType }}</option>
        </select>

        <select v-model="colorsQuery" name="colors" multiple>
          <option
            :selected="colorsQuery.length === 0"
            value="">Filter by color</option>

          <option
            v-for="color of colors"
            :key="color"
            :selected="colorsQuery.includes(color)"
            :value="color">{{ color }}</option>
        </select>

        <label class="channel-count-range">
          Number of channels:
          <input
            v-model.number="channelsMinQuery"
            type="number"
            min="1"
            name="channelsMin"
            placeholder="min">
          <span aria-hidden="true">–</span>
          <input
            v-model.number="channelsMaxQuery"
            type="number"
            min="1"
            name="channelsMax"
            placeholder="max">
        </label>
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

.search ::v-deep select[multiple] {
  margin-right: 1ex;
}

.search ::v-deep details {
  margin: 1rem 0;
}

.search ::v-deep .channel-count-range {
  display: inline-flex;
  gap: 0.5ex;
  align-items: center;
  margin-right: 1ex;

  input[type="number"] {
    width: 5em;
  }
}
</style>

<script>
import register from '../../fixtures/register.json';
import { CHANNEL_TYPES } from '../../lib/model/CoarseChannel.js';
import { SINGLE_COLORS } from '../../lib/single-colors.js';
import ConditionalDetails from '../components/ConditionalDetails.vue';
import LabeledInput from '../components/LabeledInput.vue';

export default {
  components: {
    ConditionalDetails,
    LabeledInput,
  },
  async asyncData({ $axios, error }) {
    let manufacturers;
    try {
      manufacturers = await $axios.$get('/api/v1/manufacturers');
    }
    catch (requestError) {
      return error(requestError);
    }
    return { manufacturers };
  },
  data() {
    return {
      searchFor: '',
      searchQuery: '',
      manufacturersQuery: [],
      categoriesQuery: [],
      channelsMinQuery: null,
      channelsMaxQuery: null,
      channelTypesQuery: [],
      colorsQuery: [],
      detailsInitiallyOpen: null,
      results: [],
      categories: Object.keys(register.categories).toSorted((a, b) => a.localeCompare(b, 'en')),
      channelTypes: CHANNEL_TYPES.toSorted((a, b) => a.localeCompare(b, 'en')),
      colors: SINGLE_COLORS.toSorted((a, b) => a.localeCompare(b, 'en')),
      loading: false,
      isBrowser: false,
    };
  },
  async fetch() {
    this.loading = true;

    const sanitizedQuery = getSanitizedQuery(this.$route.query);
    this.searchQuery = sanitizedQuery.search;
    this.manufacturersQuery = sanitizedQuery.manufacturers;
    this.categoriesQuery = sanitizedQuery.categories;
    this.channelsMinQuery = sanitizedQuery.channelsMin;
    this.channelsMaxQuery = sanitizedQuery.channelsMax;
    this.channelTypesQuery = sanitizedQuery.channelTypes;
    this.colorsQuery = sanitizedQuery.colors;
    this.searchFor = sanitizedQuery.search;

    if (this.detailsInitiallyOpen === null) {
      this.detailsInitiallyOpen = this.manufacturersQuery.length > 0
        || this.categoriesQuery.length > 0
        || this.channelsMinQuery !== null
        || this.channelsMaxQuery !== null
        || this.channelTypesQuery.length > 0
        || this.colorsQuery.length > 0;
    }

    try {
      this.results = await this.$axios.$post('/api/v1/get-search-results', {
        searchQuery: sanitizedQuery.search,
        manufacturersQuery: sanitizedQuery.manufacturers,
        categoriesQuery: sanitizedQuery.categories,
        channelsMinQuery: sanitizedQuery.channelsMin,
        channelsMaxQuery: sanitizedQuery.channelsMax,
        channelTypesQuery: sanitizedQuery.channelTypes,
        colorsQuery: sanitizedQuery.colors,
      });
    }
    catch {
      this.results = [];
    }
    finally {
      this.loading = false;
    }
  },
  head() {
    const title = this.searchFor ? `Search "${this.searchFor}"` : 'Search';

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
    fixtureResults() {
      return this.results.map((key) => {
        const manufacturer = key.split('/', 1)[0];

        return {
          key,
          name: `${this.manufacturers[manufacturer].name} ${register.filesystem[key].name}`,
          color: register.colors[manufacturer],
        };
      });
    },
  },
  watch: {
    '$route.query': '$fetch',
  },
  mounted() {
    this.isBrowser = true;
  },
  methods: {
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
          channelsMin: toPositiveIntegerOrNull(this.channelsMinQuery),
          channelsMax: toPositiveIntegerOrNull(this.channelsMaxQuery),
          channelTypes: this.channelTypesQuery,
          colors: this.colorsQuery,
        },
      });
    },
  },
};

/**
 * @param {object} query - The raw query returned by Vue Router
 * @returns {object} Object with properties "search" (string), "manufacturers", "categories", "channelTypes"
 * and "colors" (arrays of strings), and "channelsMin" / "channelsMax" (positive integers or null).
 */
function getSanitizedQuery(query) {
  const searchQuery = (query.q || '').trim();

  return {
    search: searchQuery,
    manufacturers: toArray(query.manufacturers),
    categories: toArray(query.categories),
    channelsMin: toPositiveIntegerOrNull(query.channelsMin),
    channelsMax: toPositiveIntegerOrNull(query.channelsMax),
    channelTypes: toArray(query.channelTypes),
    colors: toArray(query.colors),
  };
}

/**
 * Vue Router returns a single string if a query parameter is only given once, and an array of
 * strings if it's given multiple times (or omits the property completely if it's not given at all).
 * @param {string | string[] | undefined} queryValue - The raw value of a multi-value query parameter.
 * @returns {string[]} The query parameter's value, always as an array.
 */
function toArray(queryValue) {
  if (queryValue === undefined) {
    return [];
  }

  return typeof queryValue === 'string' ? [queryValue] : queryValue;
}

/**
 * @param {string | number | undefined} queryValue - The raw value of a query parameter.
 * @returns {number | null} The query parameter's value as a positive integer, or null if it isn't one.
 */
function toPositiveIntegerOrNull(queryValue) {
  const number = Number.parseInt(queryValue, 10);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}
</script>
