import { _ as __nuxt_component_2 } from './LabeledInput-818znnbz.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BmOBtkDI.mjs';
import { r as register } from './register-vmKDb_jz.mjs';
import { _ as _export_sfc, u as useRoute, a as useHead, c as createError, n as navigateTo } from './server.mjs';
import { withCtx, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';
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
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';

const _sfc_main = {
  components: {
    LabeledInput: __nuxt_component_2
  },
  async setup() {
    const route = useRoute();
    const query = route.query;
    const manufacturerId = parseIntOrUndefined(query.manufacturerId);
    const modelId = parseIntOrUndefined(query.modelId);
    const personalityIndex = parseIntOrUndefined(query.personalityIndex);
    useHead({ title: "RDM Lookup" });
    if (manufacturerId === void 0) {
      return {
        notFound: null,
        searchFor: "nothing"
      };
    }
    if (!(String(manufacturerId) in register.rdm)) {
      return {
        notFound: "manufacturer",
        searchFor: modelId === void 0 ? "manufacturer" : "fixture",
        manufacturerId,
        modelId
      };
    }
    const rdmManufacturer = register.rdm[String(manufacturerId)];
    if (modelId === void 0 || String(modelId) in rdmManufacturer.models) {
      await redirectToCorrectPage(rdmManufacturer, modelId, personalityIndex);
      return {};
    }
    let manufacturers;
    try {
      manufacturers = await $fetch("/api/v1/manufacturers");
    } catch (requestError) {
      throw createError({ statusCode: 500, statusMessage: requestError.message });
    }
    return {
      notFound: "fixture",
      searchFor: "fixture",
      manufacturerId,
      manufacturerKey: rdmManufacturer.key,
      manufacturerName: manufacturers[rdmManufacturer.key].name,
      modelId
    };
  },
  computed: {
    prefilledFixtureEditorUrl() {
      if (this.searchFor !== "fixture") {
        return "/fixture-editor";
      }
      const useExistingManufacturer = this.manufacturerKey !== void 0;
      const prefillObject = {
        useExistingManufacturer,
        manufacturerKey: useExistingManufacturer ? this.manufacturerKey : void 0,
        newManufacturerRdmId: useExistingManufacturer ? void 0 : this.manufacturerId,
        rdmModelId: this.modelId
      };
      return `/fixture-editor?prefill=${encodeURIComponent(JSON.stringify(prefillObject))}`;
    }
  }
};
function parseIntOrUndefined(string) {
  const number = Number.parseInt(string, 10);
  return Number.isNaN(number) ? void 0 : number;
}
async function redirectToCorrectPage(rdmManufacturer, modelId, personalityIndex) {
  if (modelId === void 0) {
    await navigateTo(`/${rdmManufacturer.key}`, { redirectCode: 301 });
    return;
  }
  const locationHash = personalityIndex === void 0 ? "" : `#rdm-personality-${personalityIndex}`;
  await navigateTo(`/${rdmManufacturer.key}/${rdmManufacturer.models[String(modelId)]}${locationHash}`, { redirectCode: 301 });
}
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2;
  const _component_NuxtLink = __nuxt_component_0;
  _push(`<div${ssrRenderAttrs(_attrs)}>`);
  if ($setup.searchFor === `nothing`) {
    _push(`<!--[--><h1>RDM Lookup</h1><p>Find a fixture definition or manufacturer by entering its RDM IDs.</p><form action="/rdm" method="get">`);
    _push(ssrRenderComponent(_component_LabeledInput, { label: "Manufacturer ID" }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<input type="number" name="manufacturerId" min="0" max="65535" step="1" required${_scopeId}>`);
        } else {
          return [
            createVNode("input", {
              type: "number",
              name: "manufacturerId",
              min: "0",
              max: "65535",
              step: "1",
              required: ""
            })
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(ssrRenderComponent(_component_LabeledInput, {
      label: "Model ID",
      hint: "Leave this field empty to find the manufacturer."
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<input type="number" name="modelId" min="0" max="65535" step="1"${_scopeId}>`);
        } else {
          return [
            createVNode("input", {
              type: "number",
              name: "modelId",
              min: "0",
              max: "65535",
              step: "1"
            })
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(ssrRenderComponent(_component_LabeledInput, {
      label: "Personality index",
      hint: "Optional."
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<input type="number" name="personalityIndex" min="1" step="1"${_scopeId}>`);
        } else {
          return [
            createVNode("input", {
              type: "number",
              name: "personalityIndex",
              min: "1",
              step: "1"
            })
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(`<div class="button-bar"><button type="submit" class="primary">Lookup fixture / manufacturer</button></div></form><!--]-->`);
  } else {
    _push(`<!--[--><h1>RDM ${ssrInterpolate($setup.searchFor)} not found</h1>`);
    if ($setup.notFound === `fixture`) {
      _push(`<!--[--><p>The requested <a${ssrRenderAttr("href", `/${$setup.manufacturerKey}`)}>${ssrInterpolate($setup.manufacturerName)}</a> fixture was not found in the Open Fixture Library. Maybe a fixture in the library is missing the RDM ID? It may be included in the <a${ssrRenderAttr("href", `http://rdm.openlighting.org/model/display?manufacturer=${$setup.manufacturerId}&model=${$setup.modelId}`)}>Open Lighting RDM database</a>.</p><p>Please consider <a href="https://github.com/OpenLightingProject/open-fixture-library/issues">filing a bug</a> to suggest adding the fixture. Include the name of the requested fixture and mention RDM IDs <b>${ssrInterpolate($setup.manufacturerId)} / ${ssrInterpolate($setup.modelId)}</b>. Or you can `);
      _push(ssrRenderComponent(_component_NuxtLink, { to: $options.prefilledFixtureEditorUrl }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`add it yourself`);
          } else {
            return [
              createTextVNode("add it yourself")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`!</p><p>Thank you either way!</p><!--]-->`);
    } else if ($setup.searchFor === `fixture`) {
      _push(`<!--[--><p>The manufacturer of the requested fixture was not found in the Open Fixture Library. The fixture may be included in the <a${ssrRenderAttr("href", `http://rdm.openlighting.org/model/display?manufacturer=${$setup.manufacturerId}&model=${$setup.modelId}`)}>Open Lighting RDM database</a>. Please consider <a href="https://github.com/OpenLightingProject/open-fixture-library/issues">filing a bug</a> to suggest adding the fixture. Include the name and manufacturer of the requested fixture and mention RDM IDs <b>${ssrInterpolate($setup.manufacturerId)} / ${ssrInterpolate($setup.modelId)}</b>. Or you can `);
      _push(ssrRenderComponent(_component_NuxtLink, { to: $options.prefilledFixtureEditorUrl }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`add it yourself`);
          } else {
            return [
              createTextVNode("add it yourself")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`!</p><p>Thank you either way!</p><!--]-->`);
    } else {
      _push(`<p>The requested manufacturer was not found in the Open Fixture Library. It may be included in the <a${ssrRenderAttr("href", `http://rdm.openlighting.org/manufacturer/display?manufacturer=${$setup.manufacturerId}`)}>Open Lighting RDM database</a>. Please consider <a href="https://github.com/OpenLightingProject/open-fixture-library/issues">filing a bug</a> to suggest adding the manufacturer. Include the full manufacturer name and mention RDM ID <b>${ssrInterpolate($setup.manufacturerId)}</b>. Thank you!</p>`);
    }
    _push(`<!--]-->`);
  }
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/rdm.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const rdm = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { rdm as default };
//# sourceMappingURL=rdm-BCG72CTw.mjs.map
