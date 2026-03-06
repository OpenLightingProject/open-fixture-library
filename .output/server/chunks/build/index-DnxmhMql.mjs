import { _ as __nuxt_component_0 } from './nuxt-link-BmOBtkDI.mjs';
import { _ as _export_sfc, b as __nuxt_component_1$1, a as useHead } from './server.mjs';
import { r as register } from './register-vmKDb_jz.mjs';
import { withCtx, createVNode, toDisplayString, useSSRContext } from 'vue';
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

const _sfc_main = {
  data() {
    return {
      categories: Object.keys(register.categories).toSorted((a, b) => a.localeCompare(b, "en")).map(
        (category) => ({
          name: category,
          fixtureCount: register.categories[category].length
        })
      )
    };
  },
  setup() {
    useHead({ title: "Categories" });
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_NuxtLink = __nuxt_component_0;
  const _component_OflSvg = __nuxt_component_1$1;
  _push(`<div${ssrRenderAttrs(_attrs)}><h1>Categories</h1><div class="categories grid-3"><!--[-->`);
  ssrRenderList($data.categories, (category) => {
    _push(ssrRenderComponent(_component_NuxtLink, {
      key: category.name,
      to: `/categories/${encodeURIComponent(category.name)}`,
      class: "card card-category"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_OflSvg, {
            name: category.name,
            type: "fixture"
          }, null, _parent2, _scopeId));
          _push2(`<h2${_scopeId}>${ssrInterpolate(category.name)}</h2><div class="fixtures"${_scopeId}>${ssrInterpolate(category.fixtureCount)} fixture${ssrInterpolate(category.fixtureCount === 1 ? `` : `s`)}</div>`);
        } else {
          return [
            createVNode(_component_OflSvg, {
              name: category.name,
              type: "fixture"
            }, null, 8, ["name"]),
            createVNode("h2", null, toDisplayString(category.name), 1),
            createVNode("div", { class: "fixtures" }, toDisplayString(category.fixtureCount) + " fixture" + toDisplayString(category.fixtureCount === 1 ? `` : `s`), 1)
          ];
        }
      }),
      _: 2
    }, _parent));
  });
  _push(`<!--]--></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/categories/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { index as default };
//# sourceMappingURL=index-DnxmhMql.mjs.map
