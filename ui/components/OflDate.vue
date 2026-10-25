<template>
  <time :datetime="isoDate">{{ isoDate }}</time>
</template>

<script setup lang="ts">
interface Props {
  date: Date | string;
}

const props = defineProps<Props>();

const isoDate = computed(() => {
  return props.date instanceof Date ? props.date.toISOString().replace(/T.*$/, '') : props.date;
});
</script>
