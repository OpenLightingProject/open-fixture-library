<template>
  <button
    type="button"
    :title="`Switch to ${colorMode.value === 'light' ? 'dark' : 'light'} theme`"
    @click.prevent="toggleTheme()">
    <OflSvg name="theme-light-dark" />
  </button>
</template>

<script setup lang="ts">
const colorMode = useColorMode();

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'light' ? 'dark' : 'light';
};
</script>
