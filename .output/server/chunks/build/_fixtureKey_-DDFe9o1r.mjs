import { _ as __nuxt_component_0, a as __nuxt_component_4 } from './DownloadButton-DO934bEq.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-BmOBtkDI.mjs';
import { _ as _export_sfc, k as __nuxt_component_2$1, b as __nuxt_component_1$1, u as useRoute, c as createError, n as navigateTo, d as useRuntimeConfig } from './server.mjs';
import { _ as __nuxt_component_3 } from './ConditionalDetails-BGP2N0Fc.mjs';
import { j as __nuxt_component_5, M as Manufacturer, F as Fixture } from './Manufacturer-D4NeCXtn.mjs';
import { _ as __nuxt_component_7 } from './HelpWantedDialog-COg0lV7R.mjs';
import { r as register } from './register-vmKDb_jz.mjs';
import { withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';
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
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import './LabeledInput-818znnbz.mjs';
import './HelpWantedMessage-b-LiPWlj.mjs';

const redirectReasonExplanations = {
  FixtureRenamed: "The fixture was renamed.",
  SameAsDifferentBrand: "The fixture is the same but sold under different brands / names."
};
const _sfc_main = {
  components: {
    ConditionalDetails: __nuxt_component_3,
    DownloadButton: __nuxt_component_4,
    FixturePage: __nuxt_component_5,
    FixtureHeader: __nuxt_component_0,
    HelpWantedDialog: __nuxt_component_7
  },
  async setup() {
    const route = useRoute();
    const { manufacturerKey, fixtureKey } = route.params;
    if (!(`${manufacturerKey}/${fixtureKey}` in register.filesystem)) {
      throw createError({ statusCode: 404, statusMessage: "Fixture not found" });
    }
    const fixtureEntry = register.filesystem[`${manufacturerKey}/${fixtureKey}`];
    if (fixtureEntry.redirectTo) {
      await navigateTo(`/${fixtureEntry.redirectTo}?redirectFrom=${manufacturerKey}/${fixtureKey}`, { redirectCode: 302 });
    }
    let fixtureJson;
    let manufacturerJson;
    let plugins;
    let redirectObject;
    try {
      [fixtureJson, manufacturerJson, plugins, redirectObject] = await Promise.all([
        $fetch(`/${manufacturerKey}/${fixtureKey}.json`),
        $fetch(`/api/v1/manufacturers/${manufacturerKey}`),
        $fetch("/api/v1/plugins"),
        fetchRedirectObject(route.query.redirectFrom)
      ]);
    } catch (requestError) {
      throw createError({ statusCode: requestError.statusCode || 500, statusMessage: requestError.message });
    }
    const runtimeConfig = useRuntimeConfig();
    return {
      plugins,
      manufacturerKey,
      manufacturerJson,
      fixtureKey,
      fixtureJson,
      redirect: redirectObject,
      websiteUrl: runtimeConfig.public.websiteUrl
    };
  },
  data() {
    return {
      isBrowser: false,
      helpWantedContext: void 0,
      helpWantedType: ""
    };
  },
  computed: {
    fixture() {
      const manufacturer = new Manufacturer(this.manufacturerKey, this.manufacturerJson);
      return new Fixture(manufacturer, this.fixtureKey, this.fixtureJson);
    },
    productModelStructuredData() {
      const data = {
        "@context": "https://schema.org",
        "@type": "ProductModel",
        "name": this.fixture.name,
        "category": this.fixture.mainCategory,
        "manufacturer": {
          url: `${this.websiteUrl}${this.manufacturerKey}`
        }
      };
      if (this.fixture.hasComment) {
        data.description = this.fixture.comment;
      }
      if (this.fixture.physical !== null && this.fixture.physical.dimensions !== null) {
        data.depth = this.fixture.physical.depth;
        data.width = this.fixture.physical.width;
        data.height = this.fixture.physical.height;
      }
      return data;
    },
    breadcrumbListStructuredData() {
      return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "item": {
              "@id": `${this.websiteUrl}manufacturers`,
              "name": "Manufacturers"
            }
          },
          {
            "@type": "ListItem",
            "position": 2,
            "item": {
              "@id": `${this.websiteUrl}${this.manufacturerKey}`,
              "name": this.fixture.manufacturer.name
            }
          },
          {
            "@type": "ListItem",
            "position": 3,
            "item": {
              "@id": this.fixture.url,
              "name": this.fixture.name
            }
          }
        ]
      };
    },
    githubRepoPath() {
      const slug = process.env.GITHUB_REPOSITORY || "OpenLightingProject/open-fixture-library";
      return `https://github.com/${slug}`;
    },
    branch() {
      const gitRef = process.env.GITHUB_PR_BASE_REF || process.env.GITHUB_REF || "master";
      return gitRef.split("/").pop();
    },
    mailtoUrl() {
      const subject = `Feedback for fixture '${this.manufacturerKey}/${this.fixtureKey}'`;
      return `mailto:flo@open-fixture-library.org?subject=${encodeURIComponent(subject)}`;
    }
  },
  mounted() {
    this.isBrowser = true;
  },
  methods: {
    openHelpWantedDialog(event) {
      this.helpWantedContext = event.context;
      this.helpWantedType = event.type;
    }
  }
};
async function fetchRedirectObject(redirectFrom) {
  if (!redirectFrom) {
    return void 0;
  }
  const redirectJson = await $fetch(`/${redirectFrom}.json`);
  return {
    from: redirectFrom,
    reason: redirectReasonExplanations[redirectJson.reason]
  };
}
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_FixtureHeader = __nuxt_component_0;
  const _component_NuxtLink = __nuxt_component_0$1;
  const _component_OflTime = __nuxt_component_2$1;
  const _component_ConditionalDetails = __nuxt_component_3;
  const _component_DownloadButton = __nuxt_component_4;
  const _component_FixturePage = __nuxt_component_5;
  const _component_OflSvg = __nuxt_component_1$1;
  const _component_HelpWantedDialog = __nuxt_component_7;
  _push(`<div${ssrRenderAttrs(_attrs)} data-v-4f6c3ac6>`);
  _push(ssrRenderComponent(_component_FixtureHeader, null, {
    title: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<h1 data-v-4f6c3ac6${_scopeId}>`);
        _push2(ssrRenderComponent(_component_NuxtLink, {
          to: `/${$setup.manufacturerKey}`
        }, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(`${ssrInterpolate($options.fixture.manufacturer.name)}`);
            } else {
              return [
                createTextVNode(toDisplayString($options.fixture.manufacturer.name), 1)
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
        _push2(` ${ssrInterpolate($options.fixture.name)} `);
        if ($options.fixture.hasShortName) {
          _push2(`<code data-v-4f6c3ac6${_scopeId}>${ssrInterpolate($options.fixture.shortName)}</code>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</h1><section class="fixture-meta" data-v-4f6c3ac6${_scopeId}><span class="last-modify-date" data-v-4f6c3ac6${_scopeId}>Last modified: `);
        _push2(ssrRenderComponent(_component_OflTime, {
          date: $options.fixture.meta.lastModifyDate
        }, null, _parent2, _scopeId));
        _push2(`</span><span class="create-date" data-v-4f6c3ac6${_scopeId}>Created: `);
        _push2(ssrRenderComponent(_component_OflTime, {
          date: $options.fixture.meta.createDate
        }, null, _parent2, _scopeId));
        _push2(`</span><span class="authors" data-v-4f6c3ac6${_scopeId}>Author${ssrInterpolate($options.fixture.meta.authors.length === 1 ? `` : `s`)}: ${ssrInterpolate($options.fixture.meta.authors.join(`, `))}</span><span class="source" data-v-4f6c3ac6${_scopeId}><a${ssrRenderAttr("href", `${$options.githubRepoPath}/blob/${$options.branch}/fixtures/${$setup.manufacturerKey}/${$setup.fixtureKey}.json`)} data-v-4f6c3ac6${_scopeId}>Source</a></span><span class="revisions" data-v-4f6c3ac6${_scopeId}><a${ssrRenderAttr("href", `${$options.githubRepoPath}/commits/${$options.branch}/fixtures/${$setup.manufacturerKey}/${$setup.fixtureKey}.json`)} data-v-4f6c3ac6${_scopeId}>Revisions</a></span>`);
        if ($options.fixture.meta.importPlugin !== null) {
          _push2(ssrRenderComponent(_component_ConditionalDetails, null, {
            summary: withCtx((_2, _push3, _parent3, _scopeId2) => {
              if (_push3) {
                _push3(` Imported using the `);
                _push3(ssrRenderComponent(_component_NuxtLink, {
                  to: `/about/plugins/${$options.fixture.meta.importPlugin}`
                }, {
                  default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                    if (_push4) {
                      _push4(`${ssrInterpolate($setup.plugins.data[$options.fixture.meta.importPlugin].name)} plugin`);
                    } else {
                      return [
                        createTextVNode(toDisplayString($setup.plugins.data[$options.fixture.meta.importPlugin].name) + " plugin", 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent3, _scopeId2));
                _push3(` on `);
                _push3(ssrRenderComponent(_component_OflTime, {
                  date: $options.fixture.meta.importDate
                }, null, _parent3, _scopeId2));
                _push3(`. `);
              } else {
                return [
                  createTextVNode(" Imported using the "),
                  createVNode(_component_NuxtLink, {
                    to: `/about/plugins/${$options.fixture.meta.importPlugin}`
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString($setup.plugins.data[$options.fixture.meta.importPlugin].name) + " plugin", 1)
                    ]),
                    _: 1
                  }, 8, ["to"]),
                  createTextVNode(" on "),
                  createVNode(_component_OflTime, {
                    date: $options.fixture.meta.importDate
                  }, null, 8, ["date"]),
                  createTextVNode(". ")
                ];
              }
            }),
            default: withCtx((_2, _push3, _parent3, _scopeId2) => {
              if (_push3) {
                if ($options.fixture.meta.hasImportComment) {
                  _push3(`<span data-v-4f6c3ac6${_scopeId2}>${ssrInterpolate($options.fixture.meta.importComment)}</span>`);
                } else {
                  _push3(`<!---->`);
                }
              } else {
                return [
                  $options.fixture.meta.hasImportComment ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString($options.fixture.meta.importComment), 1)) : createCommentVNode("", true)
                ];
              }
            }),
            _: 1
          }, _parent2, _scopeId));
        } else {
          _push2(`<!---->`);
        }
        _push2(`</section>`);
      } else {
        return [
          createVNode("h1", null, [
            createVNode(_component_NuxtLink, {
              to: `/${$setup.manufacturerKey}`
            }, {
              default: withCtx(() => [
                createTextVNode(toDisplayString($options.fixture.manufacturer.name), 1)
              ]),
              _: 1
            }, 8, ["to"]),
            createTextVNode(" " + toDisplayString($options.fixture.name) + " ", 1),
            $options.fixture.hasShortName ? (openBlock(), createBlock("code", { key: 0 }, toDisplayString($options.fixture.shortName), 1)) : createCommentVNode("", true)
          ]),
          createVNode("section", { class: "fixture-meta" }, [
            createVNode("span", { class: "last-modify-date" }, [
              createTextVNode("Last modified: "),
              createVNode(_component_OflTime, {
                date: $options.fixture.meta.lastModifyDate
              }, null, 8, ["date"])
            ]),
            createVNode("span", { class: "create-date" }, [
              createTextVNode("Created: "),
              createVNode(_component_OflTime, {
                date: $options.fixture.meta.createDate
              }, null, 8, ["date"])
            ]),
            createVNode("span", { class: "authors" }, "Author" + toDisplayString($options.fixture.meta.authors.length === 1 ? `` : `s`) + ": " + toDisplayString($options.fixture.meta.authors.join(`, `)), 1),
            createVNode("span", { class: "source" }, [
              createVNode("a", {
                href: `${$options.githubRepoPath}/blob/${$options.branch}/fixtures/${$setup.manufacturerKey}/${$setup.fixtureKey}.json`
              }, "Source", 8, ["href"])
            ]),
            createVNode("span", { class: "revisions" }, [
              createVNode("a", {
                href: `${$options.githubRepoPath}/commits/${$options.branch}/fixtures/${$setup.manufacturerKey}/${$setup.fixtureKey}.json`
              }, "Revisions", 8, ["href"])
            ]),
            $options.fixture.meta.importPlugin !== null ? (openBlock(), createBlock(_component_ConditionalDetails, { key: 0 }, {
              summary: withCtx(() => [
                createTextVNode(" Imported using the "),
                createVNode(_component_NuxtLink, {
                  to: `/about/plugins/${$options.fixture.meta.importPlugin}`
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString($setup.plugins.data[$options.fixture.meta.importPlugin].name) + " plugin", 1)
                  ]),
                  _: 1
                }, 8, ["to"]),
                createTextVNode(" on "),
                createVNode(_component_OflTime, {
                  date: $options.fixture.meta.importDate
                }, null, 8, ["date"]),
                createTextVNode(". ")
              ]),
              default: withCtx(() => [
                $options.fixture.meta.hasImportComment ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString($options.fixture.meta.importComment), 1)) : createCommentVNode("", true)
              ]),
              _: 1
            })) : createCommentVNode("", true)
          ])
        ];
      }
    }),
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_DownloadButton, {
          "fixture-key": `${$setup.manufacturerKey}/${$setup.fixtureKey}`,
          "show-help": ""
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_DownloadButton, {
            "fixture-key": `${$setup.manufacturerKey}/${$setup.fixtureKey}`,
            "show-help": ""
          }, null, 8, ["fixture-key"])
        ];
      }
    }),
    _: 1
  }, _parent));
  if ($setup.redirect) {
    _push(`<section class="card yellow" data-v-4f6c3ac6> Redirected from <code data-v-4f6c3ac6>${ssrInterpolate($setup.redirect.from)}</code>: ${ssrInterpolate($setup.redirect.reason)}</section>`);
  } else {
    _push(`<!---->`);
  }
  _push(ssrRenderComponent(_component_FixturePage, {
    fixture: $options.fixture,
    "load-all-modes": `loadAllModes` in _ctx.$route.query,
    onHelpWantedClicked: ($event) => $options.openHelpWantedDialog($event)
  }, null, _parent));
  _push(`<section id="contribute" data-v-4f6c3ac6><h2 data-v-4f6c3ac6>Something wrong with this fixture definition?</h2><p data-v-4f6c3ac6>It does not work in your lighting software or you see another problem? Then please help correct it!</p><div class="grid-3" data-v-4f6c3ac6>`);
  if ($data.isBrowser) {
    _push(`<a href="#" class="card slim" data-v-4f6c3ac6>`);
    _push(ssrRenderComponent(_component_OflSvg, {
      name: "comment-alert",
      class: "left"
    }, null, _parent));
    _push(`<span data-v-4f6c3ac6>Send information</span></a>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<a href="https://github.com/OpenLightingProject/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Abug" rel="nofollow" class="card slim" data-v-4f6c3ac6>`);
  _push(ssrRenderComponent(_component_OflSvg, {
    name: "bug",
    class: "left"
  }, null, _parent));
  _push(`<span data-v-4f6c3ac6>Create issue on GitHub</span></a><a${ssrRenderAttr("href", $options.mailtoUrl)} class="card slim" data-v-4f6c3ac6>`);
  _push(ssrRenderComponent(_component_OflSvg, {
    name: "email",
    class: "left"
  }, null, _parent));
  _push(`<span data-v-4f6c3ac6>Send email</span></a></div></section>`);
  _push(ssrRenderComponent(_component_HelpWantedDialog, {
    modelValue: $data.helpWantedContext,
    "onUpdate:modelValue": ($event) => $data.helpWantedContext = $event,
    type: $data.helpWantedType
  }, null, _parent));
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/[manufacturerKey]/[fixtureKey].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _fixtureKey_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-4f6c3ac6"]]);

export { _fixtureKey_ as default };
//# sourceMappingURL=_fixtureKey_-DDFe9o1r.mjs.map
