<template>
  <div>
    <h1>Manufacturers</h1>

    <div class="toc">
      Jump to:
      <a
        v-for="(letterData, letter) of letters"
        :key="letter"
        :href="`#${letterData.id}`"
        class="jump-link"
        @click="setScrollBehavior()">
        {{ letter }}
      </a>
    </div>

    <div v-for="(letterData, letter) of letters" :key="letter">
      <h2 :id="letterData.id">{{ letter }}</h2>

      <div class="manufacturers grid-4">
        <NuxtLink
          v-for="manufacturer of letterData.manufacturers"
          :key="manufacturer.key"
          :to="`/${manufacturer.key}`"
          :style="{ borderLeftColor: manufacturer.color }"
          class="card manufacturer-color">
          <span class="name">{{ manufacturer.name }}</span>
          <span class="fixtures hint">{{ manufacturer.fixtureCount }} fixture{{ manufacturer.fixtureCount === 1 ? `` : `s` }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.toc {
  margin-bottom: 1rem;
}

.jump-link {
  padding: 8px;
  margin: 0 2px;
}

h2 {
  scroll-margin-top: 80px;
}
</style>

<script>
export default {
  async asyncData({ $axios, error }) {
    let manufacturers;
    try {
      manufacturers = await $axios.$get(`/api/v1/manufacturers`);
    }
    catch (requestError) {
      return error(requestError);
    }
    return { manufacturers };
  },
  head() {
    const title = `Manufacturers`;

    return {
      title,
      meta: [
        {
          hid: `title`,
          content: title,
        },
      ],
    };
  },
  computed: {
    letters() {
      const letters = {};

      for (const manufacturerKey of Object.keys(this.manufacturers)) {
        let letter = manufacturerKey.charAt(0).toUpperCase();

        if (!/^[A-Z]$/.test(letter)) {
          letter = `#`;
        }

        if (!(letter in letters)) {
          letters[letter] = {
            id: letter === `#` ? `letter-numeric` : `letter-${letter.toLowerCase()}`,
            manufacturers: [],
          };
        }

        letters[letter].manufacturers.push({
          key: manufacturerKey,
          name: this.manufacturers[manufacturerKey].name,
          fixtureCount: this.manufacturers[manufacturerKey].fixtureCount,
          color: this.manufacturers[manufacturerKey].color,
        });
      }

      return letters;
    },
  },
  destroyed() {
    document.documentElement.style.scrollBehavior = ``;
  },
  methods: {
    setScrollBehavior() {
      document.documentElement.style.scrollBehavior = `smooth`;
    },
  },
};
</script>
