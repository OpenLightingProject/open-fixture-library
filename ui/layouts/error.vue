<template>
  <div>
    <template v-if="error.statusCode === 404">
      <h1>404 – Not found</h1>
      <p>The requested page was not found. Maybe you've got the wrong URL? If not, consider <a href="https://github.com/OpenLightingProject/open-fixture-library/issues">filing a bug</a>.</p>
    </template>

    <template v-else>
      <h1>{{ error.statusCode }} – An error occurred</h1>

      <p>{{ error.message }}</p>
      <p>Please consider <a href="https://github.com/OpenLightingProject/open-fixture-library/issues">filing a bug</a> to help resolve this issue.</p>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    error: {
      type: [Object, Error],
      required: true
    }
  },
  head() {
    if (this.error.statusCode !== 404) {
      console.error(`Nuxt rendering error:`, this.error);
    }

    return {
      title: this.error.statusCode === 404 ? `Not Found` : `Error`
    };
  }
};
</script>
