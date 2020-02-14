<template functional>
  <time :datetime="props.date.toISOString()" :title="props.date.toISOString()">
    {{ props.date.toISOString().replace(/T.*?$/, ``) }}
  </time>
</template>

<script>
export default {
  props: {
    date: {
      type: Date,
      required: true
    }
  }
};
</script>
