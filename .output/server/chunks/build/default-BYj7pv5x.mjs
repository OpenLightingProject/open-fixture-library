import { _ as __nuxt_component_0$1 } from './nuxt-link-BmOBtkDI.mjs';
import { _ as _export_sfc, o as __nuxt_component_2, b as __nuxt_component_1$1, e as __nuxt_component_2$2 } from './server.mjs';
import { mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
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

const storageKey = "theme";
const _sfc_main$3 = {
  data() {
    return {
      cssVariablesSupported: false,
      theme: "light",
      prefersDarkMediaQuery: null
    };
  },
  computed: {
    otherTheme() {
      return this.theme === "light" ? "dark" : "light";
    }
  },
  watch: {
    theme: {
      handler(theme) {
      }
    }
  },
  mounted() {
    this.cssVariablesSupported = (void 0).CSS && CSS.supports("color", "var(--primary)");
    if (!this.cssVariablesSupported) {
      return;
    }
    (void 0).addEventListener("storage", this.onStorageChange);
    this.prefersDarkMediaQuery = (void 0).matchMedia("(prefers-color-scheme: dark)");
    this.prefersDarkMediaQuery.addEventListener("change", this.onMediaQueryMatchChange);
    this.onMediaQueryMatchChange();
  },
  beforeUnmount() {
    (void 0).removeEventListener("storage", this.onStorageChange);
    if (this.prefersDarkMediaQuery) {
      this.prefersDarkMediaQuery.removeEventListener("change", this.onMediaQueryMatchChange);
    }
  },
  methods: {
    getDefaultPreferredTheme() {
      return this.prefersDarkMediaQuery.matches ? "dark" : "light";
    },
    onMediaQueryMatchChange() {
      const savedTheme = localStorage.getItem(storageKey);
      this.theme = savedTheme || this.getDefaultPreferredTheme();
    },
    onStorageChange({ key, newValue }) {
      if (key === storageKey) {
        this.theme = newValue || this.getDefaultPreferredTheme();
      }
    },
    toggleTheme() {
      this.theme = this.otherTheme;
      if (this.theme === this.getDefaultPreferredTheme()) {
        localStorage.removeItem(storageKey);
      } else {
        localStorage.setItem(storageKey, this.theme);
      }
    }
  }
};
function _sfc_ssrRender$3(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_OflSvg = __nuxt_component_1$1;
  if ($data.cssVariablesSupported) {
    _push(`<button${ssrRenderAttrs(mergeProps({
      type: "button",
      title: `Switch to ${$options.otherTheme} theme`
    }, _attrs))}>`);
    _push(ssrRenderComponent(_component_OflSvg, { name: "theme-light-dark" }, null, _parent));
    _push(`</button>`);
  } else {
    _push(`<!---->`);
  }
}
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ThemeSwitcher.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const ThemeSwitcher = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$3, [["ssrRender", _sfc_ssrRender$3]]), { __name: "ThemeSwitcher" });
const _sfc_main$2 = {
  components: {
    ThemeSwitcher
  },
  emits: {
    "focus-content": () => true
  },
  data() {
    return {
      searchQuery: "",
      searchFieldFocused: false
    };
  },
  created() {
    this.searchQuery = this.$route.query.q || "";
  },
  mounted() {
    this.$router.afterEach(() => this.updateSearchQuery());
  },
  methods: {
    updateSearchQuery() {
      this.searchQuery = this.$route.query.q || "";
    },
    focusContent(event) {
      if (event.target?.closest("a")) {
        this.$emit("focus-content");
      }
    },
    search() {
      this.$router.push({
        path: "/search",
        query: {
          q: this.searchQuery
        }
      });
      this.$emit("focus-content");
    }
  }
};
function _sfc_ssrRender$2(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_NuxtLink = __nuxt_component_0$1;
  const _component_OflSvg = __nuxt_component_1$1;
  const _component_ClientOnly = __nuxt_component_2$2;
  _push(`<header${ssrRenderAttrs(_attrs)} data-v-fb1efbc5><nav data-v-fb1efbc5><div class="left-nav" data-v-fb1efbc5>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    class: ["home-logo", { "hidden-by-search-field": $data.searchFieldFocused }],
    to: "/",
    exact: "",
    title: "Home"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(` Open Fixture Library `);
      } else {
        return [
          createTextVNode(" Open Fixture Library ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`<form action="/search" data-v-fb1efbc5><div data-v-fb1efbc5><input${ssrRenderAttr("value", $data.searchQuery)} type="search" name="q" placeholder="Search fixtures" aria-label="Search fixtures" data-v-fb1efbc5></div><button class="icon-button" type="submit" data-v-fb1efbc5> Search `);
  _push(ssrRenderComponent(_component_OflSvg, { name: "magnify" }, null, _parent));
  _push(`</button></form></div><div class="right-nav" data-v-fb1efbc5>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/fixture-editor",
    title: "Fixture editor"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(` Add fixture `);
      } else {
        return [
          createTextVNode(" Add fixture ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/manufacturers",
    title: "Browse fixtures by manufacturer"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(` Manufacturers `);
      } else {
        return [
          createTextVNode(" Manufacturers ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/categories",
    title: "Browse fixtures by category"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(` Categories `);
      } else {
        return [
          createTextVNode(" Categories ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/about",
    title: "About the project"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(` About `);
      } else {
        return [
          createTextVNode(" About ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
  _push(`</div></nav></header>`);
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/HeaderBar.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender$2], ["__scopeId", "data-v-fb1efbc5"]]), { __name: "HeaderBar" });
const _sfc_main$1 = {
  data() {
    return {
      isClimateStrike: false,
      showClimateStrikeBanner: false,
      strikeDateString: "2023-09-15",
      climateStrikeWebsite: "https://fridaysforfuture.org/september15/",
      hashtags: ["climatejustice", "FridaysForFuture", "climatestrike", "EndFossilFuels", "ClimateForChange"]
    };
  },
  created() {
    const strikeDate = new Date(this.strikeDateString);
    strikeDate.setHours(0, 0, 0, 0);
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const bannerStartDate = new Date(strikeDate);
    bannerStartDate.setDate(strikeDate.getDate() - 14);
    this.isClimateStrike = strikeDate.getTime() === today.getTime();
    this.showClimateStrikeBanner = bannerStartDate.getTime() <= today.getTime() && today.getTime() < strikeDate.getTime();
  },
  mounted() {
    if (this.isClimateStrike) {
      (void 0).documentElement.style.overflow = "hidden";
    }
  }
};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  if ($data.isClimateStrike) {
    _push(`<div${ssrRenderAttrs(mergeProps({
      id: "climate-strike-overlay",
      class: "climate-strike"
    }, _attrs))} data-v-9a17941a><h1 data-v-9a17941a> The Open Fixture Library joins the <a${ssrRenderAttr("href", $data.climateStrikeWebsite)} data-v-9a17941a>Global Climate Strike</a> and is therefore not available today. </h1><div data-v-9a17941a><h2 data-v-9a17941a>Why should this affect me?</h2><p data-v-9a17941a> Because climate change affects everyone. Please read the <a href="https://fridaysforfuture.org/take-action/reasons-to-strike/" data-v-9a17941a>reasons to strike</a>. </p><h2 data-v-9a17941a>When is OFL back again?</h2><p data-v-9a17941a> The global climate strike takes place on ${ssrInterpolate($data.strikeDateString)}.<br data-v-9a17941a> After that day, OFL is back to normal again. </p><h2 data-v-9a17941a>Where can I learn more?</h2><p data-v-9a17941a>Please refer to the <a href="https://fridaysforfuture.org/" data-v-9a17941a>Fridays for Future website</a>.</p><div class="hashtags" data-v-9a17941a><!--[-->`);
    ssrRenderList($data.hashtags, (hashtag) => {
      _push(`<a${ssrRenderAttr("href", `https://mastodon.social/tags/${hashtag}`)} data-v-9a17941a>#${ssrInterpolate(hashtag)}</a>`);
    });
    _push(`<!--]--></div></div></div>`);
  } else if ($data.showClimateStrikeBanner) {
    _push(`<div${ssrRenderAttrs(mergeProps({
      id: "climate-strike-banner",
      class: "climate-strike"
    }, _attrs))} data-v-9a17941a> We are joining the <a${ssrRenderAttr("href", $data.climateStrikeWebsite)} target="_blank" rel="noopener" data-v-9a17941a>Global Climate Strike</a>, so this website will not be available on ${ssrInterpolate($data.strikeDateString)}.<br data-v-9a17941a> Learn more at <a href="https://fridaysforfuture.org/" target="_blank" rel="noopener" data-v-9a17941a>fridaysforfuture.org</a>. </div>`);
  } else {
    _push(`<!---->`);
  }
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ClimateStrikeBanner.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-9a17941a"]]), { __name: "ClimateStrikeBanner" });
const _sfc_main = {
  components: {
    HeaderBar: __nuxt_component_0,
    ClimateStrikeBanner: __nuxt_component_1
  },
  data() {
    return {
      isBrowser: false,
      isTouchScreen: false,
      lastTouchTime: 0
    };
  },
  mounted() {
    this.isBrowser = true;
    (void 0).addEventListener("touchstart", this.onTouchStart, true);
    (void 0).addEventListener("mousemove", this.onMouseMove, true);
  },
  beforeUnmount() {
    (void 0).removeEventListener("touchstart", this.onTouchStart, true);
    (void 0).removeEventListener("mousemove", this.onMouseMove, true);
  },
  methods: {
    focusContent() {
      this.$refs.content.focus();
    },
    onMouseMove() {
      if (Date.now() - this.lastTouchTime < 500) {
        return;
      }
      this.isTouchScreen = false;
    },
    onTouchStart() {
      this.isTouchScreen = true;
      this.lastTouchTime = Date.now();
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_HeaderBar = __nuxt_component_0;
  const _component_ClimateStrikeBanner = __nuxt_component_1;
  const _component_NuxtPage = __nuxt_component_2;
  _push(`<div${ssrRenderAttrs(mergeProps({
    id: "ofl-root",
    class: {
      "js": $data.isBrowser,
      "no-js": !$data.isBrowser,
      "touch": $data.isTouchScreen,
      "no-touch": !$data.isTouchScreen
    }
  }, _attrs))} data-v-2a580289><a href="#content" class="accessibility" data-v-2a580289>Skip to content</a>`);
  _push(ssrRenderComponent(_component_HeaderBar, {
    onFocusContent: ($event) => $options.focusContent()
  }, null, _parent));
  _push(`<div id="content" tabindex="-1" data-v-2a580289>`);
  _push(ssrRenderComponent(_component_ClimateStrikeBanner, null, null, _parent));
  _push(ssrRenderComponent(_component_NuxtPage, null, null, _parent));
  _push(`</div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _default = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-2a580289"]]);

export { _default as default };
//# sourceMappingURL=default-BYj7pv5x.mjs.map
