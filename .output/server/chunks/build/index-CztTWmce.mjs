import { _ as __nuxt_component_0, a as __nuxt_component_4 } from './DownloadButton-DO934bEq.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-BmOBtkDI.mjs';
import { _ as _export_sfc, b as __nuxt_component_1$1, c as createError, a as useHead, d as useRuntimeConfig } from './server.mjs';
import { r as register } from './register-vmKDb_jz.mjs';
import { u as useAsyncData } from './asyncData-CINZYKlw.mjs';
import { withCtx, createVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';
import '../_/object.mjs';
import '../_/oneOf.mjs';
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
import 'perfect-debounce';

const _sfc_main = {
  components: {
    DownloadButton: __nuxt_component_4,
    FixtureHeader: __nuxt_component_0
  },
  async setup() {
    const { data: manufacturers, error } = await useAsyncData("manufacturers", () => $fetch("/api/v1/manufacturers"));
    if (error.value) {
      throw createError({ statusCode: 500, statusMessage: error.value.message });
    }
    const runtimeConfig = useRuntimeConfig();
    useHead({
      script: [
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Open Fixture Library",
            "url": runtimeConfig.public.websiteUrl,
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${runtimeConfig.public.websiteUrl}search?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          })
        },
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Open Fixture Library",
            "description": "Create and browse fixture definitions for lighting equipment online and download them in the right format for your DMX control software!",
            "url": runtimeConfig.public.websiteUrl,
            "logo": `${runtimeConfig.public.websiteUrl}ofl-logo.svg`
          })
        }
      ]
    });
    return { manufacturers: manufacturers.value };
  },
  data() {
    return {
      lastUpdated: [],
      recentContributors: [],
      fixtureCount: Object.keys(register.filesystem).filter(
        (fixtureKey) => !("redirectTo" in register.filesystem[fixtureKey]) || register.filesystem[fixtureKey].reason === "SameAsDifferentBrand"
      ).length
    };
  },
  created() {
    this.lastUpdated = register.lastUpdated.slice(0, 5).map(
      (fixtureKey) => ({
        key: fixtureKey,
        name: this.getFixtureName(fixtureKey),
        action: register.filesystem[fixtureKey].lastAction,
        date: new Date(register.filesystem[fixtureKey].lastActionDate),
        color: register.colors[fixtureKey.split("/")[0]]
      })
    );
    this.recentContributors = Object.keys(register.contributors).slice(0, 5).map(
      (contributor) => {
        const latestFixtureKey = getLatestFixtureKey(contributor);
        return {
          name: contributor,
          number: register.contributors[contributor].fixtures.length,
          latestFixtureKey,
          latestFixtureName: this.getFixtureName(latestFixtureKey)
        };
      }
    );
  },
  methods: {
    /**
     * @param {string} fixtureKey The combined manufacturer / fixture key.
     * @returns {string} The manufacturer and fixture names, separated by a space.
     */
    getFixtureName(fixtureKey) {
      const manufacturerKey = fixtureKey.split("/")[0];
      const manufacturerName = this.manufacturers[manufacturerKey].name;
      const fixtureName = register.filesystem[fixtureKey].name;
      return `${manufacturerName} ${fixtureName}`;
    }
  }
};
function getLatestFixtureKey(contributor) {
  return register.lastUpdated.find(
    (key) => register.contributors[contributor].fixtures.includes(key)
  );
}
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_FixtureHeader = __nuxt_component_0;
  const _component_DownloadButton = __nuxt_component_4;
  const _component_NuxtLink = __nuxt_component_0$1;
  const _component_OflSvg = __nuxt_component_1$1;
  _push(`<div${ssrRenderAttrs(_attrs)}>`);
  _push(ssrRenderComponent(_component_FixtureHeader, null, {
    title: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<h1${_scopeId}>Open Fixture Library</h1>`);
      } else {
        return [
          createVNode("h1", null, "Open Fixture Library")
        ];
      }
    }),
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_DownloadButton, {
          "fixture-count": $data.fixtureCount,
          "button-style": "home",
          "show-help": ""
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_DownloadButton, {
            "fixture-count": $data.fixtureCount,
            "button-style": "home",
            "show-help": ""
          }, null, 8, ["fixture-count"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`<h3>Create and browse fixture definitions for lighting equipment online and download them in the right format for your DMX control software!</h3><p><abbr title="Open Fixture Library">OFL</abbr> collects DMX fixture definitions in a JSON format and automatically exports them to the right format for every `);
  _push(ssrRenderComponent(_component_NuxtLink, { to: "/about/plugins" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`supported lighting software`);
      } else {
        return [
          createTextVNode("supported lighting software")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`. Everybody can <a href="https://github.com/OpenLightingProject/open-fixture-library/blob/master/docs/CONTRIBUTING.md">contribute</a> and help to improve! Thanks!</p><div class="grid-3 centered"><section class="card"><h2>Recently updated fixtures</h2><ul class="list"><!--[-->`);
  ssrRenderList($data.lastUpdated, (fixture) => {
    _push(`<li>`);
    _push(ssrRenderComponent(_component_NuxtLink, {
      to: `/${fixture.key}`,
      style: { borderLeftColor: fixture.color },
      class: "manufacturer-color"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`${ssrInterpolate(fixture.name)} <div class="hint"${_scopeId}>${ssrInterpolate(fixture.action)} <time${ssrRenderAttr("datetime", fixture.date.toISOString())}${ssrRenderAttr("title", fixture.date.toISOString())}${_scopeId}>${ssrInterpolate(fixture.date.toISOString().replace(/T.*?$/, ``))}</time></div>`);
        } else {
          return [
            createTextVNode(toDisplayString(fixture.name) + " ", 1),
            createVNode("div", { class: "hint" }, [
              createTextVNode(toDisplayString(fixture.action) + " ", 1),
              createVNode("time", {
                datetime: fixture.date.toISOString(),
                title: fixture.date.toISOString()
              }, toDisplayString(fixture.date.toISOString().replace(/T.*?$/, ``)), 9, ["datetime", "title"])
            ])
          ];
        }
      }),
      _: 2
    }, _parent));
    _push(`</li>`);
  });
  _push(`<!--]--></ul>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/manufacturers",
    class: "card dark blue big-button",
    title: "Browse all fixtures by manufacturer"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_OflSvg, { name: "folder-multiple" }, null, _parent2, _scopeId));
        _push2(`<h2${_scopeId}>Browse fixtures</h2>`);
      } else {
        return [
          createVNode(_component_OflSvg, { name: "folder-multiple" }),
          createVNode("h2", null, "Browse fixtures")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</section><section class="card"><h2>Recent contributors</h2><ul class="list"><!--[-->`);
  ssrRenderList($data.recentContributors, (contributor) => {
    _push(`<li>`);
    _push(ssrRenderComponent(_component_NuxtLink, {
      to: `/${contributor.latestFixtureKey}`
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`${ssrInterpolate(contributor.name)} <div class="hint"${_scopeId}>${ssrInterpolate(contributor.number)} fixture${ssrInterpolate(contributor.number === 1 ? `` : `s`)}, latest: ${ssrInterpolate(contributor.latestFixtureName)}</div>`);
        } else {
          return [
            createTextVNode(toDisplayString(contributor.name) + " ", 1),
            createVNode("div", { class: "hint" }, toDisplayString(contributor.number) + " fixture" + toDisplayString(contributor.number === 1 ? `` : `s`) + ", latest: " + toDisplayString(contributor.latestFixtureName), 1)
          ];
        }
      }),
      _: 2
    }, _parent));
    _push(`</li>`);
  });
  _push(`<!--]--></ul>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/fixture-editor",
    class: "card dark light-green big-button",
    title: "Become a top contributer yourself!"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_OflSvg, { name: "plus" }, null, _parent2, _scopeId));
        _push2(`<h2${_scopeId}>Add fixture</h2>`);
      } else {
        return [
          createVNode(_component_OflSvg, { name: "plus" }),
          createVNode("h2", null, "Add fixture")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</section></div><p><strong>🙏 Help wanted!</strong> There are <a href="https://github.com/OpenLightingProject/open-fixture-library/pulls?q=is%3Apr+is%3Aopen+label%3Anew-fixture+sort%3Aupdated-desc">a lot of pull requests</a> for new fixtures that are not yet reviewed and merged. Reviewing them (and maybe fixing smaller issues) helps get this number down and the number of fixtures in OFL up! See the <a href="https://github.com/OpenLightingProject/open-fixture-library/blob/master/docs/CONTRIBUTING.md#fixtures">step-by-step instructions for fixture reviews</a>.</p><div class="grid-3 centered"><a href="https://github.com/OpenLightingProject/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+-label%3Abug" rel="nofollow" class="card slim">`);
  _push(ssrRenderComponent(_component_OflSvg, {
    name: "lightbulb-on-outline",
    class: "left"
  }, null, _parent));
  _push(`<span>Request feature</span></a><a href="https://github.com/OpenLightingProject/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Abug" rel="nofollow" class="card slim">`);
  _push(ssrRenderComponent(_component_OflSvg, {
    name: "bug",
    class: "left"
  }, null, _parent));
  _push(`<span>Report problem</span></a><a href="https://github.com/OpenLightingProject/open-fixture-library" class="card slim">`);
  _push(ssrRenderComponent(_component_OflSvg, {
    name: "github-circle",
    class: "left"
  }, null, _parent));
  _push(`<span>View source</span></a></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { index as default };
//# sourceMappingURL=index-CztTWmce.mjs.map
