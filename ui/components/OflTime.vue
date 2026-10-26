<template>
  <time :datetime="isoDate" :title="isoDate">{{
    isoDate.replace(/T.*?$/, '')
  }}</time>
</template>

<script setup lang="ts">
interface Properties {
  date: Date;
}

const properties = defineProps<Properties>();

const isoDate = computed(() => properties.date.toISOString());
</script>
