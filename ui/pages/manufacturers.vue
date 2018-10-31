<template>
  <div>
    <h1>Manufacturers</h1>

    <div class="toc">
      Jump to:
      <a
        v-for="(letterData, letter) in letters"
        :key="letter"
        :href="`#${letterData.id}`"
        class="jump-link">
        {{ letter }}
      </a>
    </div>

    <div v-for="(letterData, letter) in letters" :key="letter">
      <h2 :id="letterData.id">{{ letter }}</h2>

      <div class="manufacturers grid-4">
        <nuxt-link
          v-for="manufacturer in letterData.manufacturers"
          :key="manufacturer.key"
          :to="`/${manufacturer.key}`"
          :style="{ borderLeftColor: manufacturer.color }"
          class="card manufacturer-color">
          <span class="name">{{ manufacturer.name }}</span>
          <span class="fixtures hint">{{ manufacturer.fixtureCount }} fixture{{ manufacturer.fixtureCount === 1 ? `` : `s` }}</span>
        </nuxt-link>
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
import register from '~~/fixtures/register.json';
import manufacturers from '~~/fixtures/manufacturers.json';

export default {
  head() {
    return {
      title: `Manufacturers`
    };
  },
  data() {
    const letters = {};

    Object.keys(register.manufacturers).forEach(manKey => {
      let letter = manKey.charAt(0).toUpperCase();

      if (!/^[A-Z]$/.test(letter)) {
        letter = `#`;
      }

      if (!(letter in letters)) {
        letters[letter] = {
          id: letter === `#` ? `letter-numeric` : `letter-${letter.toLowerCase()}`,
          manufacturers: []
        };
      }

      letters[letter].manufacturers.push({
        key: manKey,
        name: manufacturers[manKey].name,
        fixtureCount: register.manufacturers[manKey].length,
        color: register.colors[manKey]
      });
    });

    return {
      letters
    };
  }
};
</script>
