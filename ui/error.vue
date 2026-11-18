<template>
  <NuxtLayout>
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
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.error {
  white-space: pre-wrap;
}
</style>

<script setup lang="ts">
interface Error {
  statusCode: number;
  message: string;
  /** Nuxt 4 puts the thrown `data` payload here. */
  data?: {
    error?: string;
  };
}

const properties = defineProps<{
  error: Error;
}>();

const errorMessage = computed(() => {
  return properties.error.data?.error || properties.error.message;
});

if (properties.error.statusCode !== 404) {
  console.error('Nuxt rendering error:', properties.error);
}

const title = computed(() => (properties.error.statusCode === 404 ? 'Not Found' : 'Error'));

useHead({
  title,
});
</script>
