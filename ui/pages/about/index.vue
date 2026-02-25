<template>
  <div>
    <h1>About</h1>

    <p>Created by Florian and Felix Edelmann.</p>
    <p>The full code of the <em>Open Fixture Library</em> is <a href="https://github.com/OpenLightingProject/open-fixture-library">open source</a> (licensed under the <a href="https://www.tldrlegal.com/license/mit-license" title="Massachusetts Institute of Technology License">MIT License</a>) and everybody is invited to contribute!</p>

    <h2>Documentation</h2>
    <p>The developer documentation can be found at the <a href="https://github.com/OpenLightingProject/open-fixture-library/tree/master/docs">GitHub repository</a>. It contains an explanation of the <a href="https://github.com/OpenLightingProject/open-fixture-library/blob/master/docs/fixture-format.md">JSON fixture format</a> we use internally, and from which fixture definitions in other formats can be exported by <a href="https://github.com/OpenLightingProject/open-fixture-library/blob/master/docs/plugins.md">plugins</a>.</p>

    <h2>History</h2>
    <p>We were used to programming lighting shows with the <a href="https://www.osram.de/ecue/">e:cue</a> software and – because at some point we found it being limited in functionality – wanted to try out other programs. I built a <a href="https://github.com/FloEdelmann/bachelor">DMX interface</a> with <a href="https://www.openlighting.org/ola/">Open Lighting Architecture</a> to be able to try <a href="https://www.qlcplus.org/">QLC+</a> and we kept on using that combination since then.</p>
    <p>The problem we noticed during our testing phase was that all the fixture definitions we created for e:cue could not be easily converted for use with other software. The idea for a converter was born (<a href="https://github.com/FloEdelmann/fixture-converter">fixture-converter on GitHub</a>, September 2016 – January 2017).</p>
    <p>Since we wanted our work to be as useful for other people as possible, we decided to build a website that would store the fixtures in a wiki-like way (everybody can help improve it) and allow auto-generated fixture files in various formats to be downloaded. Creating new fixtures should be made as simple as possible with an online <a href="/fixture-editor">Fixture Editor</a> that could also import from existing fixture definitions. For roughly a year (February 2017 – March 2018), the site kept getting better and better at <i>open-fixture-library.herokuapp.com</i>.</p>
    <p>In March 2018, we decided it was time to get our own server and domain – and at the same time were invited to the <a href="https://github.com/OpenLightingProject">Open Lighting Project</a> (see <a href="https://github.com/OpenLightingProject/open-fixture-library/issues/453">issue #453</a> on GitHub), so here we are "under the new flag" at <a href="https://open-fixture-library.org">open-fixture-library.org</a>! Of course there is still more to be improved, so feel free to contribute!</p>

    <h2>Used resources</h2>
    <p>
      Fonts: <a href="https://www.latofonts.com/">Lato</a> and <a href="https://levien.com/type/myfonts/inconsolata.html" class="monospaced">Inconsolata</a><br>
      Icons: <a href="https://pictogrammers.com/library/mdi/">Material Design Icons</a>
    </p>

    <h2>Contribute</h2>
    <p>See the <a href="https://github.com/OpenLightingProject/open-fixture-library#contribute">project page on GitHub</a> to see how you can help.</p>

    <h2 id="contact">Contact</h2>
    <p><a href="mailto:flo@open-fixture-library.org">flo@open-fixture-library.org</a> or via <a href="https://github.com/FloEdelmann">GitHub</a></p>

    <h2>Privacy</h2>
    <p>We respect users' privacy and thus collect as few data as possible. No personal data about our visitors is stored on our server or sent to other sites without users' consent. The communication between users' browsers and our server is encrypted via HTTPS. Videos are embetted with <a href="https://github.com/heiseonline/embetty">embetty</a>, so no information is sent from users' browsers to the video hosting platform (e.g. YouTube) until the video is played. The fixture editor only uses the entered data to open a pull request in our public GitHub repository; this means that the chosen author name and GitHub username – the only personal data – will be made public. Unfinished fixtures and the last submitted author name / GitHub username are saved locally in users' browsers. Other technical measures to improve privacy and security <a href="https://developer.mozilla.org/en-US/observatory/analyze?host=open-fixture-library.org">are implemented</a>.</p>

  </div>
</template>

<style lang="scss" scoped>
p {
  text-align: justify;
}

h2 {
  margin: 1.5rem 0 -0.5rem;
  line-height: 1.3;
}

.monospaced {
  font-family: $font-stack-code;
  font-weight: 400;
}
</style>

<script>
export default {
  head() {
    const title = `About`;

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
