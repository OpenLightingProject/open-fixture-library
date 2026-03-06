import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderSlot } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';

const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  if (_ctx.$slots.default) {
    _push(`<details${ssrRenderAttrs(_attrs)} data-v-15bc84e8><summary data-v-15bc84e8>`);
    ssrRenderSlot(_ctx.$slots, "summary", {}, null, _push, _parent);
    _push(`</summary>`);
    ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
    _push(`</details>`);
  } else {
    _push(`<div${ssrRenderAttrs(mergeProps({ class: "summary" }, _attrs))} data-v-15bc84e8>`);
    ssrRenderSlot(_ctx.$slots, "summary", {}, null, _push, _parent);
    _push(`</div>`);
  }
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ConditionalDetails.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-15bc84e8"]]), { __name: "ConditionalDetails" });

export { __nuxt_component_3 as _ };
//# sourceMappingURL=ConditionalDetails-BGP2N0Fc.mjs.map
