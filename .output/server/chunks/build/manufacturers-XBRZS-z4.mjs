import { _ as __nuxt_component_0 } from './nuxt-link-BmOBtkDI.mjs';
import { u as useAsyncData } from './asyncData-CINZYKlw.mjs';
import { _ as _export_sfc, c as createError, a as useHead } from './server.mjs';
import { withCtx, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
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
import 'perfect-debounce';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';

const _sfc_main = {
  async setup() {
    const { data: manufacturers2, error } = await useAsyncData("manufacturers", () => $fetch("/api/v1/manufacturers"));
    if (error.value) {
      throw createError({ statusCode: 500, statusMessage: error.value.message });
    }
    useHead({ title: "Manufacturers" });
    return { manufacturers: manufacturers2.value };
  },
  computed: {
    letters() {
      const letters = {};
      for (const manufacturerKey of Object.keys(this.manufacturers)) {
        let letter = manufacturerKey.charAt(0).toUpperCase();
        if (!/^[A-Z]$/.test(letter)) {
          letter = "#";
        }
        if (!(letter in letters)) {
          letters[letter] = {
            id: letter === "#" ? "letter-numeric" : `letter-${letter.toLowerCase()}`,
            manufacturers: []
          };
        }
        letters[letter].manufacturers.push({
          key: manufacturerKey,
          name: this.manufacturers[manufacturerKey].name,
          fixtureCount: this.manufacturers[manufacturerKey].fixtureCount,
          color: this.manufacturers[manufacturerKey].color
        });
      }
      return letters;
    }
  },
  unmounted() {
    (void 0).documentElement.style.scrollBehavior = "";
  },
  methods: {
    setScrollBehavior() {
      (void 0).documentElement.style.scrollBehavior = "smooth";
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_NuxtLink = __nuxt_component_0;
  _push(`<div${ssrRenderAttrs(_attrs)} data-v-0f1ed774><h1 data-v-0f1ed774>Manufacturers</h1><div class="toc" data-v-0f1ed774> Jump to: <!--[-->`);
  ssrRenderList($options.letters, (letterData, letter) => {
    _push(`<a${ssrRenderAttr("href", `#${letterData.id}`)} class="jump-link" data-v-0f1ed774>${ssrInterpolate(letter)}</a>`);
  });
  _push(`<!--]--></div><!--[-->`);
  ssrRenderList($options.letters, (letterData, letter) => {
    _push(`<div data-v-0f1ed774><h2${ssrRenderAttr("id", letterData.id)} data-v-0f1ed774>${ssrInterpolate(letter)}</h2><div class="manufacturers grid-4" data-v-0f1ed774><!--[-->`);
    ssrRenderList(letterData.manufacturers, (manufacturer) => {
      _push(ssrRenderComponent(_component_NuxtLink, {
        key: manufacturer.key,
        to: `/${manufacturer.key}`,
        style: { borderLeftColor: manufacturer.color },
        class: "card manufacturer-color"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="name" data-v-0f1ed774${_scopeId}>${ssrInterpolate(manufacturer.name)}</span><span class="fixtures hint" data-v-0f1ed774${_scopeId}>${ssrInterpolate(manufacturer.fixtureCount)} fixture${ssrInterpolate(manufacturer.fixtureCount === 1 ? `` : `s`)}</span>`);
          } else {
            return [
              createVNode("span", { class: "name" }, toDisplayString(manufacturer.name), 1),
              createVNode("span", { class: "fixtures hint" }, toDisplayString(manufacturer.fixtureCount) + " fixture" + toDisplayString(manufacturer.fixtureCount === 1 ? `` : `s`), 1)
            ];
          }
        }),
        _: 2
      }, _parent));
    });
    _push(`<!--]--></div></div>`);
  });
  _push(`<!--]--></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/manufacturers.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const manufacturers = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-0f1ed774"]]);

export { manufacturers as default };
//# sourceMappingURL=manufacturers-XBRZS-z4.mjs.map
