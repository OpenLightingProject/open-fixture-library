<template>
  <section class="masonry-card-container">
    <slot />
  </section>
</template>

<style lang="scss" scoped>
// display mode cards in a 2-col layout
@media (min-width: $tablet) {
  .card {
    width: calc(50% - 0.5rem);

    &:nth-child(odd) {
      float: left;
      clear: left;
      margin-right: 0.5rem;
    }

    &:nth-child(even) {
      float: right;
      clear: right;
      margin-left: 0.5rem;
    }
  }

  .masonry-card-container::after {
    clear: both;
    content: "";
  }

  @supports (grid-template-rows: masonry) {
    .masonry-card-container {
      display: grid;
      grid-template-rows: masonry;
      grid-template-columns: 1fr 1fr;
      column-gap: 1rem;

      .card {
        float: none;
        width: auto;
        margin-right: 0;
        margin-left: 0;
      }
    }
  }

  @supports (display: grid-lanes) {
    .masonry-card-container {
      display: grid-lanes;
      grid-template-columns: 1fr 1fr;
      column-gap: 1rem;

      .card {
        float: none;
        width: auto;
        margin-right: 0;
        margin-left: 0;
      }
    }
  }
}
</style>
