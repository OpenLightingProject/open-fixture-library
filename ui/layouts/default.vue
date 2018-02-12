<template>
  <div>
    <a href="#content" class="accessibility">Skip to content</a>

    <header id="header">
      <nav>
        <div id="left-nav">
          <nuxt-link to="/" id="home-logo" title="Home">Open Fixture Library</nuxt-link>

          <form action="/search">
            <div>
              <input type="search" name="q" placeholder="Search fixtures" aria-label="Search fixtures" value="${options.searchQueryEscaped || ``}" >
            </div>
            <button type="submit">
              Search
              ${svg.getSvg(`magnify`)}
            </button>
          </form>
        </div>

        <div id="right-nav">
          <nuxt-link to="/fixture-editor" title="Fixture editor">Add fixture</nuxt-link>
          <nuxt-link to="/manufacturers" title="Browse fixtures by manufacturer">Manufacturers</nuxt-link>
          <nuxt-link to="/categories" title="Browse fixtures by category">Categories</nuxt-link>
          <nuxt-link to="/about" title="About the project">About</nuxt-link>
        </div>
      </nav>
    </header>

    <div id="content">
      <nuxt />
    </div>
  </div>
</template>

<script>
export default {
};
</script>
