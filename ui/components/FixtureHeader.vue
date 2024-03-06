<template>
  <header class="fixture-header">
    <div class="title">
      <slot name="title" />
    </div>

    <slot />
  </header>
</template>

<style lang="scss" scoped>
.fixture-header ::v-deep .download-button {
  position: relative;
  display: block;
}

// move download button to the right
@media (width >= 650px) {
  .fixture-header {
    display: flex;
    flex-direction: row;
    align-items: baseline;

    & > .title {
      flex-grow: 1;
      flex-shrink: 1;
    }

    & ::v-deep .download-button {
      flex-grow: 0;
      flex-shrink: 0;
      width: 14em;
      margin: 1.5rem 0 0;

      &.home {
        width: 19em;

        & .title {
          font-size: 1.1em;
        }
      }
    }
  }
}
</style>
