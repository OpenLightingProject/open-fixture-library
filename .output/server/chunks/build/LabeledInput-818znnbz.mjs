import { _ as _export_sfc, f as __nuxt_component_5 } from './server.mjs';
import { mergeProps, withCtx, renderSlot, withDirectives, createVNode, openBlock, createBlock, toDisplayString, createTextVNode, createCommentVNode, vShow, Fragment, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderSlot, ssrRenderStyle, ssrInterpolate, ssrRenderAttrs } from 'vue/server-renderer';
import { b as booleanProp, o as objectProp, s as stringProp } from '../_/object.mjs';

const _sfc_main$1 = {
  props: {
    name: stringProp().optional,
    label: stringProp().optional,
    value: stringProp().optional
  },
  emits: {
    focusin: (event) => true,
    focusout: (event) => true,
    mouseover: (event) => true,
    mouseout: (event) => true
  }
};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<section${ssrRenderAttrs(mergeProps({ class: $props.name }, _attrs))} data-v-c5964b37><div class="label" data-v-c5964b37>`);
  if ($props.label) {
    _push(`<!--[-->${ssrInterpolate($props.label)}<!--]-->`);
  } else {
    _push(`<!---->`);
  }
  ssrRenderSlot(_ctx.$slots, "label", {}, null, _push, _parent);
  _push(`</div><div class="value" data-v-c5964b37>`);
  if ($props.value) {
    _push(`<!--[-->${ssrInterpolate($props.value)}<!--]-->`);
  } else {
    _push(`<!---->`);
  }
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</div></section>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/LabeledValue.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-c5964b37"]]), { __name: "LabeledValue" });
const _sfc_main = {
  components: {
    LabeledValue: __nuxt_component_1
  },
  props: {
    /** The internal name of the input field, used for state tracking. */
    name: stringProp().optional,
    // TODO: make this required
    /** The visible label text for the input. */
    label: stringProp().optional,
    /** Helper text displayed below the input. */
    hint: stringProp().optional,
    /** The validation state object from the parent form. */
    formstate: objectProp().optional,
    // TODO: make this required
    /** Object containing custom validation functions. */
    customValidators: objectProp().optional,
    /**
     * Whether this component wraps multiple inputs.
     * If true, renders a `div` instead of a `label` to avoid browser issues (e.g., Safari).
     */
    multipleInputs: booleanProp().withDefault(false)
  },
  computed: {
    /**
     * Retrieves the specific state object for this field from the global formstate.
     * Handles nested fields and prevents access errors if formstate is not yet initialized.
     * @returns {object|null} The field's state object or null if not found.
     */
    fieldState() {
      if (!this.formstate) {
        return null;
      }
      if (this.formstate.$error[this.name]) {
        return this.formstate[this.name];
      }
      const subFieldNames = Object.keys(this.formstate).filter(
        (subFieldName) => subFieldName.startsWith(this.name)
      );
      for (const subFieldName of subFieldNames) {
        if (this.formstate.$error[subFieldName]) {
          const fieldState = this.formstate[subFieldName];
          if (fieldState.$touched || fieldState.$submitted) {
            return fieldState;
          }
        }
      }
      return {};
    },
    fieldErrors() {
      if (!("$valid" in this.fieldState) || this.fieldState.$valid) {
        return {};
      }
      return this.fieldState.$error;
    },
    isSelectField() {
      return this.name === "manufacturerKey" || this.name === "plugin" || /^capability.*?-(?:type|shutterEffect|color|effectPreset|fogType)$/.test(this.name);
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Validate = __nuxt_component_5;
  const _component_LabeledValue = __nuxt_component_1;
  if ($props.formstate) {
    _push(ssrRenderComponent(_component_Validate, mergeProps({
      state: $props.formstate,
      custom: $props.customValidators,
      tag: $props.multipleInputs ? "div" : "label"
    }, _attrs), {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_LabeledValue, { name: $props.name }, {
            label: withCtx((_2, _push3, _parent3, _scopeId2) => {
              if (_push3) {
                if ($props.label) {
                  _push3(`<!--[-->${ssrInterpolate($props.label)}<!--]-->`);
                } else {
                  _push3(`<!---->`);
                }
                ssrRenderSlot(_ctx.$slots, "label", {}, null, _push3, _parent3, _scopeId2);
              } else {
                return [
                  $props.label ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                    createTextVNode(toDisplayString($props.label), 1)
                  ], 64)) : createCommentVNode("", true),
                  renderSlot(_ctx.$slots, "label")
                ];
              }
            }),
            default: withCtx((_2, _push3, _parent3, _scopeId2) => {
              if (_push3) {
                ssrRenderSlot(_ctx.$slots, "default", {}, null, _push3, _parent3, _scopeId2);
                _push3(`<div class="error-message" style="${ssrRenderStyle($options.fieldState.$touched || $options.fieldState.$submitted ? null : { display: "none" })}"${_scopeId2}>`);
                if ($options.isSelectField && $options.fieldErrors.required) {
                  _push3(`<div${_scopeId2}>Please select a value.</div>`);
                } else if ($options.fieldErrors.required) {
                  _push3(`<div${_scopeId2}>Please fill out this field.</div>`);
                } else if ($options.fieldErrors[`complete-range`]) {
                  _push3(`<div${_scopeId2}>Please fill out both start and end of the range.</div>`);
                } else if ($options.fieldErrors[`valid-range`]) {
                  _push3(`<div${_scopeId2}>The start value of a range must not be greater than its end.</div>`);
                } else if ($options.fieldErrors[`categories-not-empty`]) {
                  _push3(`<div${_scopeId2}>Please select at least one category.</div>`);
                } else if ($options.fieldErrors[`complete-dimensions`]) {
                  _push3(`<div${_scopeId2}>Please fill out all dimensions.</div>`);
                } else if ($options.fieldErrors[`start-with-uppercase-or-number`]) {
                  _push3(`<div${_scopeId2}>Please start with an uppercase letter or a number.</div>`);
                } else if ($options.fieldErrors[`no-manufacturer-name`]) {
                  _push3(`<div${_scopeId2}>Don&#39;t include the manufacturer name.</div>`);
                } else if ($options.fieldErrors[`no-mode-name`]) {
                  _push3(`<div${_scopeId2}>Don&#39;t include the word &quot;mode&quot;, it is appended automatically.</div>`);
                } else if ($options.fieldErrors[`no-fine-channel-name`]) {
                  _push3(`<div${_scopeId2}>Don&#39;t create fine channels manually, set the channel resolution below instead.</div>`);
                } else if ($options.fieldErrors[`entity-complete`]) {
                  _push3(`<div${_scopeId2}>Please fill out this field.</div>`);
                } else if ($options.fieldErrors[`entities-have-same-units`]) {
                  _push3(`<div${_scopeId2}>Please use the same unit or select a keyword for both entities.</div>`);
                } else if ($options.fieldErrors[`valid-color-hex-list`]) {
                  _push3(`<div${_scopeId2}>Please enter a list of #rrggbb (red, green, blue) hex codes.</div>`);
                } else if ($options.fieldErrors[`max-file-size`]) {
                  _push3(`<div${_scopeId2}>The file size must be less or equal to ${ssrInterpolate($options.fieldState.$attrs[`max-file-size`])}.</div>`);
                } else if ($options.fieldErrors[`animation-gobo-end-without-start`]) {
                  _push3(`<div${_scopeId2}>AnimationGoboEnd slots must only be used directly after AnimationGoboStart slots.</div>`);
                } else if ($options.fieldErrors[`must-be-animation-gobo-end`]) {
                  _push3(`<div${_scopeId2}>An AnimationGoboEnd slot must be used directly after an AnimationGoboStart slot.</div>`);
                } else if ($options.fieldErrors.number) {
                  _push3(`<div${_scopeId2}>Please enter a number.</div>`);
                } else if ($options.fieldErrors[`data-exclusive-minimum`]) {
                  _push3(`<div${_scopeId2}>Please enter a value greater than ${ssrInterpolate($options.fieldState.$attrs[`data-exclusive-minimum`])}.</div>`);
                } else if ($options.fieldErrors.min) {
                  _push3(`<div${_scopeId2}>Please enter a value greater or equal to ${ssrInterpolate($options.fieldState.$attrs.min)}.</div>`);
                } else if ($options.fieldErrors[`data-exclusive-maximum`]) {
                  _push3(`<div${_scopeId2}>Please enter a value less than ${ssrInterpolate($options.fieldState.$attrs[`data-exclusive-maximum`])}.</div>`);
                } else if ($options.fieldErrors.max) {
                  _push3(`<div${_scopeId2}>Please enter a value less or equal to ${ssrInterpolate($options.fieldState.$attrs.max)}.</div>`);
                } else if ($options.fieldErrors.step && Number($options.fieldState.$attrs.step) === 1) {
                  _push3(`<div${_scopeId2}>Please enter a whole number.</div>`);
                } else if ($options.fieldErrors.step) {
                  _push3(`<div${_scopeId2}>Please enter a multiple of ${ssrInterpolate($options.fieldState.$attrs.step)}.</div>`);
                } else if ($options.fieldErrors.email) {
                  _push3(`<div${_scopeId2}>Please enter an email address.</div>`);
                } else if ($options.fieldErrors.url) {
                  _push3(`<div${_scopeId2}>Please enter a URL.</div>`);
                } else if ($options.fieldErrors.pattern) {
                  _push3(`<div${_scopeId2}> Has to match pattern`);
                  if ($options.fieldState.$attrs.title) {
                    _push3(`<span${_scopeId2}>: ${ssrInterpolate($options.fieldState.$attrs.title)}</span>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`. </div>`);
                } else {
                  _push3(`<!---->`);
                }
                _push3(`</div>`);
                if ($props.hint) {
                  _push3(`<div class="hint"${_scopeId2}>${ssrInterpolate($props.hint)}</div>`);
                } else {
                  _push3(`<!---->`);
                }
              } else {
                return [
                  renderSlot(_ctx.$slots, "default"),
                  withDirectives(createVNode("div", { class: "error-message" }, [
                    $options.isSelectField && $options.fieldErrors.required ? (openBlock(), createBlock("div", { key: 0 }, "Please select a value.")) : $options.fieldErrors.required ? (openBlock(), createBlock("div", { key: 1 }, "Please fill out this field.")) : $options.fieldErrors[`complete-range`] ? (openBlock(), createBlock("div", { key: 2 }, "Please fill out both start and end of the range.")) : $options.fieldErrors[`valid-range`] ? (openBlock(), createBlock("div", { key: 3 }, "The start value of a range must not be greater than its end.")) : $options.fieldErrors[`categories-not-empty`] ? (openBlock(), createBlock("div", { key: 4 }, "Please select at least one category.")) : $options.fieldErrors[`complete-dimensions`] ? (openBlock(), createBlock("div", { key: 5 }, "Please fill out all dimensions.")) : $options.fieldErrors[`start-with-uppercase-or-number`] ? (openBlock(), createBlock("div", { key: 6 }, "Please start with an uppercase letter or a number.")) : $options.fieldErrors[`no-manufacturer-name`] ? (openBlock(), createBlock("div", { key: 7 }, "Don't include the manufacturer name.")) : $options.fieldErrors[`no-mode-name`] ? (openBlock(), createBlock("div", { key: 8 }, `Don't include the word "mode", it is appended automatically.`)) : $options.fieldErrors[`no-fine-channel-name`] ? (openBlock(), createBlock("div", { key: 9 }, "Don't create fine channels manually, set the channel resolution below instead.")) : $options.fieldErrors[`entity-complete`] ? (openBlock(), createBlock("div", { key: 10 }, "Please fill out this field.")) : $options.fieldErrors[`entities-have-same-units`] ? (openBlock(), createBlock("div", { key: 11 }, "Please use the same unit or select a keyword for both entities.")) : $options.fieldErrors[`valid-color-hex-list`] ? (openBlock(), createBlock("div", { key: 12 }, "Please enter a list of #rrggbb (red, green, blue) hex codes.")) : $options.fieldErrors[`max-file-size`] ? (openBlock(), createBlock("div", { key: 13 }, "The file size must be less or equal to " + toDisplayString($options.fieldState.$attrs[`max-file-size`]) + ".", 1)) : $options.fieldErrors[`animation-gobo-end-without-start`] ? (openBlock(), createBlock("div", { key: 14 }, "AnimationGoboEnd slots must only be used directly after AnimationGoboStart slots.")) : $options.fieldErrors[`must-be-animation-gobo-end`] ? (openBlock(), createBlock("div", { key: 15 }, "An AnimationGoboEnd slot must be used directly after an AnimationGoboStart slot.")) : $options.fieldErrors.number ? (openBlock(), createBlock("div", { key: 16 }, "Please enter a number.")) : $options.fieldErrors[`data-exclusive-minimum`] ? (openBlock(), createBlock("div", { key: 17 }, "Please enter a value greater than " + toDisplayString($options.fieldState.$attrs[`data-exclusive-minimum`]) + ".", 1)) : $options.fieldErrors.min ? (openBlock(), createBlock("div", { key: 18 }, "Please enter a value greater or equal to " + toDisplayString($options.fieldState.$attrs.min) + ".", 1)) : $options.fieldErrors[`data-exclusive-maximum`] ? (openBlock(), createBlock("div", { key: 19 }, "Please enter a value less than " + toDisplayString($options.fieldState.$attrs[`data-exclusive-maximum`]) + ".", 1)) : $options.fieldErrors.max ? (openBlock(), createBlock("div", { key: 20 }, "Please enter a value less or equal to " + toDisplayString($options.fieldState.$attrs.max) + ".", 1)) : $options.fieldErrors.step && Number($options.fieldState.$attrs.step) === 1 ? (openBlock(), createBlock("div", { key: 21 }, "Please enter a whole number.")) : $options.fieldErrors.step ? (openBlock(), createBlock("div", { key: 22 }, "Please enter a multiple of " + toDisplayString($options.fieldState.$attrs.step) + ".", 1)) : $options.fieldErrors.email ? (openBlock(), createBlock("div", { key: 23 }, "Please enter an email address.")) : $options.fieldErrors.url ? (openBlock(), createBlock("div", { key: 24 }, "Please enter a URL.")) : $options.fieldErrors.pattern ? (openBlock(), createBlock("div", { key: 25 }, [
                      createTextVNode(" Has to match pattern"),
                      $options.fieldState.$attrs.title ? (openBlock(), createBlock("span", { key: 0 }, ": " + toDisplayString($options.fieldState.$attrs.title), 1)) : createCommentVNode("", true),
                      createTextVNode(". ")
                    ])) : createCommentVNode("", true)
                  ], 512), [
                    [vShow, $options.fieldState.$touched || $options.fieldState.$submitted]
                  ]),
                  $props.hint ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "hint"
                  }, toDisplayString($props.hint), 1)) : createCommentVNode("", true)
                ];
              }
            }),
            _: 3
          }, _parent2, _scopeId));
        } else {
          return [
            createVNode(_component_LabeledValue, { name: $props.name }, {
              label: withCtx(() => [
                $props.label ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                  createTextVNode(toDisplayString($props.label), 1)
                ], 64)) : createCommentVNode("", true),
                renderSlot(_ctx.$slots, "label")
              ]),
              default: withCtx(() => [
                renderSlot(_ctx.$slots, "default"),
                withDirectives(createVNode("div", { class: "error-message" }, [
                  $options.isSelectField && $options.fieldErrors.required ? (openBlock(), createBlock("div", { key: 0 }, "Please select a value.")) : $options.fieldErrors.required ? (openBlock(), createBlock("div", { key: 1 }, "Please fill out this field.")) : $options.fieldErrors[`complete-range`] ? (openBlock(), createBlock("div", { key: 2 }, "Please fill out both start and end of the range.")) : $options.fieldErrors[`valid-range`] ? (openBlock(), createBlock("div", { key: 3 }, "The start value of a range must not be greater than its end.")) : $options.fieldErrors[`categories-not-empty`] ? (openBlock(), createBlock("div", { key: 4 }, "Please select at least one category.")) : $options.fieldErrors[`complete-dimensions`] ? (openBlock(), createBlock("div", { key: 5 }, "Please fill out all dimensions.")) : $options.fieldErrors[`start-with-uppercase-or-number`] ? (openBlock(), createBlock("div", { key: 6 }, "Please start with an uppercase letter or a number.")) : $options.fieldErrors[`no-manufacturer-name`] ? (openBlock(), createBlock("div", { key: 7 }, "Don't include the manufacturer name.")) : $options.fieldErrors[`no-mode-name`] ? (openBlock(), createBlock("div", { key: 8 }, `Don't include the word "mode", it is appended automatically.`)) : $options.fieldErrors[`no-fine-channel-name`] ? (openBlock(), createBlock("div", { key: 9 }, "Don't create fine channels manually, set the channel resolution below instead.")) : $options.fieldErrors[`entity-complete`] ? (openBlock(), createBlock("div", { key: 10 }, "Please fill out this field.")) : $options.fieldErrors[`entities-have-same-units`] ? (openBlock(), createBlock("div", { key: 11 }, "Please use the same unit or select a keyword for both entities.")) : $options.fieldErrors[`valid-color-hex-list`] ? (openBlock(), createBlock("div", { key: 12 }, "Please enter a list of #rrggbb (red, green, blue) hex codes.")) : $options.fieldErrors[`max-file-size`] ? (openBlock(), createBlock("div", { key: 13 }, "The file size must be less or equal to " + toDisplayString($options.fieldState.$attrs[`max-file-size`]) + ".", 1)) : $options.fieldErrors[`animation-gobo-end-without-start`] ? (openBlock(), createBlock("div", { key: 14 }, "AnimationGoboEnd slots must only be used directly after AnimationGoboStart slots.")) : $options.fieldErrors[`must-be-animation-gobo-end`] ? (openBlock(), createBlock("div", { key: 15 }, "An AnimationGoboEnd slot must be used directly after an AnimationGoboStart slot.")) : $options.fieldErrors.number ? (openBlock(), createBlock("div", { key: 16 }, "Please enter a number.")) : $options.fieldErrors[`data-exclusive-minimum`] ? (openBlock(), createBlock("div", { key: 17 }, "Please enter a value greater than " + toDisplayString($options.fieldState.$attrs[`data-exclusive-minimum`]) + ".", 1)) : $options.fieldErrors.min ? (openBlock(), createBlock("div", { key: 18 }, "Please enter a value greater or equal to " + toDisplayString($options.fieldState.$attrs.min) + ".", 1)) : $options.fieldErrors[`data-exclusive-maximum`] ? (openBlock(), createBlock("div", { key: 19 }, "Please enter a value less than " + toDisplayString($options.fieldState.$attrs[`data-exclusive-maximum`]) + ".", 1)) : $options.fieldErrors.max ? (openBlock(), createBlock("div", { key: 20 }, "Please enter a value less or equal to " + toDisplayString($options.fieldState.$attrs.max) + ".", 1)) : $options.fieldErrors.step && Number($options.fieldState.$attrs.step) === 1 ? (openBlock(), createBlock("div", { key: 21 }, "Please enter a whole number.")) : $options.fieldErrors.step ? (openBlock(), createBlock("div", { key: 22 }, "Please enter a multiple of " + toDisplayString($options.fieldState.$attrs.step) + ".", 1)) : $options.fieldErrors.email ? (openBlock(), createBlock("div", { key: 23 }, "Please enter an email address.")) : $options.fieldErrors.url ? (openBlock(), createBlock("div", { key: 24 }, "Please enter a URL.")) : $options.fieldErrors.pattern ? (openBlock(), createBlock("div", { key: 25 }, [
                    createTextVNode(" Has to match pattern"),
                    $options.fieldState.$attrs.title ? (openBlock(), createBlock("span", { key: 0 }, ": " + toDisplayString($options.fieldState.$attrs.title), 1)) : createCommentVNode("", true),
                    createTextVNode(". ")
                  ])) : createCommentVNode("", true)
                ], 512), [
                  [vShow, $options.fieldState.$touched || $options.fieldState.$submitted]
                ]),
                $props.hint ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "hint"
                }, toDisplayString($props.hint), 1)) : createCommentVNode("", true)
              ]),
              _: 3
            }, 8, ["name"])
          ];
        }
      }),
      _: 3
    }, _parent));
  } else {
    _push(`<label${ssrRenderAttrs(_attrs)}>`);
    _push(ssrRenderComponent(_component_LabeledValue, null, {
      label: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          if ($props.label) {
            _push2(`<!--[-->${ssrInterpolate($props.label)}<!--]-->`);
          } else {
            _push2(`<!---->`);
          }
          ssrRenderSlot(_ctx.$slots, "label", {}, null, _push2, _parent2, _scopeId);
        } else {
          return [
            $props.label ? (openBlock(), createBlock(Fragment, { key: 0 }, [
              createTextVNode(toDisplayString($props.label), 1)
            ], 64)) : createCommentVNode("", true),
            renderSlot(_ctx.$slots, "label")
          ];
        }
      }),
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          if ($props.hint) {
            _push2(`<div class="hint"${_scopeId}>${ssrInterpolate($props.hint)}</div>`);
          } else {
            _push2(`<!---->`);
          }
        } else {
          return [
            renderSlot(_ctx.$slots, "default"),
            $props.hint ? (openBlock(), createBlock("div", {
              key: 0,
              class: "hint"
            }, toDisplayString($props.hint), 1)) : createCommentVNode("", true)
          ];
        }
      }),
      _: 3
    }, _parent));
    _push(`</label>`);
  }
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/LabeledInput.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]), { __name: "LabeledInput" });

export { __nuxt_component_2 as _, __nuxt_component_1 as a };
//# sourceMappingURL=LabeledInput-818znnbz.mjs.map
