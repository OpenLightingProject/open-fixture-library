<template>
  <div>
    <h1 v-if="error.statusCode === 404">Page not found</h1>
    <h1 v-else>An error occurred</h1>

    <nuxt-link to="/">Home page</nuxt-link>
  </div>
</template>

<script>
export default {
  props: [`error`],
  head: () => ({
    // title: this.error.statusCode === 404 ? `Not Found` : `Error`
  }),
  mounted: () => {
    console.log(`error mounted`, this.error);
  },
  watch: {
    error: () => {
      console.log(`error changed:`, this.error);
    }
  }
};
</script>
