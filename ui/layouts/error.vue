<template>
  <div>
    <template v-if="error.statusCode === 404">
      <h1>404 – Not found</h1>
      <p>The requested page was not found. Maybe you've got the wrong URL? If not, consider <a href="https://github.com/OpenLightingProject/open-fixture-library/issues">filing a bug</a>.</p>
    </template>

    <template v-else>
      <h1>{{ error.statusCode }} – An error occurred</h1>

      <p class="error">{{ errorMessage }}</p>
      <p>Please consider <a href="https://github.com/OpenLightingProject/open-fixture-library/issues">filing a bug</a> to help resolve this issue.</p>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.error {
  white-space: pre-wrap;
}
</style>

<script>
import { oneOfTypesProp } from 'vue-ts-types';

export default {
  props: {
    error: oneOfTypesProp([Object, Error]).required,
  },
  head() {
    if (this.error.statusCode !== 404) {
      console.error(`Nuxt rendering error:`, this.error);
    }

    const title = this.error.statusCode === 404 ? `Not Found` : `Error`;

    return {
      title,
      meta: [
        {
          hid: `title`,
          content: title,
        },
      ],
    };
  },
  computed: {
    errorMessage() {
      if (this.error.response && this.error.response.data && this.error.response.data.error) {
        return this.error.response.data.error;
      }

      return this.error.message;
    },
  },
};
</script>
