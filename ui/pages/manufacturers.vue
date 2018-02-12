<template>
  <div>
    <h1>Manufacturers</h1>

    <div class="manufacturers grid">
      <nuxt-link
        v-for="(manufacturer, manKey) in manufacturers"
        :key="manKey"
        :to="`/${manKey}`"
        class="card">
        <h2>{{ manufacturer.name }}</h2>
        <div class="fixtures">{{ manufacturer.numFixtures }}</div>
      </nuxt-link>
    </div>
  </div>
</template>

<script>
export default {
  head: () => ({
    title: `Manufacturers`
  }),
  data: () => ({
    manufacturers: {
      "5star-systems": {
        "name": `5Star Systems`,
        numFixtures: 0
      },
      "abstract": {
        "name": `Abstract`,
        "website": `http://www.abstractavr.com/`,
        numFixtures: 1
      },
      "american-dj": {
        "name": `American DJ`,
        "website": `http://www.adj.com/`,
        numFixtures: 4
      },
      "ayra": {
        "name": `Ayra`,
        "website": `https://www.bax-shop.co.uk/ayra`,
        numFixtures: 2
      },
      "cameo": {
        "name": `cameo`,
        "website": `http://www.cameolight.com/`,
        numFixtures: 18
      }
    }
  })
};
</script>
