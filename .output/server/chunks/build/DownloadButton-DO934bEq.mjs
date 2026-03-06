import { mergeProps, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderSlot, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderClass, ssrRenderComponent } from 'vue/server-renderer';
import { p as propOptionsGenerator, _ as _export_sfc, b as __nuxt_component_1$1 } from './server.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-BmOBtkDI.mjs';
import { b as booleanProp, s as stringProp, o as objectProp } from '../_/object.mjs';
import { o as oneOfProp } from '../_/oneOf.mjs';

/** Validator that only allows integer numbers. */
const isInteger = (value) => {
    if (typeof value !== 'number' || !Number.isInteger(value)) {
        return 'value should be an integer';
    }
    return undefined;
};

/**
 * Allows any integer (validated at runtime).
 *
 * @param validator - Optional function for further runtime validation; should return `undefined` if valid, or an error string if invalid.
 */
const integerProp = (validator) => propOptionsGenerator(Number, validator, isInteger);

const _sfc_main$1 = {};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs) {
  _push(`<header${ssrRenderAttrs(mergeProps({ class: "fixture-header" }, _attrs))} data-v-d15c4eca><div class="title" data-v-d15c4eca>`);
  ssrRenderSlot(_ctx.$slots, "title", {}, null, _push, _parent);
  _push(`</div>`);
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</header>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/FixtureHeader.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-d15c4eca"]]), { __name: "FixtureHeader" });
const _sfc_main = {
  props: {
    // how many fixtures will be downloaded, if !isSingle?
    fixtureCount: integerProp().withDefault(0),
    // fixtures from the editor, not yet submitted
    editorFixtures: objectProp().optional,
    // the manufacturer key and fixture key of a submitted fixture
    fixtureKey: stringProp().optional,
    // the button style: default, 'home' or 'select'
    buttonStyle: oneOfProp(["default", "home", "select"]).withDefault("default"),
    // show the help box
    showHelp: booleanProp().withDefault(false)
  },
  data() {
    return {
      exportPlugins: [],
      selectClicked: false
    };
  },
  async mounted() {
    const plugins = await $fetch("/api/v1/plugins");
    this.exportPlugins = plugins.exportPlugins.map(
      (pluginKey) => ({
        key: pluginKey,
        name: plugins.data[pluginKey].name
      })
    );
  },
  computed: {
    // returns whether we're handling only one single fixture here
    // or all fixtures in a specific format
    isSingle() {
      return this.editorFixtures && Object.keys(this.editorFixtures.fixtures).length === 1 || this.fixtureKey;
    },
    title() {
      if (this.isSingle) {
        return "Download as…";
      }
      return `Download all ${this.fixtureCount} fixtures`;
    },
    baseLink() {
      if (this.editorFixtures) {
        return "/download-editor";
      }
      if (this.isSingle) {
        return `/${this.fixtureKey}`;
      }
      return "/download";
    }
  },
  methods: {
    downloadDataAsFile(blob, filename = "") {
      const URL = (void 0).URL || (void 0).webkitURL;
      const downloadUrl = URL.createObjectURL(blob);
      const anchorElement = (void 0).createElement("a");
      if (anchorElement.download === void 0) {
        (void 0).location = downloadUrl;
      } else {
        anchorElement.href = downloadUrl;
        anchorElement.download = filename;
        (void 0).body.append(anchorElement);
        anchorElement.click();
      }
      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
        anchorElement.remove();
      }, 100);
    },
    async formattedDownload(pluginKey) {
      const response = await fetch(
        `${this.baseLink}.${pluginKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.editorFixtures)
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || response.statusText);
      }
      const blob = await response.blob();
      let filename = "";
      const disposition = response.headers.get("content-disposition");
      if (disposition && disposition.includes("attachment")) {
        const filenameRegex = /filename[^\n;=]*=((["']).*?\2|[^\n;]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches && matches[1]) {
          filename = matches[1].replaceAll(/["']/g, "");
        }
      }
      this.downloadDataAsFile(blob, filename);
    },
    onDownloadButton(event, pluginKey) {
      event.target.blur();
      if (!this.editorFixtures) {
        return;
      }
      event.preventDefault();
      this.formattedDownload(pluginKey);
    },
    onDownloadSelectChange(event) {
      if (this.selectClicked) {
        event.target.blur();
      }
    },
    onDownloadSelectBlur(event) {
      if (event.target.value === "") {
        return;
      }
      const pluginKey = event.target.value;
      event.target.value = "";
      this.selectClicked = false;
      if (!this.editorFixtures) {
        (void 0).open(`${this.baseLink}.${pluginKey}`);
        return;
      }
      this.formattedDownload(pluginKey);
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_NuxtLink = __nuxt_component_0$1;
  const _component_OflSvg = __nuxt_component_1$1;
  _push(`<div${ssrRenderAttrs(mergeProps({
    class: ["container", { "only-select-button": $props.buttonStyle === `select` && !$props.showHelp }]
  }, _attrs))} data-v-6f6ded84>`);
  if ($props.buttonStyle === `select`) {
    _push(`<select data-v-6f6ded84><option value="" disabled selected data-v-6f6ded84>${ssrInterpolate($options.title)}</option><!--[-->`);
    ssrRenderList($data.exportPlugins, (plugin) => {
      _push(`<option${ssrRenderAttr("value", plugin.key)} data-v-6f6ded84>${ssrInterpolate(plugin.name)}</option>`);
    });
    _push(`<!--]--></select>`);
  } else {
    _push(`<div class="${ssrRenderClass([{ home: $props.buttonStyle === `home` }, "download-button"])}" data-v-6f6ded84><a href="#" class="title" data-v-6f6ded84>${ssrInterpolate($options.title)}</a><ul data-v-6f6ded84><!--[-->`);
    ssrRenderList($data.exportPlugins, (plugin) => {
      _push(`<li data-v-6f6ded84><a${ssrRenderAttr("href", `${$options.baseLink}.${plugin.key}`)}${ssrRenderAttr("title", `Download ${plugin.name} fixture definition${$options.isSingle ? `` : `s`}`)} rel="nofollow" data-v-6f6ded84>${ssrInterpolate(plugin.name)}</a></li>`);
    });
    _push(`<!--]--></ul></div>`);
  }
  if ($props.showHelp) {
    _push(ssrRenderComponent(_component_NuxtLink, {
      to: "/about/plugins",
      target: $props.buttonStyle === `home` ? null : `_blank`,
      class: "help-link"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_OflSvg, { name: "help-circle-outline" }, null, _parent2, _scopeId));
          _push2(`<span class="name" data-v-6f6ded84${_scopeId}>Download instructions</span>`);
        } else {
          return [
            createVNode(_component_OflSvg, { name: "help-circle-outline" }),
            createVNode("span", { class: "name" }, "Download instructions")
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/DownloadButton.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_4 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-6f6ded84"]]), { __name: "DownloadButton" });

export { __nuxt_component_0 as _, __nuxt_component_4 as a, integerProp as i };
//# sourceMappingURL=DownloadButton-DO934bEq.mjs.map
