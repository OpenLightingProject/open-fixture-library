import { _ as __nuxt_component_0$1 } from './HelpWantedMessage-b-LiPWlj.mjs';
import { a as __nuxt_component_1, _ as __nuxt_component_2 } from './LabeledInput-818znnbz.mjs';
import { mergeProps, withCtx, createVNode, withDirectives, vModelText, openBlock, createBlock, withModifiers, createCommentVNode, Fragment, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';
import { o as objectProp, s as stringProp } from '../_/object.mjs';

const _sfc_main = {
  components: {
    A11yDialog: __nuxt_component_0$1,
    LabeledInput: __nuxt_component_2,
    LabeledValue: __nuxt_component_1
  },
  props: {
    type: stringProp().required,
    modelValue: objectProp().optional
  },
  emits: {
    "update:modelValue": (value) => true
  },
  data: () => {
    return {
      state: "ready",
      message: "",
      githubUsername: "",
      issueUrl: null,
      error: null
    };
  },
  computed: {
    title() {
      if (this.state === "loading") {
        return "Sending your message…";
      }
      if (this.state === "success") {
        return "Message sent";
      }
      if (this.state === "error") {
        return "Failed to send message";
      }
      if (this.type === "plugin") {
        return "Improve plugin";
      }
      return "Improve fixture";
    },
    location() {
      if (this.type === "capability") {
        const capability = this.modelValue;
        const channel = capability._channel;
        return `Channel "${channel.key}" → Capability "${capability.name}" (${capability.rawDmxRange})`;
      }
      return null;
    },
    fixture() {
      if (this.type === "fixture") {
        return this.modelValue;
      }
      if (this.type === "capability") {
        return this.modelValue._channel.fixture;
      }
      return null;
    },
    sendObject() {
      const sendObject = {
        type: this.type,
        location: this.location,
        helpWanted: this.modelValue.helpWanted,
        message: this.message,
        githubUsername: this.githubUsername === "" ? null : this.githubUsername
      };
      if (this.type === "plugin") {
        sendObject.context = this.modelValue.key;
      } else {
        const manufacturerKey = this.fixture.manufacturer.key;
        const fixtureKey = this.fixture.key;
        sendObject.context = `${manufacturerKey}/${fixtureKey}`;
      }
      return sendObject;
    },
    errorData() {
      return `${JSON.stringify(this.sendObject, null, 2)}

${this.error}`;
    },
    mailtoUrl() {
      const subject = `Feedback for ${this.sendObject.type} '${this.sendObject.modelValue}'`;
      const mailBodyData = {
        "Problem location": this.location,
        "Problem description": this.modelValue.helpWanted,
        "Message": this.message
      };
      const body = Object.entries(mailBodyData).filter(
        ([key, value]) => value !== null
      ).map(([key, value]) => {
        const separator = value.includes("\n") ? "\n" : " ";
        return `${key}:${separator}${value}`;
      }).join("\n");
      return `mailto:flo@open-fixture-library.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  },
  mounted() {
    if (localStorage) {
      this.githubUsername = localStorage.getItem("prefillGithubUsername") || "";
    }
  },
  methods: {
    async onSubmit() {
      this.state = "loading";
      localStorage.setItem("prefillGithubUsername", this.githubUsername);
      try {
        const response = await $fetch("/api/v1/submit-feedback", {
          method: "POST",
          body: this.sendObject
        });
        if (response.error) {
          throw new Error(response.error);
        }
        this.issueUrl = response.issueUrl;
        this.state = "success";
      } catch (error) {
        this.error = error.message;
        this.state = "error";
      }
    },
    hide() {
      this.$refs.dialog.$emit("hide");
    },
    onHide() {
      if (this.state === "success") {
        this.message = "";
      }
      this.state = "ready";
      this.issueUrl = null;
      this.error = null;
      this.$emit("update:modelValue", void 0);
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_A11yDialog = __nuxt_component_0$1;
  const _component_LabeledValue = __nuxt_component_1;
  const _component_LabeledInput = __nuxt_component_2;
  _push(ssrRenderComponent(_component_A11yDialog, mergeProps({
    id: "help-wanted-dialog",
    ref: "dialog",
    "is-alert-dialog": _ctx.state === `loading`,
    shown: $props.modelValue !== void 0,
    title: $options.title,
    onHide: ($event) => $options.onHide()
  }, _attrs), {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        if (_ctx.state === `ready` && $props.modelValue !== void 0) {
          _push2(`<form action="#"${_scopeId}>`);
          if ($options.location !== null) {
            _push2(ssrRenderComponent(_component_LabeledValue, {
              key: "location",
              value: $options.location,
              label: "Location"
            }, null, _parent2, _scopeId));
          } else {
            _push2(`<!---->`);
          }
          if ($props.modelValue.helpWanted !== null) {
            _push2(ssrRenderComponent(_component_LabeledValue, {
              key: "help-wanted",
              label: "Problem description"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<span${_scopeId2}>${$props.modelValue.helpWanted ?? ""}</span>`);
                } else {
                  return [
                    createVNode("span", {
                      innerHTML: $props.modelValue.helpWanted
                    }, null, 8, ["innerHTML"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            _push2(`<!---->`);
          }
          _push2(ssrRenderComponent(_component_LabeledInput, {
            name: "message",
            label: "Message"
          }, {
            default: withCtx((_2, _push3, _parent3, _scopeId2) => {
              if (_push3) {
                _push3(`<textarea name="message"${_scopeId2}>${ssrInterpolate(_ctx.message)}</textarea>`);
              } else {
                return [
                  withDirectives(createVNode("textarea", {
                    "onUpdate:modelValue": ($event) => _ctx.message = $event,
                    name: "message"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelText, _ctx.message]
                  ])
                ];
              }
            }),
            _: 1
          }, _parent2, _scopeId));
          _push2(ssrRenderComponent(_component_LabeledInput, {
            name: "github-username",
            label: "GitHub username",
            hint: "If you want to be mentioned in the issue."
          }, {
            default: withCtx((_2, _push3, _parent3, _scopeId2) => {
              if (_push3) {
                _push3(`<input${ssrRenderAttr("value", _ctx.githubUsername)} type="text" name="github-username"${_scopeId2}>`);
              } else {
                return [
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => _ctx.githubUsername = $event,
                    type: "text",
                    name: "github-username"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelText, _ctx.githubUsername]
                  ])
                ];
              }
            }),
            _: 1
          }, _parent2, _scopeId));
          _push2(`<div class="button-bar right"${_scopeId}><button${ssrIncludeBooleanAttr(_ctx.message === ``) ? " disabled" : ""} type="submit" class="primary"${_scopeId}>Send information</button></div></form>`);
        } else if (_ctx.state === `loading`) {
          _push2(`<!--[--> Uploading… <!--]-->`);
        } else if (_ctx.state === `success`) {
          _push2(`<!--[--> Your information was successfully uploaded to GitHub (see the <a${ssrRenderAttr("href", _ctx.issueUrl)} target="_blank" rel="noopener"${_scopeId}>issue</a>). The fixture will be updated as soon as your information has been reviewed. Thank you for your contribution! <div class="button-bar right"${_scopeId}><a href="#" class="button secondary"${_scopeId}>Close</a><a${ssrRenderAttr("href", _ctx.issueUrl)} class="button primary" target="_blank"${_scopeId}>See issue</a></div><!--]-->`);
        } else if (_ctx.state === `error`) {
          _push2(`<!--[--><span${_scopeId}>Unfortunately, there was an error while uploading. Please copy the following data and manually submit it.</span><textarea readonly${_scopeId}>${ssrInterpolate($options.errorData)}</textarea><div class="button-bar right"${_scopeId}><a href="#" class="button secondary"${_scopeId}>Close</a><a${ssrRenderAttr("href", $options.mailtoUrl)} class="button secondary" target="_blank"${_scopeId}>Send email</a><a href="https://github.com/OpenLightingProject/open-fixture-library/issues/new" class="button primary" target="_blank" rel="noopener"${_scopeId}> Create issue on GitHub </a></div><!--]-->`);
        } else {
          _push2(`<!---->`);
        }
      } else {
        return [
          _ctx.state === `ready` && $props.modelValue !== void 0 ? (openBlock(), createBlock("form", {
            key: 0,
            action: "#",
            onSubmit: withModifiers(($event) => $options.onSubmit(), ["prevent"])
          }, [
            $options.location !== null ? (openBlock(), createBlock(_component_LabeledValue, {
              key: "location",
              value: $options.location,
              label: "Location"
            }, null, 8, ["value"])) : createCommentVNode("", true),
            $props.modelValue.helpWanted !== null ? (openBlock(), createBlock(_component_LabeledValue, {
              key: "help-wanted",
              label: "Problem description"
            }, {
              default: withCtx(() => [
                createVNode("span", {
                  innerHTML: $props.modelValue.helpWanted
                }, null, 8, ["innerHTML"])
              ]),
              _: 1
            })) : createCommentVNode("", true),
            createVNode(_component_LabeledInput, {
              name: "message",
              label: "Message"
            }, {
              default: withCtx(() => [
                withDirectives(createVNode("textarea", {
                  "onUpdate:modelValue": ($event) => _ctx.message = $event,
                  name: "message"
                }, null, 8, ["onUpdate:modelValue"]), [
                  [vModelText, _ctx.message]
                ])
              ]),
              _: 1
            }),
            createVNode(_component_LabeledInput, {
              name: "github-username",
              label: "GitHub username",
              hint: "If you want to be mentioned in the issue."
            }, {
              default: withCtx(() => [
                withDirectives(createVNode("input", {
                  "onUpdate:modelValue": ($event) => _ctx.githubUsername = $event,
                  type: "text",
                  name: "github-username"
                }, null, 8, ["onUpdate:modelValue"]), [
                  [vModelText, _ctx.githubUsername]
                ])
              ]),
              _: 1
            }),
            createVNode("div", { class: "button-bar right" }, [
              createVNode("button", {
                disabled: _ctx.message === ``,
                type: "submit",
                class: "primary"
              }, "Send information", 8, ["disabled"])
            ])
          ], 40, ["onSubmit"])) : _ctx.state === `loading` ? (openBlock(), createBlock(Fragment, { key: 1 }, [
            createTextVNode(" Uploading… ")
          ], 64)) : _ctx.state === `success` ? (openBlock(), createBlock(Fragment, { key: 2 }, [
            createTextVNode(" Your information was successfully uploaded to GitHub (see the "),
            createVNode("a", {
              href: _ctx.issueUrl,
              target: "_blank",
              rel: "noopener"
            }, "issue", 8, ["href"]),
            createTextVNode("). The fixture will be updated as soon as your information has been reviewed. Thank you for your contribution! "),
            createVNode("div", { class: "button-bar right" }, [
              createVNode("a", {
                href: "#",
                class: "button secondary",
                onClick: withModifiers(($event) => $options.hide(), ["prevent"])
              }, "Close", 8, ["onClick"]),
              createVNode("a", {
                href: _ctx.issueUrl,
                class: "button primary",
                target: "_blank"
              }, "See issue", 8, ["href"])
            ])
          ], 64)) : _ctx.state === `error` ? (openBlock(), createBlock(Fragment, { key: 3 }, [
            createVNode("span", null, "Unfortunately, there was an error while uploading. Please copy the following data and manually submit it."),
            createVNode("textarea", {
              value: $options.errorData,
              readonly: ""
            }, null, 8, ["value"]),
            createVNode("div", { class: "button-bar right" }, [
              createVNode("a", {
                href: "#",
                class: "button secondary",
                onClick: withModifiers(($event) => $options.hide(), ["prevent"])
              }, "Close", 8, ["onClick"]),
              createVNode("a", {
                href: $options.mailtoUrl,
                class: "button secondary",
                target: "_blank"
              }, "Send email", 8, ["href"]),
              createVNode("a", {
                href: "https://github.com/OpenLightingProject/open-fixture-library/issues/new",
                class: "button primary",
                target: "_blank",
                rel: "noopener"
              }, " Create issue on GitHub ")
            ])
          ], 64)) : createCommentVNode("", true)
        ];
      }
    }),
    _: 1
  }, _parent));
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/HelpWantedDialog.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_7 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]), { __name: "HelpWantedDialog" });

export { __nuxt_component_7 as _ };
//# sourceMappingURL=HelpWantedDialog-COg0lV7R.mjs.map
