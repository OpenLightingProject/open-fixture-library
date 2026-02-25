<template>
  <header>
    <!-- eslint-disable vuejs-accessibility/click-events-have-key-events vuejs-accessibility/no-static-element-interactions -->
    <nav @click="focusContent($event)">
      <div class="left-nav">
        <NuxtLink
          class="home-logo"
          :class="{ 'hidden-by-search-field': searchFieldFocused }"
          to="/"
          exact
          title="Home">
          Open Fixture Library
        </NuxtLink>

        <form action="/search" @submit.prevent="search()">
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
          <button class="icon-button" type="submit">
            Search
            <OflSvg name="magnify" />
          </button>
        </form>
      </div>

      <div class="right-nav">
        <NuxtLink
          to="/fixture-editor"
          title="Fixture editor">
          Add fixture
        </NuxtLink>

        <NuxtLink
          to="/manufacturers"
          title="Browse fixtures by manufacturer">
          Manufacturers
        </NuxtLink>

        <NuxtLink
          to="/categories"
          title="Browse fixtures by category">
          Categories
        </NuxtLink>

        <NuxtLink
          to="/about"
          title="About the project">
          About
        </NuxtLink>

        <ClientOnly>
          <ThemeSwitcher class="theme-switcher" />
        </ClientOnly>
      </div>
    </nav>
  </header>
</template>

<style lang="scss" scoped>
@mixin home-logo-sizing($width, $padding) {
  padding-left: calc(#{$width} + #{2 * $padding});

  &::before {
    background-size: calc(100% - #{2 * $padding}) auto;
  }
}

header {
  position: fixed;
  z-index: 100;
  width: 100%;
  text-align: center;
  background: theme-color(header-background);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 40%);
  transition: background-color 0.3s;

  nav {
    display: flex;
    flex-direction: row;
    max-width: 1000px;
    margin: 0 auto;
  }

  .right-nav {
    flex-shrink: 0;
    overflow: auto;
    white-space: nowrap;
  }

  form {
    display: flex;
    flex-grow: 1;
    align-items: center;
    justify-content: center;
  }

  input {
    width: 100%;
    font-size: 1.05em;
    line-height: 1.2;
  }

  button {
    box-sizing: content-box;
    margin-left: 4px;
    font-size: 1.05em;
    line-height: 1.2;
  }

  a,
  .theme-switcher {
    box-sizing: border-box;
    display: inline-block;
    height: 4.5em;
    padding: 0 1ex;
    margin: 0;
    font-size: 1em;
    line-height: 4.5em;
    vertical-align: middle;
    color: inherit;
    text-decoration: none;
    cursor: pointer;
    background-color: transparent;
    border: none;
    fill: theme-color(icon);

    &:active,
    &:focus {
      outline: 0;
      background-color: theme-color(hover-background);
    }

    @include mobile-hover-emulation((
      background-color: hover-background,
      fill: icon-hover,
    ));
  }

  .left-nav {
    display: flex;
    flex-grow: 1;
    align-items: center;
    justify-content: center;
  }

  .home-logo {
    position: relative;
    display: inline-block;
    width: 0;
    padding: 0;
    overflow: hidden;
    transition: background-color 0.2s, padding 0.2s;

    @include home-logo-sizing(122px, 2ex);

    &::before {
      position: absolute;
      inset: 0;
      content: "";
      background-image: url("~static/ofl-logo.svg");
      background-repeat: no-repeat;
      background-position: center;
    }
  }
}

[data-theme="dark"] header .home-logo::before {
  filter: #{"brightness(0.4) invert() brightness(0.9)"};
}

@media (max-width: $tablet) {
  header {
    nav {
      flex-wrap: wrap;

      & > div {
        flex-basis: 100%;
      }
    }

    .home-logo {
      @include home-logo-sizing(92px, 0.5ex);

      height: 3em;
      line-height: 3em;
    }

    form {
      flex-grow: 0;
      padding: 0 0.5ex;
    }

    .right-nav > a,
    .right-nav > button {
      height: 2.7em;
      line-height: 2.7em;
    }
  }
}

@media (max-width: $phone) {
  header {
    .home-logo {
      @include home-logo-sizing(82px, 0.5ex);

      height: 2.8em;
      line-height: 2.8em;

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
import ThemeSwitcher from './ThemeSwitcher.vue';

export default {
  components: {
    ThemeSwitcher,
  },
  emits: {
    'focus-content': () => true,
  },
  data() {
    return {
      searchQuery: this.$router.history.current.query.q || ``,
      searchFieldFocused: false,
    };
  },
  mounted() {
    this.$router.afterEach(() => this.updateSearchQuery());
  },
  methods: {
    updateSearchQuery() {
      this.searchQuery = this.$router.history.current.query.q || ``;
    },
    focusContent(event) {
      if (event.target?.closest(`a`)) {
        this.$emit(`focus-content`);
      }
    },
    search() {
      this.$router.push({
        path: `/search`,
        query: {
          q: this.searchQuery,
        },
      });
      this.focusContent();
    },
  },
};
</script>

