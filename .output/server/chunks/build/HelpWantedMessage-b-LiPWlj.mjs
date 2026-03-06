import { _ as _export_sfc, b as __nuxt_component_1$1 } from './server.mjs';
import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderClass, ssrRenderSlot } from 'vue/server-renderer';
import { o as objectProp, b as booleanProp, s as stringProp } from '../_/object.mjs';
import { o as oneOfProp } from '../_/oneOf.mjs';

const _sfc_main$1 = {
  props: {
    id: stringProp(
      (id) => typeof id === "string" && id.endsWith("-dialog") ? void 0 : 'id should end with "-dialog".'
    ).required,
    isAlertDialog: booleanProp().withDefault(false),
    shown: booleanProp().withDefault(true),
    title: stringProp().required,
    wide: booleanProp().withDefault(false)
  },
  emits: {
    show: () => true,
    hide: () => true
  },
  data() {
    return {
      dialog: null
    };
  },
  watch: {
    shown: "update"
  },
  async mounted() {
    const { default: A11yDialog } = await import('a11y-dialog');
    this.dialog = new A11yDialog(this.$el);
    this.dialog.on("show", () => {
      this.$refs.dialog.scrollTop = 0;
      this.$emit("show");
    });
    this.dialog.on("hide", () => this.$emit("hide"));
    this.update();
  },
  beforeUnmount() {
    this.dialog.destroy();
  },
  methods: {
    update() {
      if (this.shown) {
        this.show();
      } else {
        this.hide();
      }
    },
    show() {
      this.dialog?.show();
    },
    hide() {
      this.dialog?.hide();
    },
    overlayClick() {
      if (!this.isAlertDialog) {
        this.hide();
      }
    }
  }
};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_OflSvg = __nuxt_component_1$1;
  _push(`<div${ssrRenderAttrs(mergeProps({
    id: $props.id,
    class: "dialog-container",
    "aria-hidden": $props.shown ? `false` : `true`,
    "aria-labelledby": `${$props.id}-dialog-title`,
    role: $props.isAlertDialog ? `alertdialog` : void 0
  }, _attrs))} data-v-00873d8d><div role="document" class="${ssrRenderClass([{ wide: $props.wide }, "dialog card"])}" data-v-00873d8d><div data-v-00873d8d>`);
  if (!$props.isAlertDialog) {
    _push(`<button type="button" class="icon-button close" title="Close" data-v-00873d8d> Close `);
    _push(ssrRenderComponent(_component_OflSvg, { name: "close" }, null, _parent));
    _push(`</button>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<h2${ssrRenderAttr("id", `${$props.id}-dialog-title`)} tabindex="-1" data-v-00873d8d>`);
  ssrRenderSlot(_ctx.$slots, "title", {}, () => {
    _push(`${ssrInterpolate($props.title)}`);
  }, _push, _parent);
  _push(`</h2>`);
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</div></div></div>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/A11yDialog.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0$1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-00873d8d"]]), { __name: "A11yDialog" });
const _sfc_main = {
  props: {
    type: oneOfProp(["fixture", "capability", "plugin"]).required,
    context: objectProp().required
  },
  emits: {
    "help-wanted-clicked": (payload) => true
  },
  computed: {
    location() {
      if (this.type === "capability") {
        const capability = this.context;
        const channel = capability._channel;
        return `Channel "${channel.name}" → Capability "${capability.name}" (${capability.rawDmxRange})`;
      }
      return null;
    },
    fixture() {
      if (this.type === "fixture") {
        return this.context;
      }
      if (this.type === "capability") {
        return this.context._channel.fixture;
      }
      return null;
    },
    title() {
      if (this.type === "fixture") {
        return "You can help to improve this fixture definition!";
      }
      if (this.type === "plugin") {
        return "You can help to improve this plugin!";
      }
      return null;
    },
    description() {
      if (this.type === "fixture") {
        if (this.fixture.helpWanted === null) {
          return "Specific questions are included in the capabilities below.";
        }
        if (this.fixture.isCapabilityHelpWanted) {
          return `${this.fixture.helpWanted} Further questions are included in the capabilities below.`;
        }
      }
      return this.context.helpWanted;
    },
    mailtoUrl() {
      const subject = this.fixture ? `Feedback for fixture '${this.fixture.manufacturer.key}/${this.fixture.key}'` : `Feedback for ${this.type} '${this.context.key}'`;
      const bodyLines = [];
      if (this.location) {
        bodyLines.push(`Problem location: ${this.location}`);
      }
      if (this.context.helpWanted) {
        bodyLines.push(`Problem description: ${this.context.helpWanted}`);
      }
      const body = bodyLines.join("\n");
      return `mailto:flo@open-fixture-library.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_OflSvg = __nuxt_component_1$1;
  _push(`<section${ssrRenderAttrs(mergeProps({ class: "help-wanted" }, _attrs))} data-v-c8349254><div class="information" data-v-c8349254>`);
  _push(ssrRenderComponent(_component_OflSvg, {
    name: "comment-question-outline",
    title: "Help wanted!"
  }, null, _parent));
  if ($options.title) {
    _push(`<strong data-v-c8349254>${ssrInterpolate($options.title)}</strong>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<span data-v-c8349254>${$options.description ?? ""}</span></div><div class="actions" data-v-c8349254><a href="#" class="only-js" data-v-c8349254>`);
  _push(ssrRenderComponent(_component_OflSvg, {
    name: "comment-alert",
    class: "left"
  }, null, _parent));
  _push(`<span data-v-c8349254>Send information</span></a><a href="https://github.com/OpenLightingProject/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Abug" class="no-js" rel="nofollow" data-v-c8349254>`);
  _push(ssrRenderComponent(_component_OflSvg, {
    name: "bug",
    class: "left"
  }, null, _parent));
  _push(`<span data-v-c8349254>Create issue on GitHub</span></a><a${ssrRenderAttr("href", $options.mailtoUrl)} class="no-js" data-v-c8349254>`);
  _push(ssrRenderComponent(_component_OflSvg, {
    name: "email",
    class: "left"
  }, null, _parent));
  _push(`<span data-v-c8349254>Send email</span></a></div></section>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/HelpWantedMessage.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-c8349254"]]), { __name: "HelpWantedMessage" });

export { __nuxt_component_0$1 as _, __nuxt_component_0 as a };
//# sourceMappingURL=HelpWantedMessage-b-LiPWlj.mjs.map
