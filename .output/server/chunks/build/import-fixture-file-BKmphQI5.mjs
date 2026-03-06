import { _ as _export_sfc, e as __nuxt_component_2$2, c as createError, a as useHead } from './server.mjs';
import scrollIntoView from 'scroll-into-view';
import { E as EditorSubmitDialog, d as getEmptyFormState, e as anyProp } from './EditorSubmitDialog-B5U3WmZ-.mjs';
import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { _ as __nuxt_component_2 } from './LabeledInput-818znnbz.mjs';
import { u as useAsyncData } from './asyncData-CINZYKlw.mjs';
import { s as stringProp, b as booleanProp } from '../_/object.mjs';
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
import './HelpWantedMessage-b-LiPWlj.mjs';
import '../_/oneOf.mjs';
import './DownloadButton-DO934bEq.mjs';
import './nuxt-link-BmOBtkDI.mjs';
import './Manufacturer-D4NeCXtn.mjs';
import './ConditionalDetails-BGP2N0Fc.mjs';
import './register-vmKDb_jz.mjs';
import 'perfect-debounce';

const _sfc_main$1 = {
  props: {
    required: booleanProp().withDefault(false),
    name: stringProp().required,
    modelValue: anyProp().optional
  },
  emits: {
    "update:model-value": (value) => true
  },
  watch: {
    modelValue(newFile) {
      if (!newFile) {
        this.$refs.fileInput.value = "";
      }
    }
  },
  mounted() {
    this.onFileChanged();
  },
  methods: {
    onFileChanged() {
      const file = this.$refs.fileInput.files[0];
      if (!file) {
        this.$emit("update:model-value", void 0);
        return;
      }
      this.$emit("update:model-value", file);
    }
  }
};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<input${ssrRenderAttrs(mergeProps({
    ref: "fileInput",
    required: $props.required,
    name: $props.name,
    type: "file"
  }, _attrs))}>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/EditorFileUpload.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const EditorFileUpload = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1]]), { __name: "EditorFileUpload" });
const _sfc_main = {
  components: {
    EditorFileUpload,
    EditorSubmitDialog,
    LabeledInput: __nuxt_component_2
  },
  async setup() {
    const { data: plugins, error } = await useAsyncData("plugins", () => $fetch("/api/v1/plugins"));
    if (error.value) {
      throw createError({ statusCode: 500, statusMessage: error.value.message });
    }
    useHead({ title: "Import fixture" });
    return { plugins: plugins.value };
  },
  data() {
    return {
      formstate: getEmptyFormState(),
      plugin: "",
      file: void 0,
      githubComment: "",
      author: "",
      githubUsername: "",
      honeypot: ""
    };
  },
  mounted() {
    this.applyStoredPrefillData();
  },
  methods: {
    async onSubmit() {
      if (this.formstate.$invalid) {
        const field = (void 0).querySelector(".vf-field-invalid");
        scrollIntoView(field, {
          time: 300,
          align: {
            top: 0,
            left: 0,
            topOffset: 100
          },
          isScrollable: (target) => target === void 0
        }, () => field.focus());
        return;
      }
      if (this.honeypot !== "") {
        alert('Do not fill the "Ignore" fields!');
        return;
      }
      try {
        const fileDataUrl = await getFileDataUrl(this.file);
        const [, fileContentBase64] = fileDataUrl.match(/base64,(.+)$/);
        this.$refs.submitDialog.validate({
          plugin: this.plugin,
          fileName: this.file.name,
          fileContentBase64,
          author: this.author
        });
      } catch (fileReaderError) {
        alert("Could not read the file.");
      }
      function getFileDataUrl(file) {
        return new Promise((resolve, reject) => {
          const fileReader = new FileReader();
          fileReader.addEventListener("load", () => {
            resolve(fileReader.result);
          });
          fileReader.addEventListener("error", reject);
          fileReader.addEventListener("abort", reject);
          fileReader.readAsDataURL(file);
        });
      }
    },
    async reset() {
      this.file = void 0;
      this.githubComment = "";
      await this.$nextTick();
      Object.keys(this.formstate).forEach((key) => {
        delete this.formstate[key];
      });
      this.formstate.$submitted = false;
    },
    applyStoredPrefillData() {
      if (!localStorage) {
        return;
      }
      if (this.author === "") {
        this.author = localStorage.getItem("prefillAuthor") || "";
      }
      if (this.githubUsername === "") {
        this.githubUsername = localStorage.getItem("prefillGithubUsername") || "";
      }
    },
    storePrefillData() {
      localStorage.setItem("prefillAuthor", this.author);
      localStorage.setItem("prefillGithubUsername", this.githubUsername);
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_ClientOnly = __nuxt_component_2$2;
  _push(`<div${ssrRenderAttrs(_attrs)}><h1>Import fixture file</h1><section class="card yellow"><strong>Warning:</strong> The fixture can not be edited after importing, so please provide as much information as possible in the comment. </section><noscript class="card yellow"> Please enable JavaScript to use the Fixture Importer! </noscript>`);
  _push(ssrRenderComponent(_component_ClientOnly, { placeholder: "Fixture Importer is loading..." }, {}, _parent));
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/import-fixture-file.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const importFixtureFile = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { importFixtureFile as default };
//# sourceMappingURL=import-fixture-file-BKmphQI5.mjs.map
