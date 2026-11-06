<template>
  <time :datetime="isoDate">{{ isoDate }}</time>
</template>

<script>
import { oneOfTypesProp } from 'vue-ts-types';

export default {
  props: {
    date: oneOfTypesProp([Date, String]).required,
  },
  computed: {
    isoDate() {
      return this.date instanceof Date ? this.date.toISOString().replace(/T.*$/, '') : this.date;
    },
  },
};
</script>
