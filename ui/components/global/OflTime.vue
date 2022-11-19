<template functional>
  <time :datetime="props.date.toISOString()" :title="props.date.toISOString()">{{
    props.date.toISOString().replace(/T.*?$/, ``)
  }}</time>
</template>

<script>
import { instanceOfProp } from 'vue-ts-types';

export default {
  props: {
    date: instanceOfProp(Date).required,
  },
};
</script>
