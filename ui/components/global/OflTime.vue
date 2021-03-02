<template functional>
  <time :datetime="props.date.toISOString()" :title="props.date.toISOString()">{{
    props.date.toISOString().replace(/T.*?$/, ``)
  }}</time>
</template>

<script>
/* eslint-disable vue/no-unused-properties -- https://github.com/vuejs/eslint-plugin-vue/issues/1312 */

export default {
  props: {
    date: {
      type: Date,
      required: true,
    },
  },
};
</script>
