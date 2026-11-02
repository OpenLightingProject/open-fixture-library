<template>
  <time :datetime="isoDate">{{ isoDate }}</time>
</template>

<script setup lang="ts">
interface Properties {
  date: Date | string;
}

const properties = defineProps<Properties>();

const isoDate = computed(() => {
  return properties.date instanceof Date ? properties.date.toISOString().replace(/T.*$/, '') : properties.date;
});
</script>
