<template>
  <div>
    <h1 v-if="searchFor">Search <em>{{ searchFor }}</em></h1>
    <h1 v-else>Search</h1>

    <form class="filter" action="/search" @submit.prevent="onSubmit">
      <section>
        <label>
          <span class="label">Search query</span>
          <span class="value"><input v-model="searchQuery" type="search" name="q"></span>
        </label>
      </section>

      <app-conditional-details :open="detailsInitiallyOpen">
        <template slot="summary">Filter results</template>

        <select v-model="manufacturersQuery" name="manufacturers" multiple>
          <option
            :selected="manufacturersQuery.length === 0"
            value="">Filter by manufacturer</option>

          <option
            v-for="man in manufacturers"
            :key="man.key"
            :selected="manufacturersQuery.includes(man.key)"
            :value="man.key">{{ man.name }}</option>
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
      </app-conditional-details>

      <button :disabled="searchQuery === ``" type="submit" class="primary">Search</button>
    </form>

    <div class="search-results">
      <div v-if="!searchFor" class="card">
        Please enter a search query in the form above.
      </div>

      <div v-else-if="loading" class="card">
        Loading…
      </div>

      <ul v-else-if="results.length > 0" class="card list fixtures">
        <li
          v-for="fixture in fixtureResults"
          :key="fixture.key">
          <nuxt-link :to="`/${fixture.key}`">
            <span class="name">{{ fixture.name }}</span>
          </nuxt-link>
        </li>
      </ul>

      <div v-else class="card">
        Your search for <em>{{ searchFor }}</em> did not match any fixtures. Try using another query or browse by <nuxt-link to="/manufacturers">manufacturer</nuxt-link> or <nuxt-link to="/categories">category</nuxt-link>.
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.search-results {
  margin-top: 2rem;
}
</style>

<style lang="scss">
select[multiple] {
  margin-right: 1ex;
}

details {
  margin: 1rem 0;
}
</style>

<script>
import register from '~~/fixtures/register.json';
import manufacturers from '~~/fixtures/manufacturers.json';

import conditionalDetailsVue from '~/components/conditional-details.vue';

export default {
  components: {
    'app-conditional-details': conditionalDetailsVue
  },
  head() {
    return {
      title: this.searchFor ? `Search "${this.searchFor}"` : `Search`
    };
  },
  async asyncData({ query, app }) {
    const searchQuery = (query.q || ``).trim();

    let manufacturersQuery = query.manufacturers || [];
    if (typeof manufacturersQuery === `string`) {
      manufacturersQuery = [manufacturersQuery];
    }

    let categoriesQuery = query.categories || [];
    if (typeof categoriesQuery === `string`) {
      categoriesQuery = [categoriesQuery];
    }

    return {
      searchFor: searchQuery,
      searchQuery,
      manufacturersQuery,
      categoriesQuery,
      detailsInitiallyOpen: manufacturersQuery.length > 0 || categoriesQuery.length > 0,
      results: await app.$axios.$post(`/ajax/get-search-results`, {
        searchQuery,
        manufacturersQuery,
        categoriesQuery
      })
    };
  },
  data() {
    return {
      manufacturers: Object.keys(register.manufacturers).sort((a, b) => a.localeCompare(b, `en`)).map(
        manKey => ({
          key: manKey,
          name: manufacturers[manKey].name,
          fixtureCount: register.manufacturers[manKey].length
        })
      ),
      categories: Object.keys(register.categories).sort((a, b) => a.localeCompare(b, `en`)),
      loading: false
    };
  },
  computed: {
    fixtureResults() {
      return this.results.map(key => {
        const man = key.split(`/`)[0];

        return {
          key,
          name: `${manufacturers[man].name} ${register.filesystem[key].name}`
        };
      });
    }
  },
  mounted() {
    this.$router.afterEach(() => this.updateResults());
  },
  methods: {
    onSubmit() {
      if (this.searchQuery === ``) {
        return;
      }

      this.$router.push({
        path: this.$route.path,
        query: {
          q: this.searchQuery,
          manufacturers: this.manufacturersQuery,
          categories: this.categoriesQuery
        }
      });
    },
    async updateResults() {
      this.loading = true;
      this.results = await this.$axios.$post(`/ajax/get-search-results`, {
        searchQuery: this.searchQuery,
        manufacturersQuery: this.manufacturersQuery,
        categoriesQuery: this.categoriesQuery
      });
      this.searchFor = this.searchQuery;
      this.loading = false;
    }
  }
};
</script>
