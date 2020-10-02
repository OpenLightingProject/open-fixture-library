<template functional>
  <time :datetime="props.date.toISOString()" :title="props.date.toISOString()">{{
    props.date.toISOString().replace(/T.*?$/, ``)
  }}</time>
</template>

<script>
/* eslint-disable vue/no-unused-properties */ // not supported in functional components

export default {
  props: {
    date: {
      type: Date,
      required: true,
    },
  },
};
</script>
