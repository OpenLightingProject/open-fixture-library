<template>
  <div>
    <h1>Manufacturers</h1>

    <div class="manufacturers grid">
      <nuxt-link
        v-for="manufacturer in manufacturers"
        :key="manufacturer.key"
        :to="`/${manufacturer.key}`"
        class="card">
        <h2>{{ manufacturer.name }}</h2>
        <div class="fixtures">{{ manufacturer.fixtureCount }} fixture{{ manufacturer.fixtureCount === 1 ? `` : `s` }}</div>
      </nuxt-link>
    </div>
  </div>
</template>

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
    return {
      manufacturers: Object.keys(register.manufacturers).sort((a, b) => a.localeCompare(b, `en`)).map(
        manKey => ({
          key: manKey,
          name: manufacturers[manKey].name,
          fixtureCount: register.manufacturers[manKey].length
        })
      )
    };
  }
};
</script>
