import { _ as __nuxt_component_0 } from './nuxt-link-BmOBtkDI.mjs';
import { _ as _export_sfc, b as __nuxt_component_1$1, u as useRoute, c as createError, a as useHead } from './server.mjs';
import { r as register } from './register-vmKDb_jz.mjs';
import { u as useAsyncData } from './asyncData-CINZYKlw.mjs';
import { withCtx, createVNode, toDisplayString, openBlock, createBlock, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';
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
    const category = decodeURIComponent(route.params.category);
    if (!(category in register.categories)) {
      throw createError({ statusCode: 404, statusMessage: "Category not found" });
    }
    const { data: manufacturers, error } = await useAsyncData("manufacturers", () => $fetch("/api/v1/manufacturers"));
    if (error.value) {
      throw createError({ statusCode: 500, statusMessage: error.value.message });
    }
    useHead({ title: category });
    return { manufacturers: manufacturers.value };
  },
  computed: {
    categoryName() {
      return this.$route.params.category;
    },
    categoryClass() {
      return this.categoryName.toLowerCase().replaceAll(/\W+/g, "-");
    },
    fixtures() {
      return register.categories[this.categoryName].map((fullFixtureKey) => {
        const [manufacturerKey, fixtureKey] = fullFixtureKey.split("/");
        const manufacturerName = this.manufacturers[manufacturerKey].name;
        const fixtureName = register.filesystem[`${manufacturerKey}/${fixtureKey}`].name;
        return {
          key: fullFixtureKey,
          link: `/${fullFixtureKey}`,
          name: `${manufacturerName} ${fixtureName}`,
          categories: Object.keys(register.categories).filter(
            (category) => register.categories[category].includes(fullFixtureKey)
          ),
          color: this.manufacturers[manufacturerKey].color
        };
      });
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_NuxtLink = __nuxt_component_0;
  const _component_OflSvg = __nuxt_component_1$1;
  _push(`<div${ssrRenderAttrs(_attrs)}><h1>${ssrInterpolate($options.categoryName)} fixtures</h1><div class="card"><ul class="${ssrRenderClass([`category-${$options.categoryClass}`, "list fixtures"])}"><!--[-->`);
  ssrRenderList($options.fixtures, (fixture) => {
    _push(`<li>`);
    _push(ssrRenderComponent(_component_NuxtLink, {
      to: fixture.link,
      style: { borderLeftColor: fixture.color },
      class: "manufacturer-color"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<span class="name"${_scopeId}>${ssrInterpolate(fixture.name)}</span><!--[-->`);
          ssrRenderList(fixture.categories, (cat) => {
            _push2(ssrRenderComponent(_component_OflSvg, {
              key: cat,
              name: cat,
              class: ["right", { inactive: cat !== $options.categoryName }],
              type: "fixture"
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
                class: ["right", { inactive: cat !== $options.categoryName }],
                type: "fixture"
              }, null, 8, ["name", "class"]);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/categories/[category].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _category_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { _category_ as default };
//# sourceMappingURL=_category_-CWui5M68.mjs.map
