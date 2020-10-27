<template>
  <div>
    <h1>Manufacturers</h1>

    <div class="toc">
      Jump to:
      <a
        v-for="(letterData, letter) of letters"
        :key="letter"
        v-smooth-scroll
        :href="`#${letterData.id}`"
        class="jump-link">
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
  margin: 0 0.5ex;
}
</style>

<script>
export default {
  async asyncData({ $axios, error }) {
    try {
      const manufacturers = await $axios.$get(`/api/v1/manufacturers`);

      const letters = {};

      Object.keys(manufacturers).forEach(manKey => {
        let letter = manKey.charAt(0).toUpperCase();

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
          key: manKey,
          name: manufacturers[manKey].name,
          fixtureCount: manufacturers[manKey].fixtureCount,
          color: manufacturers[manKey].color,
        });
      });

      return {
        letters,
      };
    }
    catch (requestError) {
      return error(requestError);
    }
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
};
</script>
