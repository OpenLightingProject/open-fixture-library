<template>
  <time :datetime="isoDate" :title="isoDate">{{
    isoDate.replace(/T.*?$/, '')
  }}</time>
</template>

<script setup lang="ts">
interface Props {
  date: Date;
}

const props = defineProps<Props>();

const isoDate = computed(() => props.date.toISOString());
</script>
