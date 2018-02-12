<template>
  <div>
    <header class="fixture-header">

      <div class="title">
        <h1>Open Fixture Library</h1>
      </div>

      <div class="download-button big">
        <a href="#" class="title">Download all ${options.register.lastUpdated.length} fixtures</a>
        <ul>
          <li v-for="(plugin, pluginKey) in exportPlugins" :key="pluginKey">
            <a :href="`/download.${pluginKey}`" :title="`Download ${plugin.name} fixture definitions`">{{ plugin.name }}</a>
          </li>
        </ul>
      </div>

    </header>


    <h3>Create and browse fixture definitions for lighting equipment online and download them in the right format for your DMX control software!</h3>

    <p><abbr title="Open Fixture Library">OFL</abbr> collects DMX fixture definitions in a JSON format and automatically exports them to the right format for every supported lighting software. Everybody can <a href="https://github.com/FloEdelmann/open-fixture-library">contribute</a> and help to improve! Thanks!</p>


    <!-- <div class="grid centered">

    <section class="card list">
    <h2>Recently updated fixtures</h2>
    for (const fixtureKey of options.register.lastUpdated.slice(0, 5)) {
      const name = getFixtureName(fixtureKey, options);
      const action = options.register.filesystem[fixtureKey].lastAction;
      const date = new Date(options.register.filesystem[fixtureKey].lastModifyDate);
      const dateHtml = `<time datetime="${date.toISOString()}" title="${date.toISOString()}">${date.toISOString().replace(/T.*?$/, ``)}</time>`;

      <a href="/${fixtureKey}">${name}<span class="hint">${action} ${dateHtml}</span></a>
    }-->
    <nuxt-link to="/manufacturers" class="card dark blue big-button" title="Browse all fixtures by manufacturer">${svg.getSvg(`folder-multiple`)}<h2>Browse fixtures</h2></nuxt-link>
    <!--</section>

    <section class="card list">
    <h2>Top contributors</h2>
    for (const contributor of Object.keys(options.register.contributors).slice(0, 5)) {
      const number = options.register.contributors[contributor].length;
      const latestFixtureKey = getLatestFixtureKey(contributor, options);
      const latestFixtureName = getFixtureName(latestFixtureKey, options);

      <a href="/${latestFixtureKey}">${contributor}<span class="hint">${number} fixture${number === 1 ? `` : `s`}, latest: ${latestFixtureName}</span></a>
    }
    <a href="/fixture-editor" class="card dark light-green big-button" title="Become a top contributer yourself!">${svg.getSvg(`plus`)}<h2>Add fixture</h2></a>
    </section>

    </div> -->

    <div class="list grid centered">
      <a href="https://github.com/FloEdelmann/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+-label%3Atype-bug" rel="nofollow" class="card">${svg.getSvg(`lightbulb-on-outline`, [`left`])}<span>Request feature</span></a>
      <a href="https://github.com/FloEdelmann/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Atype-bug" rel="nofollow" class="card">${svg.getSvg(`bug`, [`left`])}<span>Report problem</span></a>
      <a href="https://github.com/FloEdelmann/open-fixture-library" class="card">${svg.getSvg(`github-circle`, [`left`])}<span>View source</span></a>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    exportPlugins: {
      ecue: {
        name: `e:cue`
      },
      qlcplus: {
        name: `QLC+`
      }
    }
  })
};
</script>
