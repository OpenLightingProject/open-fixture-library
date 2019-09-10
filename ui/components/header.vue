<template>
  <header>
    <nav>
      <div class="left-nav">
        <nuxt-link
          :class="{ 'home-logo': true, 'hidden-by-search-field': searchFieldFocused }"
          to="/"
          exact
          title="Home"
          @click.native="focusContent">
          Open Fixture Library
        </nuxt-link>

        <form action="/search" @submit.prevent="search">
          <div>
            <input
              v-model="searchQuery"
              type="search"
              name="q"
              placeholder="Search fixtures"
              aria-label="Search fixtures"
              @focus="searchFieldFocused = true"
              @blur="searchFieldFocused = false">
          </div>
          <button type="submit">
            Search
            <app-svg name="magnify" />
          </button>
        </form>
      </div>

      <div class="right-nav">
        <nuxt-link
          to="/fixture-editor"
          title="Fixture editor"
          @click.native="focusContent">
          Add fixture
        </nuxt-link>

        <nuxt-link
          to="/manufacturers"
          title="Browse fixtures by manufacturer"
          @click.native="focusContent">
          Manufacturers
        </nuxt-link>

        <nuxt-link
          to="/categories"
          title="Browse fixtures by category"
          @click.native="focusContent">
          Categories
        </nuxt-link>

        <nuxt-link
          to="/about"
          title="About the project"
          @click.native="focusContent">
          About
        </nuxt-link>
      </div>
    </nav>
  </header>
</template>

<style lang="scss" scoped>
header {
  position: fixed;
  width: 100%;
  background: #fafafa;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  text-align: center;
  z-index: 100;

  nav {
    max-width: 1000px;
    margin: 0 auto;
    display: flex;
    flex-direction: row;
  }

  .right-nav {
    flex-shrink: 0;
    white-space: nowrap;
    overflow: auto;
  }

  a {
    display: inline-block;
    height: 4.5em;
    line-height: 4.5em;
    padding: 0 1ex;
    text-decoration: none;

    &:active, &:focus {
      background-color: rgba($grey-300, 1);
      color: #000;
      outline: 0;
    }

    @include mobile-hover-emulation((
      background-color: rgba($grey-300, 0) rgba($grey-300, 1),
      color: inherit #000
    ));
  }

  form {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  input {
    font-size: 1.05em;
    line-height: 1.2;
    width: 100%;
  }

  button {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    margin-left: 4px;

    box-sizing: content-box;
    background-color: #fbfbfb;
    font-size: 1.05em;
    line-height: 1.2;

    @include icon-button($blue-300, $blue-700);
  }

  .left-nav {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .home-logo {
    display: inline-block;
    width: 0;
    padding: 0;
    overflow: hidden;
    background-image: url('~static/ofl-logo.svg');
    background-repeat: no-repeat;
    transition: background-color 0.2s, color 0.2s, padding 0.2s;

    @include home-logo-sizing(122px, 2ex);
  }
}


/* Tablet */
@media (max-width: $tablet) {
  header {
    nav {
      flex-wrap: wrap;

      & > div {
        flex-basis: 100%;
      }
    }

    .home-logo {
      @include home-logo-sizing(92px, .5ex);

      line-height: 3em;
      height: 3em;
    }

    form {
      flex-grow: 0;
      padding: 0 .5ex;
    }

    .right-nav > a {
      line-height: 2.7em;
      height: 2.7em;
    }
  }
}

/* Phone */
@media (max-width: $phone) {
  header {
    .home-logo {
      @include home-logo-sizing(82px, .5ex);

      line-height: 2.8em;
      height: 2.8em;

      &.hidden-by-search-field {
        padding: 0;
      }
    }

    form,
    form div {
      flex-grow: 1;
      flex-basis: 0;
    }
  }
}
</style>

<script>
import svg from '~/components/svg.vue';

export default {
  components: {
    'app-svg': svg
  },
  data() {
    return {
      searchQuery: this.$router.history.current.query.q || ``,
      searchFieldFocused: false
    };
  },
  mounted() {
    this.$router.afterEach(() => this.updateSearchQuery());
  },
  methods: {
    updateSearchQuery() {
      this.searchQuery = this.$router.history.current.query.q || ``;
    },
    focusContent() {
      this.$emit(`focus-content`);
    },
    search() {
      this.$router.push({
        path: `/search`,
        query: {
          q: this.searchQuery
        }
      });
      this.focusContent();
    }
  }
};
</script>

