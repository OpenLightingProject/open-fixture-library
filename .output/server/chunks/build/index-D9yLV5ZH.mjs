import { _ as __nuxt_component_0 } from './nuxt-link-BmOBtkDI.mjs';
import { _ as _export_sfc, b as __nuxt_component_1$1, c as createError, a as useHead } from './server.mjs';
import { u as useAsyncData } from './asyncData-CINZYKlw.mjs';
import { withCtx, createVNode, toDisplayString, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
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
  async setup() {
    const { data: plugins, error } = await useAsyncData("plugins", () => $fetch("/api/v1/plugins"));
    if (error.value) {
      throw createError({ statusCode: 500, statusMessage: error.value.message });
    }
    useHead({ title: "Plugins" });
    return { plugins: plugins.value };
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_NuxtLink = __nuxt_component_0;
  const _component_OflSvg = __nuxt_component_1$1;
  _push(`<div${ssrRenderAttrs(_attrs)} data-v-3eab0dc1><h1 data-v-3eab0dc1>Plugins</h1><p data-v-3eab0dc1>A plugin in <abbr title="Open Fixture Library" data-v-3eab0dc1>OFL</abbr> is a converter between our <a href="https://github.com/OpenLightingProject/open-fixture-library/blob/master/docs/fixture-format.md" data-v-3eab0dc1>internal fixture definition format</a> and an external format used by DMX lighting software or desks. Click on one of the plugins below to learn more about the corresponding fixture format and download instructions.</p><div class="grid-3 centered" data-v-3eab0dc1><div class="card" data-v-3eab0dc1><h2 data-v-3eab0dc1>Export plugins</h2><div class="hint" data-v-3eab0dc1>for downloading OFL fixtures in various formats</div><ul class="list" data-v-3eab0dc1><!--[-->`);
  ssrRenderList($setup.plugins.exportPlugins, (plugin) => {
    _push(`<li data-v-3eab0dc1>`);
    _push(ssrRenderComponent(_component_NuxtLink, {
      to: `/about/plugins/${plugin}`
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_OflSvg, {
            name: "puzzle",
            class: "left"
          }, null, _parent2, _scopeId));
          _push2(`<span class="name" data-v-3eab0dc1${_scopeId}>${ssrInterpolate($setup.plugins.data[plugin].name)}</span>`);
        } else {
          return [
            createVNode(_component_OflSvg, {
              name: "puzzle",
              class: "left"
            }),
            createVNode("span", { class: "name" }, toDisplayString($setup.plugins.data[plugin].name), 1)
          ];
        }
      }),
      _: 2
    }, _parent));
    _push(`</li>`);
  });
  _push(`<!--]--></ul></div><div class="card" data-v-3eab0dc1><h2 data-v-3eab0dc1>Import plugins</h2><div class="hint" data-v-3eab0dc1>for `);
  _push(ssrRenderComponent(_component_NuxtLink, { to: "/import-fixture-file" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`importing fixtures`);
      } else {
        return [
          createTextVNode("importing fixtures")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(` from other formats into OFL</div><ul class="list" data-v-3eab0dc1><!--[-->`);
  ssrRenderList($setup.plugins.importPlugins, (plugin) => {
    _push(`<li data-v-3eab0dc1>`);
    _push(ssrRenderComponent(_component_NuxtLink, {
      to: `/about/plugins/${plugin}`
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_OflSvg, {
            name: "puzzle",
            class: "left"
          }, null, _parent2, _scopeId));
          _push2(`<span class="name" data-v-3eab0dc1${_scopeId}>${ssrInterpolate($setup.plugins.data[plugin].name)}</span>`);
        } else {
          return [
            createVNode(_component_OflSvg, {
              name: "puzzle",
              class: "left"
            }),
            createVNode("span", { class: "name" }, toDisplayString($setup.plugins.data[plugin].name), 1)
          ];
        }
      }),
      _: 2
    }, _parent));
    _push(`</li>`);
  });
  _push(`<!--]--></ul></div></div><h3 data-v-3eab0dc1>New plugins</h3><p data-v-3eab0dc1>If your desired import or export format is not yet supported, please see if there is already an <a href="https://github.com/OpenLightingProject/open-fixture-library/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3Anew-plugin" rel="nofollow" data-v-3eab0dc1>open issue</a> for it in the GitHub repository. If so, try to add information there. Otherwise, please open a <a href="https://github.com/OpenLightingProject/open-fixture-library/issues/new?assignees=&amp;labels=new-plugin&amp;template=new-plugin.md&amp;title=Add+%5Bsoftware+%2F+console+name%5D+Plugin" rel="nofollow" data-v-3eab0dc1>new issue</a>.</p><p data-v-3eab0dc1>Useful information for developers: <a href="https://github.com/OpenLightingProject/open-fixture-library/blob/master/docs/plugins.md" data-v-3eab0dc1>Plugin documentation</a></p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/about/plugins/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-3eab0dc1"]]);

export { index as default };
//# sourceMappingURL=index-D9yLV5ZH.mjs.map
