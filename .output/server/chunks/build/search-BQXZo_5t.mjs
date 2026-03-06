import { _ as __nuxt_component_2 } from './LabeledInput-818znnbz.mjs';
import { _ as __nuxt_component_3 } from './ConditionalDetails-BGP2N0Fc.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BmOBtkDI.mjs';
import { r as register } from './register-vmKDb_jz.mjs';
import { u as useAsyncData } from './asyncData-CINZYKlw.mjs';
import { _ as _export_sfc, c as createError } from './server.mjs';
import { mergeProps, withCtx, withDirectives, createVNode, vModelText, openBlock, createBlock, Fragment, renderList, toDisplayString, vModelSelect, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList } from 'vue/server-renderer';
import '../_/object.mjs';
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
  components: {
    ConditionalDetails: __nuxt_component_3,
    LabeledInput: __nuxt_component_2
  },
  async setup() {
    const { data: manufacturers, error } = await useAsyncData("manufacturers", () => $fetch("/api/v1/manufacturers"));
    if (error.value) {
      throw createError({ statusCode: 500, statusMessage: error.value.message });
    }
    return { manufacturers: manufacturers.value };
  },
  data() {
    return {
      searchFor: "",
      searchQuery: "",
      manufacturersQuery: [],
      categoriesQuery: [],
      detailsInitiallyOpen: null,
      results: [],
      categories: Object.keys(register.categories).toSorted((a, b) => a.localeCompare(b, "en")),
      loading: false,
      isBrowser: false
    };
  },
  async mounted() {
    this.isBrowser = true;
    await this.fetchSearchResults();
  },
  computed: {
    fixtureResults() {
      return this.results.map((key) => {
        const manufacturer = key.split("/")[0];
        return {
          key,
          name: `${this.manufacturers[manufacturer].name} ${register.filesystem[key].name}`,
          color: register.colors[manufacturer]
        };
      });
    },
    pageTitle() {
      return this.searchFor ? `Search "${this.searchFor}"` : "Search";
    }
  },
  watch: {
    "$route.query"() {
      this.fetchSearchResults();
    }
  },
  methods: {
    async fetchSearchResults() {
      this.loading = true;
      const sanitizedQuery = getSanitizedQuery(this.$route.query);
      this.searchQuery = sanitizedQuery.search;
      this.manufacturersQuery = sanitizedQuery.manufacturers;
      this.categoriesQuery = sanitizedQuery.categories;
      this.searchFor = sanitizedQuery.search;
      if (this.detailsInitiallyOpen === null) {
        this.detailsInitiallyOpen = this.manufacturersQuery.length > 0 || this.categoriesQuery.length > 0;
      }
      try {
        this.results = await $fetch("/api/v1/get-search-results", {
          method: "POST",
          body: {
            searchQuery: sanitizedQuery.search,
            manufacturersQuery: sanitizedQuery.manufacturers,
            categoriesQuery: sanitizedQuery.categories
          }
        });
      } catch {
        this.results = [];
      } finally {
        this.loading = false;
      }
    },
    onSubmit() {
      if (this.searchQuery === "") {
        return;
      }
      this.$router.push({
        path: this.$route.path,
        query: {
          q: this.searchQuery,
          manufacturers: this.manufacturersQuery,
          categories: this.categoriesQuery
        }
      });
    }
  }
};
function getSanitizedQuery(query) {
  const searchQuery = (query.q || "").trim();
  let manufacturersQuery = query.manufacturers || [];
  if (typeof manufacturersQuery === "string") {
    manufacturersQuery = [manufacturersQuery];
  }
  let categoriesQuery = query.categories || [];
  if (typeof categoriesQuery === "string") {
    categoriesQuery = [categoriesQuery];
  }
  return {
    search: searchQuery,
    manufacturers: manufacturersQuery,
    categories: categoriesQuery
  };
}
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2;
  const _component_ConditionalDetails = __nuxt_component_3;
  const _component_NuxtLink = __nuxt_component_0;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "search" }, _attrs))} data-v-060fb558>`);
  if ($data.searchFor) {
    _push(`<h1 data-v-060fb558>Search <em data-v-060fb558>${ssrInterpolate($data.searchFor)}</em></h1>`);
  } else {
    _push(`<h1 data-v-060fb558>Search</h1>`);
  }
  _push(`<form class="filter" action="/search" data-v-060fb558>`);
  _push(ssrRenderComponent(_component_LabeledInput, { label: "Search query" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<input${ssrRenderAttr("value", $data.searchQuery)} type="search" name="q" data-v-060fb558${_scopeId}>`);
      } else {
        return [
          withDirectives(createVNode("input", {
            "onUpdate:modelValue": ($event) => $data.searchQuery = $event,
            type: "search",
            name: "q"
          }, null, 8, ["onUpdate:modelValue"]), [
            [vModelText, $data.searchQuery]
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_ConditionalDetails, { open: $data.detailsInitiallyOpen }, {
    summary: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Filter results`);
      } else {
        return [
          createTextVNode("Filter results")
        ];
      }
    }),
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<select name="manufacturers" multiple data-v-060fb558${_scopeId}><option${ssrIncludeBooleanAttr($data.manufacturersQuery.length === 0) ? " selected" : ""} value="" data-v-060fb558${ssrIncludeBooleanAttr(Array.isArray($data.manufacturersQuery) ? ssrLooseContain($data.manufacturersQuery, "") : ssrLooseEqual($data.manufacturersQuery, "")) ? " selected" : ""}${_scopeId}>Filter by manufacturer</option><!--[-->`);
        ssrRenderList($setup.manufacturers, (man, manufacturerKey) => {
          _push2(`<option${ssrIncludeBooleanAttr($data.manufacturersQuery.includes(manufacturerKey)) ? " selected" : ""}${ssrRenderAttr("value", manufacturerKey)} data-v-060fb558${ssrIncludeBooleanAttr(Array.isArray($data.manufacturersQuery) ? ssrLooseContain($data.manufacturersQuery, manufacturerKey) : ssrLooseEqual($data.manufacturersQuery, manufacturerKey)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(man.name)}</option>`);
        });
        _push2(`<!--]--></select><select name="categories" multiple data-v-060fb558${_scopeId}><option${ssrIncludeBooleanAttr($data.categoriesQuery.length === 0) ? " selected" : ""} value="" data-v-060fb558${ssrIncludeBooleanAttr(Array.isArray($data.categoriesQuery) ? ssrLooseContain($data.categoriesQuery, "") : ssrLooseEqual($data.categoriesQuery, "")) ? " selected" : ""}${_scopeId}>Filter by category</option><!--[-->`);
        ssrRenderList($data.categories, (cat) => {
          _push2(`<option${ssrIncludeBooleanAttr($data.categoriesQuery.includes(cat)) ? " selected" : ""}${ssrRenderAttr("value", cat)} data-v-060fb558${ssrIncludeBooleanAttr(Array.isArray($data.categoriesQuery) ? ssrLooseContain($data.categoriesQuery, cat) : ssrLooseEqual($data.categoriesQuery, cat)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(cat)}</option>`);
        });
        _push2(`<!--]--></select>`);
      } else {
        return [
          withDirectives(createVNode("select", {
            "onUpdate:modelValue": ($event) => $data.manufacturersQuery = $event,
            name: "manufacturers",
            multiple: ""
          }, [
            createVNode("option", {
              selected: $data.manufacturersQuery.length === 0,
              value: ""
            }, "Filter by manufacturer", 8, ["selected"]),
            (openBlock(true), createBlock(Fragment, null, renderList($setup.manufacturers, (man, manufacturerKey) => {
              return openBlock(), createBlock("option", {
                key: manufacturerKey,
                selected: $data.manufacturersQuery.includes(manufacturerKey),
                value: manufacturerKey
              }, toDisplayString(man.name), 9, ["selected", "value"]);
            }), 128))
          ], 8, ["onUpdate:modelValue"]), [
            [vModelSelect, $data.manufacturersQuery]
          ]),
          withDirectives(createVNode("select", {
            "onUpdate:modelValue": ($event) => $data.categoriesQuery = $event,
            name: "categories",
            multiple: ""
          }, [
            createVNode("option", {
              selected: $data.categoriesQuery.length === 0,
              value: ""
            }, "Filter by category", 8, ["selected"]),
            (openBlock(true), createBlock(Fragment, null, renderList($data.categories, (cat) => {
              return openBlock(), createBlock("option", {
                key: cat,
                selected: $data.categoriesQuery.includes(cat),
                value: cat
              }, toDisplayString(cat), 9, ["selected", "value"]);
            }), 128))
          ], 8, ["onUpdate:modelValue"]), [
            [vModelSelect, $data.categoriesQuery]
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`<button${ssrIncludeBooleanAttr($data.searchQuery === `` && $data.isBrowser) ? " disabled" : ""} type="submit" class="primary" data-v-060fb558>Search</button></form><div class="search-results" data-v-060fb558>`);
  if (!$data.searchFor) {
    _push(`<div class="card" data-v-060fb558> Please enter a search query in the form above. </div>`);
  } else if ($data.loading) {
    _push(`<div class="card" data-v-060fb558> Loading… </div>`);
  } else if ($data.results.length > 0) {
    _push(`<div class="card" data-v-060fb558><ul class="list fixtures" data-v-060fb558><!--[-->`);
    ssrRenderList($options.fixtureResults, (fixture) => {
      _push(`<li data-v-060fb558>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/${fixture.key}`,
        style: { borderLeftColor: fixture.color },
        class: "manufacturer-color"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="name" data-v-060fb558${_scopeId}>${ssrInterpolate(fixture.name)}</span>`);
          } else {
            return [
              createVNode("span", { class: "name" }, toDisplayString(fixture.name), 1)
            ];
          }
        }),
        _: 2
      }, _parent));
      _push(`</li>`);
    });
    _push(`<!--]--></ul></div>`);
  } else {
    _push(`<div class="card" data-v-060fb558> Your search for <em data-v-060fb558>${ssrInterpolate($data.searchFor)}</em> did not match any fixtures. Try using another query or browse by `);
    _push(ssrRenderComponent(_component_NuxtLink, { to: "/manufacturers" }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`manufacturer`);
        } else {
          return [
            createTextVNode("manufacturer")
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(` or `);
    _push(ssrRenderComponent(_component_NuxtLink, { to: "/categories" }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`category`);
        } else {
          return [
            createTextVNode("category")
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(`. </div>`);
  }
  _push(`</div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/search.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const search = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-060fb558"]]);

export { search as default };
//# sourceMappingURL=search-BQXZo_5t.mjs.map
