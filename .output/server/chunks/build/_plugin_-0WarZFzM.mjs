import { a as __nuxt_component_0 } from './HelpWantedMessage-b-LiPWlj.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-BmOBtkDI.mjs';
import { _ as __nuxt_component_7 } from './HelpWantedDialog-COg0lV7R.mjs';
import { _ as _export_sfc, u as useRoute, c as createError, n as navigateTo, a as useHead } from './server.mjs';
import { u as useAsyncData } from './asyncData-CINZYKlw.mjs';
import { withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderComponent, ssrRenderStyle } from 'vue/server-renderer';
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
import './LabeledInput-818znnbz.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import 'perfect-debounce';

const _sfc_main = {
  components: {
    HelpWantedDialog: __nuxt_component_7,
    HelpWantedMessage: __nuxt_component_0
  },
  async setup() {
    const route = useRoute();
    const pluginKey = route.params.plugin;
    const { data: pluginData, error } = await useAsyncData(
      `plugin-${pluginKey}`,
      () => $fetch(`/api/v1/plugins/${pluginKey}`)
    );
    if (error.value) {
      throw createError({ statusCode: error.value.statusCode || 500, statusMessage: error.value.message });
    }
    if (pluginKey in pluginData.value.previousVersions) {
      const newPluginKey = pluginData.value.key;
      await navigateTo(`/about/plugins/${newPluginKey}`, { redirectCode: 301 });
    }
    useHead({ title: `${pluginData.value.name} Plugin` });
    return { pluginData: pluginData.value };
  },
  data() {
    return {
      helpWantedContext: void 0,
      libraryNames: {
        main: "Main (system) library",
        user: "User library"
      }
    };
  },
  computed: {
    exportPluginVersion() {
      return this.pluginData.exportPluginVersion;
    },
    importPluginVersion() {
      return this.pluginData.importPluginVersion;
    },
    fileLocationOSes() {
      return "fileLocations" in this.pluginData ? Object.keys(this.pluginData.fileLocations).filter(
        (os) => os !== "subDirectoriesAllowed"
      ) : null;
    }
  },
  methods: {
    openHelpWantedDialog(event) {
      this.helpWantedContext = event.context;
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_HelpWantedMessage = __nuxt_component_0;
  const _component_NuxtLink = __nuxt_component_0$1;
  const _component_HelpWantedDialog = __nuxt_component_7;
  _push(`<div${ssrRenderAttrs(_attrs)} data-v-faeca5a1><h1 data-v-faeca5a1>${ssrInterpolate($setup.pluginData.name)} Plugin</h1><div class="version-info hint" data-v-faeca5a1>`);
  if ($options.exportPluginVersion) {
    _push(`<!--[-->Export plugin version ${ssrInterpolate($options.exportPluginVersion)}<!--]-->`);
  } else {
    _push(`<!---->`);
  }
  if ($options.exportPluginVersion && $options.importPluginVersion) {
    _push(`<!--[--> | <!--]-->`);
  } else {
    _push(`<!---->`);
  }
  if ($options.importPluginVersion) {
    _push(`<!--[-->Import plugin version ${ssrInterpolate($options.importPluginVersion)}<!--]-->`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div><div class="plugin-description" data-v-faeca5a1>${$setup.pluginData.description ?? ""}</div><ul data-v-faeca5a1><!--[-->`);
  ssrRenderList(Object.keys($setup.pluginData.links), (link) => {
    _push(`<li data-v-faeca5a1><a${ssrRenderAttr("href", $setup.pluginData.links[link])} target="_blank" rel="nofollow noopener" data-v-faeca5a1>${ssrInterpolate(link)}</a></li>`);
  });
  _push(`<!--]--></ul>`);
  if (`helpWanted` in $setup.pluginData) {
    _push(ssrRenderComponent(_component_HelpWantedMessage, {
      type: "plugin",
      context: $setup.pluginData,
      onHelpWantedClicked: ($event) => $options.openHelpWantedDialog($event)
    }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  if (`fixtureUsage` in $setup.pluginData) {
    _push(`<div class="fixture-usage" data-v-faeca5a1><h2 id="fixture-usage" data-v-faeca5a1>Install fixture definitions</h2><p data-v-faeca5a1>`);
    _push(ssrRenderComponent(_component_NuxtLink, { to: "/manufacturers" }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`Browse to the fixture`);
        } else {
          return [
            createTextVNode("Browse to the fixture")
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(` you want to download, then select <em data-v-faeca5a1>${ssrInterpolate($setup.pluginData.name)}</em> in the <em data-v-faeca5a1>Download as…</em> button.</p><div data-v-faeca5a1>${$setup.pluginData.fixtureUsage ?? ""}</div></div>`);
  } else {
    _push(`<!---->`);
  }
  if (`fileLocations` in $setup.pluginData) {
    _push(`<div class="file-locations" data-v-faeca5a1><h2 data-v-faeca5a1>File locations</h2>`);
    if (`subDirectoriesAllowed` in $setup.pluginData.fileLocations) {
      _push(`<p data-v-faeca5a1> Fixture files in subdirectories are ${ssrInterpolate($setup.pluginData.fileLocations.subDirectoriesAllowed ? `recognized` : `not recognized`)}. </p>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<!--[-->`);
    ssrRenderList($options.fileLocationOSes, (os) => {
      _push(`<div data-v-faeca5a1><h3 data-v-faeca5a1>${ssrInterpolate(os)}</h3><section data-v-faeca5a1><!--[-->`);
      ssrRenderList(Object.keys($setup.pluginData.fileLocations[os]), (library) => {
        _push(`<div data-v-faeca5a1>${ssrInterpolate($data.libraryNames[library])}: <code data-v-faeca5a1>${ssrInterpolate($setup.pluginData.fileLocations[os][library])}</code></div>`);
      });
      _push(`<!--]--></section></div>`);
    });
    _push(`<!--]--></div>`);
  } else {
    _push(`<!---->`);
  }
  if (`additionalInfo` in $setup.pluginData) {
    _push(`<div class="additional-info" data-v-faeca5a1><h2 data-v-faeca5a1>Additional information</h2><div data-v-faeca5a1>${$setup.pluginData.additionalInfo ?? ""}</div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<p style="${ssrRenderStyle({ "margin-top": "3rem" })}" data-v-faeca5a1>`);
  _push(ssrRenderComponent(_component_NuxtLink, { to: "/about/plugins" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Back to plugin overview`);
      } else {
        return [
          createTextVNode("Back to plugin overview")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</p>`);
  _push(ssrRenderComponent(_component_HelpWantedDialog, {
    modelValue: $data.helpWantedContext,
    "onUpdate:modelValue": ($event) => $data.helpWantedContext = $event,
    type: "plugin"
  }, null, _parent));
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/about/plugins/[plugin].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _plugin_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-faeca5a1"]]);

export { _plugin_ as default };
//# sourceMappingURL=_plugin_-0WarZFzM.mjs.map
