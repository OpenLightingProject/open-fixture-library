import { _ as _export_sfc, b as __nuxt_component_1$1, d as useRuntimeConfig, u as useRoute, c as createError, a as useHead } from './server.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BmOBtkDI.mjs';
import { u as useAsyncData } from './asyncData-CINZYKlw.mjs';
import { withCtx, createVNode, toDisplayString, openBlock, createBlock, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderComponent, ssrRenderStyle, ssrRenderList } from 'vue/server-renderer';
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
    const route = useRoute();
    const manufacturerKey = route.params.manufacturerKey;
    const { data: manufacturer, error } = await useAsyncData(
      `manufacturer-${manufacturerKey}`,
      () => $fetch(`/api/v1/manufacturers/${manufacturerKey}`)
    );
    if (error.value) {
      throw createError({ statusCode: error.value.statusCode || 500, statusMessage: error.value.message });
    }
    useHead({ title: manufacturer.value.name });
    return { manufacturer: manufacturer.value };
  },
  computed: {
    fixtures() {
      return this.manufacturer.fixtures;
    },
    organizationStructuredData() {
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": this.manufacturer.name,
        "brand": this.manufacturer.name,
        "sameAs": "website" in this.manufacturer ? this.manufacturer.website : void 0
      };
    },
    itemListStructuredData() {
      return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": this.fixtures.map((fixture, index2) => ({
          "@type": "ListItem",
          "position": index2 + 1,
          "url": `${useRuntimeConfig().public.websiteUrl}${this.manufacturer.key}/${fixture.key}`
        }))
      };
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_OflSvg = __nuxt_component_1$1;
  const _component_NuxtLink = __nuxt_component_0;
  _push(`<div${ssrRenderAttrs(_attrs)}><h1>${ssrInterpolate($setup.manufacturer.name)} fixtures</h1>`);
  if (`website` in $setup.manufacturer || `rdmId` in $setup.manufacturer) {
    _push(`<div class="grid-3">`);
    if (`website` in $setup.manufacturer) {
      _push(`<a${ssrRenderAttr("href", $setup.manufacturer.website)} class="card slim blue dark">`);
      _push(ssrRenderComponent(_component_OflSvg, {
        name: "web",
        class: "left"
      }, null, _parent));
      _push(`<span>Manufacturer website</span></a>`);
    } else {
      _push(`<!---->`);
    }
    if (`rdmId` in $setup.manufacturer) {
      _push(`<a${ssrRenderAttr("href", `http://rdm.openlighting.org/manufacturer/display?manufacturer=${$setup.manufacturer.rdmId}`)} rel="nofollow" class="card slim">`);
      _push(ssrRenderComponent(_component_OflSvg, {
        name: "ola",
        class: "left"
      }, null, _parent));
      _push(`<span>Open Lighting RDM database</span></a>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div>`);
  } else {
    _push(`<!---->`);
  }
  if (`comment` in $setup.manufacturer) {
    _push(`<p class="comment" style="${ssrRenderStyle({ "white-space": "pre-wrap" })}">${ssrInterpolate($setup.manufacturer.comment)}</p>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<div class="card"><ul class="list fixtures"><!--[-->`);
  ssrRenderList($options.fixtures, (fixture) => {
    _push(`<li>`);
    _push(ssrRenderComponent(_component_NuxtLink, {
      to: `/${$setup.manufacturer.key}/${fixture.key}`,
      style: { borderLeftColor: $setup.manufacturer.color },
      class: "manufacturer-color"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<span class="name"${_scopeId}>${ssrInterpolate(fixture.name)}</span><!--[-->`);
          ssrRenderList(fixture.categories, (cat) => {
            _push2(ssrRenderComponent(_component_OflSvg, {
              key: cat,
              name: cat,
              type: "fixture",
              class: "right inactive"
            }, null, _parent2, _scopeId));
          });
          _push2(`<!--]-->`);
        } else {
          return [
            createVNode("span", { class: "name" }, toDisplayString(fixture.name), 1),
            (openBlock(true), createBlock(Fragment, null, renderList(fixture.categories, (cat) => {
              return openBlock(), createBlock(_component_OflSvg, {
                key: cat,
                name: cat,
                type: "fixture",
                class: "right inactive"
              }, null, 8, ["name"]);
            }), 128))
          ];
        }
      }),
      _: 2
    }, _parent));
    _push(`</li>`);
  });
  _push(`<!--]--></ul></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/[manufacturerKey]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { index as default };
//# sourceMappingURL=index-DJoT7JiD.mjs.map
