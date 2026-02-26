<template>
  <div>
    <h1>Manufacturers</h1>

    <div class="toc">
      Jump to:
      <a
        v-for="(letterData, letter) in letters"
        :key="letter"
        :href="`#${letterData.id}`"
        class="jump-link"
        @click="setScrollBehavior()">
        {{ letter }}
      </a>
    </div>

    <div v-for="(letterData, letter) in letters" :key="letter">
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

<script setup lang="ts">
import register from '~~/fixtures/register.json';

interface ManufacturerData {
  key: string;
  name: string;
  fixtureCount: number;
  color: string;
}

interface LetterData {
  id: string;
  manufacturers: ManufacturerData[];
}

const { data: manufacturers } = await useFetch('/api/v1/manufacturers');

const letters = computed(() => {
  const result: Record<string, LetterData> = {};

  if (!manufacturers.value) {
    return result;
  }

  for (const manufacturerKey of Object.keys(manufacturers.value)) {
    let letter = manufacturerKey.charAt(0).toUpperCase();

    if (!/^[A-Z]$/.test(letter)) {
      letter = '#';
    }

    if (!(letter in result)) {
      result[letter] = {
        id: letter === '#' ? 'letter-numeric' : `letter-${letter.toLowerCase()}`,
        manufacturers: [],
      };
    }

    result[letter].manufacturers.push({
      key: manufacturerKey,
      name: manufacturers.value[manufacturerKey].name,
      fixtureCount: manufacturers.value[manufacturerKey].fixtureCount,
      color: manufacturers.value[manufacturerKey].color,
    });
  }

  return result;
});

function setScrollBehavior() {
  document.documentElement.style.scrollBehavior = 'smooth';
}

onUnmounted(() => {
  document.documentElement.style.scrollBehavior = '';
});

useHead({
  title: 'Manufacturers',
});
</script>
