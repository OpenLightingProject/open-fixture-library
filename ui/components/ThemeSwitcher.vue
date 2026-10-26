<template>
  <button
    type="button"
    :title="title"
    @click.prevent="toggleTheme()">
    <OflSvg name="theme-light-dark" />
  </button>
</template>

<script setup lang="ts">
const colorMode = useColorMode();

// The server cannot know the visitor's colour-mode preference, so it and the
// first client render must both use a neutral title. Rendering the descriptive
// title right away made the server output "Switch to light theme" while the
// hydrated client expected "Switch to dark theme" on every route.
const mounted = ref(false);

onMounted(() => {
  mounted.value = true;
});

const title = computed(() => {
  if (!mounted.value) {
    return 'Switch theme';
  }

  return `Switch to ${colorMode.value === 'light' ? 'dark' : 'light'} theme`;
});

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'light' ? 'dark' : 'light';
};
</script>
