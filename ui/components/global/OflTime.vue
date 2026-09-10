<template>
  <time :datetime="isoDate" :title="isoDate">{{
    isoDate.replace(/T.*?$/, ``)
  }}</time>
</template>

<script>
import { instanceOfProp } from 'vue-ts-types';

export default {
  props: {
    date: instanceOfProp(Date).required,
  },
  computed: {
    isoDate() {
      return this.date.toISOString();
    },
  },
};
</script>
