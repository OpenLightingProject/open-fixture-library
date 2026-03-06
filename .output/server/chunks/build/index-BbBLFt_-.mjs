import { _ as _export_sfc, a as useHead } from './server.mjs';
import { ssrRenderAttrs } from 'vue/server-renderer';
import { useSSRContext } from 'vue';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'lru-cache';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'consola';
import 'node:url';
import 'url';
import 'util';
import 'cors';
import 'express';
import 'openapi-backend';
import 'fs/promises';
import 'path';
import '@octokit/rest';
import 'ajv';
import 'ajv-formats';
import 'color-hash';
import 'jszip';
import 'xss';
import 'fast-xml-parser';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';

const _sfc_main = {
  setup() {
    useHead({ title: "About" });
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)} data-v-5787220d><h1 data-v-5787220d>About</h1><p data-v-5787220d>Created by Florian and Felix Edelmann.</p><p data-v-5787220d>The full code of the <em data-v-5787220d>Open Fixture Library</em> is <a href="https://github.com/OpenLightingProject/open-fixture-library" data-v-5787220d>open source</a> (licensed under the <a href="https://www.tldrlegal.com/license/mit-license" title="Massachusetts Institute of Technology License" data-v-5787220d>MIT License</a>) and everybody is invited to contribute!</p><h2 data-v-5787220d>Documentation</h2><p data-v-5787220d>The developer documentation can be found at the <a href="https://github.com/OpenLightingProject/open-fixture-library/tree/master/docs" data-v-5787220d>GitHub repository</a>. It contains an explanation of the <a href="https://github.com/OpenLightingProject/open-fixture-library/blob/master/docs/fixture-format.md" data-v-5787220d>JSON fixture format</a> we use internally, and from which fixture definitions in other formats can be exported by <a href="https://github.com/OpenLightingProject/open-fixture-library/blob/master/docs/plugins.md" data-v-5787220d>plugins</a>.</p><h2 data-v-5787220d>History</h2><p data-v-5787220d>We were used to programming lighting shows with the <a href="https://www.osram.de/ecue/" data-v-5787220d>e:cue</a> software and – because at some point we found it being limited in functionality – wanted to try out other programs. I built a <a href="https://github.com/FloEdelmann/bachelor" data-v-5787220d>DMX interface</a> with <a href="https://www.openlighting.org/ola/" data-v-5787220d>Open Lighting Architecture</a> to be able to try <a href="https://www.qlcplus.org/" data-v-5787220d>QLC+</a> and we kept on using that combination since then.</p><p data-v-5787220d>The problem we noticed during our testing phase was that all the fixture definitions we created for e:cue could not be easily converted for use with other software. The idea for a converter was born (<a href="https://github.com/FloEdelmann/fixture-converter" data-v-5787220d>fixture-converter on GitHub</a>, September 2016 – January 2017).</p><p data-v-5787220d>Since we wanted our work to be as useful for other people as possible, we decided to build a website that would store the fixtures in a wiki-like way (everybody can help improve it) and allow auto-generated fixture files in various formats to be downloaded. Creating new fixtures should be made as simple as possible with an online <a href="/fixture-editor" data-v-5787220d>Fixture Editor</a> that could also import from existing fixture definitions. For roughly a year (February 2017 – March 2018), the site kept getting better and better at <i data-v-5787220d>open-fixture-library.herokuapp.com</i>.</p><p data-v-5787220d>In March 2018, we decided it was time to get our own server and domain – and at the same time were invited to the <a href="https://github.com/OpenLightingProject" data-v-5787220d>Open Lighting Project</a> (see <a href="https://github.com/OpenLightingProject/open-fixture-library/issues/453" data-v-5787220d>issue #453</a> on GitHub), so here we are &quot;under the new flag&quot; at <a href="https://open-fixture-library.org" data-v-5787220d>open-fixture-library.org</a>! Of course there is still more to be improved, so feel free to contribute!</p><h2 data-v-5787220d>Used resources</h2><p data-v-5787220d> Fonts: <a href="https://www.latofonts.com/" data-v-5787220d>Lato</a> and <a href="https://levien.com/type/myfonts/inconsolata.html" class="monospaced" data-v-5787220d>Inconsolata</a><br data-v-5787220d> Icons: <a href="https://pictogrammers.com/library/mdi/" data-v-5787220d>Material Design Icons</a></p><h2 data-v-5787220d>Contribute</h2><p data-v-5787220d>See the <a href="https://github.com/OpenLightingProject/open-fixture-library#contribute" data-v-5787220d>project page on GitHub</a> to see how you can help.</p><h2 id="contact" data-v-5787220d>Contact</h2><p data-v-5787220d><a href="mailto:flo@open-fixture-library.org" data-v-5787220d>flo@open-fixture-library.org</a> or via <a href="https://github.com/FloEdelmann" data-v-5787220d>GitHub</a></p><h2 data-v-5787220d>Privacy</h2><p data-v-5787220d>We respect users&#39; privacy and thus collect as few data as possible. No personal data about our visitors is stored on our server or sent to other sites without users&#39; consent. The communication between users&#39; browsers and our server is encrypted via HTTPS. Videos are embetted with <a href="https://github.com/heiseonline/embetty" data-v-5787220d>embetty</a>, so no information is sent from users&#39; browsers to the video hosting platform (e.g. YouTube) until the video is played. The fixture editor only uses the entered data to open a pull request in our public GitHub repository; this means that the chosen author name and GitHub username – the only personal data – will be made public. Unfinished fixtures and the last submitted author name / GitHub username are saved locally in users&#39; browsers. Other technical measures to improve privacy and security <a href="https://developer.mozilla.org/en-US/observatory/analyze?host=open-fixture-library.org" data-v-5787220d>are implemented</a>.</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/about/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-5787220d"]]);

export { index as default };
//# sourceMappingURL=index-BbBLFt_-.mjs.map
