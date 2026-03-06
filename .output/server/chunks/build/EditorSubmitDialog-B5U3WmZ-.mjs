import { p as propOptionsGenerator, _ as _export_sfc } from './server.mjs';
import { _ as __nuxt_component_0$1 } from './HelpWantedMessage-b-LiPWlj.mjs';
import { _ as __nuxt_component_0, a as __nuxt_component_4 } from './DownloadButton-DO934bEq.mjs';
import { j as __nuxt_component_5, M as Manufacturer, F as Fixture } from './Manufacturer-D4NeCXtn.mjs';
import { _ as __nuxt_component_0$2 } from './nuxt-link-BmOBtkDI.mjs';
import { mergeProps, createSlots, withCtx, openBlock, createBlock, createCommentVNode, createVNode, createTextVNode, toDisplayString, Fragment, renderList, withModifiers, withDirectives, vModelText, vModelSelect, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { v as v4 } from '../nitro/nitro.mjs';
import { s as stringProp } from '../_/object.mjs';

/**
 * Allows any type. No built-in runtime validation is performed by default.
 *
 * @template T - can be used to restrict the type at compile time.
 * @param validator - Optional function for runtime validation; should return `undefined` if valid, or an error string if invalid.
 */
const anyProp = (validator) => propOptionsGenerator(undefined, validator);

const constants = {
  RESOLUTION_8BIT: 1,
  RESOLUTION_16BIT: 2,
  RESOLUTION_24BIT: 3,
  RESOLUTION_32BIT: 4
};
function getEmptyFormState() {
  return {};
}
function getEmptyFixture() {
  return {
    key: "[new]",
    useExistingManufacturer: true,
    manufacturerKey: "",
    newManufacturerName: "",
    newManufacturerWebsite: "",
    newManufacturerComment: "",
    newManufacturerRdmId: null,
    name: "",
    shortName: "",
    categories: [],
    comment: "",
    links: [
      getEmptyLink("manual"),
      getEmptyLink("productPage"),
      getEmptyLink("video")
    ],
    rdmModelId: null,
    rdmSoftwareVersion: "",
    physical: getEmptyPhysical(),
    modes: [getEmptyMode()],
    metaAuthor: "",
    availableChannels: {}
  };
}
function getEmptyLink(linkType = "manual") {
  return {
    uuid: v4(),
    type: linkType,
    url: ""
  };
}
function getEmptyPhysical() {
  return {
    dimensions: null,
    weight: null,
    power: null,
    DMXconnector: "",
    DMXconnectorNew: "",
    bulb: {
      type: "",
      colorTemperature: null,
      lumens: null
    },
    lens: {
      name: "",
      degreesMinMax: null
    }
  };
}
function getEmptyMode() {
  return {
    uuid: v4(),
    name: "",
    shortName: "",
    rdmPersonalityIndex: null,
    enablePhysicalOverride: false,
    physical: getEmptyPhysical(),
    channels: []
  };
}
function getEmptyChannel() {
  return {
    uuid: v4(),
    editMode: "",
    modeId: "",
    name: "",
    resolution: constants.RESOLUTION_8BIT,
    dmxValueResolution: constants.RESOLUTION_8BIT,
    defaultValue: "",
    highlightValue: "",
    constant: null,
    precedence: "",
    wheel: {
      direction: "",
      slots: []
    },
    wizard: {
      show: false,
      start: 0,
      width: 10,
      count: 3,
      templateCapability: getEmptyCapability()
    },
    capabilities: [getEmptyCapability()]
  };
}
function getEmptyFineChannel(coarseChannelId, resolution) {
  return {
    uuid: v4(),
    coarseChannelId,
    resolution
  };
}
function getEmptyCapability() {
  return {
    uuid: v4(),
    open: true,
    dmxRange: null,
    type: "",
    typeData: {}
  };
}
function getEmptyWheelSlot() {
  return {
    uuid: v4(),
    type: "",
    typeData: {}
  };
}
function isChannelChanged(channel) {
  return Object.keys(channel).some((property) => {
    if (["uuid", "editMode", "modeId", "wizard"].includes(property)) {
      return false;
    }
    if (["defaultValue", "highlightValue", "invert", "constant", "crossfade"].includes(property)) {
      return channel[property] !== null;
    }
    if (property === "resolution" || property === "dmxValueResolution") {
      return channel[property] !== constants.RESOLUTION_8BIT;
    }
    if (property === "capabilities") {
      return channel.capabilities.some(
        (capability) => isCapabilityChanged(capability)
      );
    }
    return channel[property] !== "";
  });
}
function isCapabilityChanged(capability) {
  if (capability.dmxRange !== null) {
    return true;
  }
  if (capability.type !== "") {
    return true;
  }
  return Object.values(capability.typeData).some((value) => value !== "" && value !== null);
}
function colorsHexStringToArray(hexString) {
  if (typeof hexString !== "string") {
    return null;
  }
  const hexArray = hexString.split(/\s*,\s*/).map((hex) => hex.trim().toLowerCase()).filter(
    (hex) => hex.match(/^#[\da-f]{6}$/)
  );
  if (hexArray.length === 0) {
    return null;
  }
  return hexArray;
}
function getSanitizedChannel(channel) {
  const sanitizedChannel = structuredClone(channel);
  delete sanitizedChannel.editMode;
  delete sanitizedChannel.modeId;
  delete sanitizedChannel.wizard;
  return sanitizedChannel;
}
const stateTitles = {
  closed: "Closed",
  validating: "Validating your new fixture…",
  ready: "Submit your new fixture",
  preview: "Preview fixture",
  uploading: "Submitting your new fixture…",
  success: "Upload complete",
  error: "Upload failed"
};
const stateTitlesPlural = {
  ready: "Submit your new fixtures",
  uploading: "Submitting your new fixtures…"
};
const _sfc_main = {
  components: {
    A11yDialog: __nuxt_component_0$1,
    DownloadButton: __nuxt_component_4,
    FixturePage: __nuxt_component_5,
    FixtureHeader: __nuxt_component_0
  },
  props: {
    endpoint: stringProp().required,
    githubUsername: stringProp().optional,
    githubComment: stringProp().optional
  },
  emits: {
    success: () => true,
    reset: () => true
  },
  data() {
    return {
      state: "closed",
      requestBody: null,
      error: null,
      pullRequestUrl: null,
      fixtureCreateResult: null,
      previewFixtureKey: null
    };
  },
  computed: {
    fixtureKeys() {
      if (this.fixtureCreateResult === null) {
        return [];
      }
      return Object.keys(this.fixtureCreateResult.fixtures);
    },
    isPlural() {
      return this.fixtureKeys.length > 1;
    },
    title() {
      if (this.state in stateTitlesPlural && this.isPlural) {
        return stateTitlesPlural[this.state];
      }
      return stateTitles[this.state];
    },
    rawData() {
      const rawData = JSON.stringify(this.requestBody, null, 2);
      if (this.state === "error") {
        const backticks = "```";
        return `${backticks}json
${rawData}

${this.error}
${backticks}`;
      }
      return rawData;
    },
    hasPreview() {
      if (this.fixtureCreateResult === null) {
        return false;
      }
      return Object.values(this.fixtureCreateResult.errors).some(
        (errors) => errors.length === 0
      );
    },
    hasValidationErrors() {
      if (this.fixtureCreateResult === null) {
        return false;
      }
      return Object.values(this.fixtureCreateResult.errors).flat().length > 0;
    },
    hasValidationWarnings() {
      if (this.fixtureCreateResult === null) {
        return false;
      }
      return Object.values(this.fixtureCreateResult.warnings).flat().length > 0;
    },
    previewFixture() {
      if (this.previewFixtureKey === null) {
        return null;
      }
      const [manufacturerKey, fixtureKey] = this.previewFixtureKey.split("/");
      const manufacturer = new Manufacturer(manufacturerKey, this.fixtureCreateResult.manufacturers[manufacturerKey]);
      return new Fixture(manufacturer, fixtureKey, this.fixtureCreateResult.fixtures[this.previewFixtureKey]);
    },
    previewFixtureResults() {
      if (this.previewFixtureKey === null) {
        return null;
      }
      return {
        warnings: this.fixtureCreateResult.warnings[this.previewFixtureKey],
        errors: this.fixtureCreateResult.errors[this.previewFixtureKey]
      };
    },
    previewFixtureCreateResult() {
      if (this.previewFixtureKey === null) {
        return null;
      }
      return {
        manufacturers: this.fixtureCreateResult.manufacturers,
        fixtures: {
          [this.previewFixtureKey]: this.fixtureCreateResult.fixtures[this.previewFixtureKey]
        },
        warnings: {
          [this.previewFixtureKey]: this.previewFixtureResults.warnings
        },
        errors: {
          [this.previewFixtureKey]: this.previewFixtureResults.errors
        }
      };
    }
  },
  methods: {
    /**
     * Called from fixture editor to open the dialog.
     * @public
     * @param {object} requestBody The data to pass to the API endpoint.
     */
    async validate(requestBody) {
      this.requestBody = requestBody;
      this.state = "validating";
      try {
        this.fixtureCreateResult = await $fetch(this.endpoint, {
          method: "POST",
          body: this.requestBody
        });
        this.state = "ready";
      } catch (error) {
        let errorMessage = error.message;
        if (error.data && error.data.error) {
          errorMessage = error.data.error;
        }
        this.error = errorMessage;
        this.state = "error";
      }
    },
    async onPreview() {
      this.previewFixtureKey = Object.keys(this.fixtureCreateResult.fixtures)[0];
      this.state = "preview";
    },
    async onSubmit() {
      this.requestBody = {
        fixtureCreateResult: this.fixtureCreateResult,
        githubUsername: this.githubUsername ?? null,
        githubComment: this.githubComment ?? null
      };
      this.state = "uploading";
      try {
        const response = await $fetch(
          "/api/v1/fixtures/submit",
          {
            method: "POST",
            body: this.requestBody
          }
        );
        this.pullRequestUrl = response.pullRequestUrl;
        this.state = "success";
        this.$emit("success");
      } catch (error) {
        let errorMessage = error.message;
        if (error.data && error.data.error) {
          errorMessage = error.data.error;
        }
        this.error = errorMessage;
        this.state = "error";
      }
    },
    onReset() {
      this.state = "closed";
      this.$emit("reset");
    },
    onCancel() {
      this.state = "closed";
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_A11yDialog = __nuxt_component_0$1;
  const _component_FixtureHeader = __nuxt_component_0;
  const _component_DownloadButton = __nuxt_component_4;
  const _component_FixturePage = __nuxt_component_5;
  const _component_NuxtLink = __nuxt_component_0$2;
  _push(ssrRenderComponent(_component_A11yDialog, mergeProps({
    id: "submit-dialog",
    "is-alert-dialog": "",
    shown: $data.state !== `closed`,
    title: $options.title,
    wide: $data.state === `preview`
  }, _attrs), createSlots({
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        if ($data.state === `validating`) {
          _push2(`<div data-v-d7049b4c${_scopeId}>Validating…</div>`);
        } else if ($data.state === `ready`) {
          _push2(`<div data-v-d7049b4c${_scopeId}>`);
          if (!$options.hasPreview) {
            _push2(`<!--[--> Unfortunately, the fixture validation returned some issues. Due to some of those, there is also no preview available. You can try to resolve as many errors as you can (some may be unavoidable in the editor) and then submit your fixture${ssrInterpolate($options.isPlural ? `s` : ``)} to the Open Fixture Library project. After submitting, we will review the fixture${ssrInterpolate($options.isPlural ? `s` : ``)} and fix all remaining issues. <!--]-->`);
          } else if ($options.hasValidationErrors || $options.hasValidationWarnings) {
            _push2(`<!--[--> Unfortunately, the fixture validation returned some issues. You can try to resolve as many as you can (some may be unavoidable in the editor). Next, head over to the preview, where it is also possible to download your current fixture${ssrInterpolate($options.isPlural ? `s` : ``)} for private use. After that, please submit your fixture${ssrInterpolate($options.isPlural ? `s` : ``)} to the Open Fixture Library project, where ${ssrInterpolate($options.isPlural ? `they` : `it`)} will be reviewed and added to the library. <!--]-->`);
          } else {
            _push2(`<!--[--> Your fixture validation was successful. Next, head over to the preview, where it is also possible to download your current fixture${ssrInterpolate($options.isPlural ? `s` : ``)} for private use. After that, please submit your fixture${ssrInterpolate($options.isPlural ? `s` : ``)} to the Open Fixture Library project, where ${ssrInterpolate($options.isPlural ? `they` : `it`)} will be reviewed and added to the library. <!--]-->`);
          }
          _push2(`<ul data-v-d7049b4c${_scopeId}><!--[-->`);
          ssrRenderList($options.fixtureKeys, (key) => {
            _push2(`<li data-v-d7049b4c${_scopeId}><strong data-v-d7049b4c${_scopeId}>${ssrInterpolate(key)}</strong><ul data-v-d7049b4c${_scopeId}><!--[-->`);
            ssrRenderList($data.fixtureCreateResult.errors[key], (message) => {
              _push2(`<li data-v-d7049b4c${_scopeId}> Error: ${ssrInterpolate(message)}</li>`);
            });
            _push2(`<!--]--><!--[-->`);
            ssrRenderList($data.fixtureCreateResult.warnings[key], (message) => {
              _push2(`<li data-v-d7049b4c${_scopeId}>${ssrInterpolate(message)}</li>`);
            });
            _push2(`<!--]--></ul></li>`);
          });
          _push2(`<!--]--></ul><div class="button-bar right" data-v-d7049b4c${_scopeId}><button type="button" class="secondary" data-v-d7049b4c${_scopeId}>Continue editing</button>`);
          if ($options.hasPreview) {
            _push2(`<button type="button" class="primary" data-v-d7049b4c${_scopeId}>Preview fixture${ssrInterpolate($options.isPlural ? `s` : ``)}</button>`);
          } else {
            _push2(`<button type="button" class="primary" data-v-d7049b4c${_scopeId}>Submit to OFL</button>`);
          }
          _push2(`</div></div>`);
        } else if ($data.state === `preview`) {
          _push2(`<div data-v-d7049b4c${_scopeId}>`);
          if ($options.previewFixture) {
            _push2(`<div class="fixture-page" data-v-d7049b4c${_scopeId}>`);
            _push2(ssrRenderComponent(_component_FixtureHeader, null, {
              title: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<h1 data-v-d7049b4c${_scopeId2}>${ssrInterpolate($options.previewFixture.manufacturer.name)} ${ssrInterpolate($options.previewFixture.name)} `);
                  if ($options.previewFixture.hasShortName) {
                    _push3(`<code data-v-d7049b4c${_scopeId2}>${ssrInterpolate($options.previewFixture.shortName)}</code>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</h1>`);
                } else {
                  return [
                    createVNode("h1", null, [
                      createTextVNode(toDisplayString($options.previewFixture.manufacturer.name) + " " + toDisplayString($options.previewFixture.name) + " ", 1),
                      $options.previewFixture.hasShortName ? (openBlock(), createBlock("code", { key: 0 }, toDisplayString($options.previewFixture.shortName), 1)) : createCommentVNode("", true)
                    ])
                  ];
                }
              }),
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  if ($options.previewFixtureResults.errors.length === 0) {
                    _push3(ssrRenderComponent(_component_DownloadButton, { "editor-fixtures": $options.previewFixtureCreateResult }, null, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                } else {
                  return [
                    $options.previewFixtureResults.errors.length === 0 ? (openBlock(), createBlock(_component_DownloadButton, {
                      key: 0,
                      "editor-fixtures": $options.previewFixtureCreateResult
                    }, null, 8, ["editor-fixtures"])) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            if ($options.previewFixtureResults.warnings.length > 0) {
              _push2(`<section class="card yellow" data-v-d7049b4c${_scopeId}><strong data-v-d7049b4c${_scopeId}>Warnings:<br data-v-d7049b4c${_scopeId}></strong><!--[-->`);
              ssrRenderList($options.previewFixtureResults.warnings, (message) => {
                _push2(`<span data-v-d7049b4c${_scopeId}>${ssrInterpolate(message)}<br data-v-d7049b4c${_scopeId}></span>`);
              });
              _push2(`<!--]--></section>`);
            } else {
              _push2(`<!---->`);
            }
            if ($options.previewFixtureResults.errors.length > 0) {
              _push2(`<section class="card red" data-v-d7049b4c${_scopeId}><strong data-v-d7049b4c${_scopeId}>Errors (prevent showing the fixture preview):<br data-v-d7049b4c${_scopeId}></strong><!--[-->`);
              ssrRenderList($options.previewFixtureResults.errors, (message) => {
                _push2(`<span data-v-d7049b4c${_scopeId}>${ssrInterpolate(message)}<br data-v-d7049b4c${_scopeId}></span>`);
              });
              _push2(`<!--]--></section>`);
            } else {
              _push2(`<!---->`);
            }
            if ($options.previewFixtureResults.errors.length === 0) {
              _push2(ssrRenderComponent(_component_FixturePage, { fixture: $options.previewFixture }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="button-bar right" data-v-d7049b4c${_scopeId}><button type="button" class="secondary" data-v-d7049b4c${_scopeId}>Continue editing</button><button type="button" class="primary" data-v-d7049b4c${_scopeId}>Submit to OFL</button></div></div>`);
        } else if ($data.state === `uploading`) {
          _push2(`<div data-v-d7049b4c${_scopeId}>Uploading…</div>`);
        } else if ($data.state === `success`) {
          _push2(`<div data-v-d7049b4c${_scopeId}> Your fixture was successfully uploaded to GitHub (see the <a${ssrRenderAttr("href", $data.pullRequestUrl)} target="_blank" rel="noopener" data-v-d7049b4c${_scopeId}>pull request</a>). It will be now reviewed and then published on the website (this may take a few days). Thank you for your contribution! <div class="button-bar right" data-v-d7049b4c${_scopeId}>`);
          _push2(ssrRenderComponent(_component_NuxtLink, {
            to: "/",
            class: "button secondary"
          }, {
            default: withCtx((_2, _push3, _parent3, _scopeId2) => {
              if (_push3) {
                _push3(`Back to homepage`);
              } else {
                return [
                  createTextVNode("Back to homepage")
                ];
              }
            }),
            _: 1
          }, _parent2, _scopeId));
          _push2(`<button type="button" class="button secondary" data-v-d7049b4c${_scopeId}>Close</button>`);
          if (!$options.hasValidationErrors) {
            _push2(ssrRenderComponent(_component_DownloadButton, {
              "button-style": "select",
              "editor-fixtures": $data.fixtureCreateResult
            }, null, _parent2, _scopeId));
          } else {
            _push2(`<!---->`);
          }
          _push2(`<a${ssrRenderAttr("href", $data.pullRequestUrl)} class="button primary" target="_blank" rel="noopener" data-v-d7049b4c${_scopeId}> See pull request </a></div></div>`);
        } else if ($data.state === `error`) {
          _push2(`<div data-v-d7049b4c${_scopeId}> Unfortunately, there was an error while uploading. Please copy the following data and <a href="https://github.com/OpenLightingProject/open-fixture-library/issues/new" target="_blank" rel="noopener" data-v-d7049b4c${_scopeId}> manually submit them to GitHub </a>. <textarea readonly data-v-d7049b4c${_scopeId}>${ssrInterpolate($options.rawData)}</textarea><div class="button-bar right" data-v-d7049b4c${_scopeId}><button type="button" class="button secondary" data-v-d7049b4c${_scopeId}>Close</button><a href="https://github.com/OpenLightingProject/open-fixture-library/issues/new" class="button primary" target="_blank" rel="noopener" data-v-d7049b4c${_scopeId}> Submit manually </a></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      } else {
        return [
          $data.state === `validating` ? (openBlock(), createBlock("div", { key: 0 }, "Validating…")) : $data.state === `ready` ? (openBlock(), createBlock("div", { key: 1 }, [
            !$options.hasPreview ? (openBlock(), createBlock(Fragment, { key: 0 }, [
              createTextVNode(" Unfortunately, the fixture validation returned some issues. Due to some of those, there is also no preview available. You can try to resolve as many errors as you can (some may be unavoidable in the editor) and then submit your fixture" + toDisplayString($options.isPlural ? `s` : ``) + " to the Open Fixture Library project. After submitting, we will review the fixture" + toDisplayString($options.isPlural ? `s` : ``) + " and fix all remaining issues. ", 1)
            ], 64)) : $options.hasValidationErrors || $options.hasValidationWarnings ? (openBlock(), createBlock(Fragment, { key: 1 }, [
              createTextVNode(" Unfortunately, the fixture validation returned some issues. You can try to resolve as many as you can (some may be unavoidable in the editor). Next, head over to the preview, where it is also possible to download your current fixture" + toDisplayString($options.isPlural ? `s` : ``) + " for private use. After that, please submit your fixture" + toDisplayString($options.isPlural ? `s` : ``) + " to the Open Fixture Library project, where " + toDisplayString($options.isPlural ? `they` : `it`) + " will be reviewed and added to the library. ", 1)
            ], 64)) : (openBlock(), createBlock(Fragment, { key: 2 }, [
              createTextVNode(" Your fixture validation was successful. Next, head over to the preview, where it is also possible to download your current fixture" + toDisplayString($options.isPlural ? `s` : ``) + " for private use. After that, please submit your fixture" + toDisplayString($options.isPlural ? `s` : ``) + " to the Open Fixture Library project, where " + toDisplayString($options.isPlural ? `they` : `it`) + " will be reviewed and added to the library. ", 1)
            ], 64)),
            createVNode("ul", null, [
              (openBlock(true), createBlock(Fragment, null, renderList($options.fixtureKeys, (key) => {
                return openBlock(), createBlock("li", { key }, [
                  createVNode("strong", null, toDisplayString(key), 1),
                  createVNode("ul", null, [
                    (openBlock(true), createBlock(Fragment, null, renderList($data.fixtureCreateResult.errors[key], (message) => {
                      return openBlock(), createBlock("li", { key: message }, " Error: " + toDisplayString(message), 1);
                    }), 128)),
                    (openBlock(true), createBlock(Fragment, null, renderList($data.fixtureCreateResult.warnings[key], (message) => {
                      return openBlock(), createBlock("li", { key: message }, toDisplayString(message), 1);
                    }), 128))
                  ])
                ]);
              }), 128))
            ]),
            createVNode("div", { class: "button-bar right" }, [
              createVNode("button", {
                type: "button",
                class: "secondary",
                onClick: withModifiers(($event) => $options.onCancel(), ["prevent"])
              }, "Continue editing", 8, ["onClick"]),
              $options.hasPreview ? (openBlock(), createBlock("button", {
                key: 0,
                type: "button",
                class: "primary",
                onClick: withModifiers(($event) => $options.onPreview(), ["prevent"])
              }, "Preview fixture" + toDisplayString($options.isPlural ? `s` : ``), 9, ["onClick"])) : (openBlock(), createBlock("button", {
                key: 1,
                type: "button",
                class: "primary",
                onClick: withModifiers(($event) => $options.onSubmit(), ["prevent"])
              }, "Submit to OFL", 8, ["onClick"]))
            ])
          ])) : $data.state === `preview` ? (openBlock(), createBlock("div", { key: 2 }, [
            $options.previewFixture ? (openBlock(), createBlock("div", {
              key: 0,
              class: "fixture-page"
            }, [
              createVNode(_component_FixtureHeader, null, {
                title: withCtx(() => [
                  createVNode("h1", null, [
                    createTextVNode(toDisplayString($options.previewFixture.manufacturer.name) + " " + toDisplayString($options.previewFixture.name) + " ", 1),
                    $options.previewFixture.hasShortName ? (openBlock(), createBlock("code", { key: 0 }, toDisplayString($options.previewFixture.shortName), 1)) : createCommentVNode("", true)
                  ])
                ]),
                default: withCtx(() => [
                  $options.previewFixtureResults.errors.length === 0 ? (openBlock(), createBlock(_component_DownloadButton, {
                    key: 0,
                    "editor-fixtures": $options.previewFixtureCreateResult
                  }, null, 8, ["editor-fixtures"])) : createCommentVNode("", true)
                ]),
                _: 1
              }),
              $options.previewFixtureResults.warnings.length > 0 ? (openBlock(), createBlock("section", {
                key: 0,
                class: "card yellow"
              }, [
                createVNode("strong", null, [
                  createTextVNode("Warnings:"),
                  createVNode("br")
                ]),
                (openBlock(true), createBlock(Fragment, null, renderList($options.previewFixtureResults.warnings, (message) => {
                  return openBlock(), createBlock("span", { key: message }, [
                    createTextVNode(toDisplayString(message), 1),
                    createVNode("br")
                  ]);
                }), 128))
              ])) : createCommentVNode("", true),
              $options.previewFixtureResults.errors.length > 0 ? (openBlock(), createBlock("section", {
                key: 1,
                class: "card red"
              }, [
                createVNode("strong", null, [
                  createTextVNode("Errors (prevent showing the fixture preview):"),
                  createVNode("br")
                ]),
                (openBlock(true), createBlock(Fragment, null, renderList($options.previewFixtureResults.errors, (message) => {
                  return openBlock(), createBlock("span", { key: message }, [
                    createTextVNode(toDisplayString(message), 1),
                    createVNode("br")
                  ]);
                }), 128))
              ])) : createCommentVNode("", true),
              $options.previewFixtureResults.errors.length === 0 ? (openBlock(), createBlock(_component_FixturePage, {
                key: 2,
                fixture: $options.previewFixture
              }, null, 8, ["fixture"])) : createCommentVNode("", true)
            ])) : createCommentVNode("", true),
            createVNode("div", { class: "button-bar right" }, [
              createVNode("button", {
                type: "button",
                class: "secondary",
                onClick: withModifiers(($event) => $options.onCancel(), ["prevent"])
              }, "Continue editing", 8, ["onClick"]),
              createVNode("button", {
                type: "button",
                class: "primary",
                onClick: withModifiers(($event) => $options.onSubmit(), ["prevent"])
              }, "Submit to OFL", 8, ["onClick"])
            ])
          ])) : $data.state === `uploading` ? (openBlock(), createBlock("div", { key: 3 }, "Uploading…")) : $data.state === `success` ? (openBlock(), createBlock("div", { key: 4 }, [
            createTextVNode(" Your fixture was successfully uploaded to GitHub (see the "),
            createVNode("a", {
              href: $data.pullRequestUrl,
              target: "_blank",
              rel: "noopener"
            }, "pull request", 8, ["href"]),
            createTextVNode("). It will be now reviewed and then published on the website (this may take a few days). Thank you for your contribution! "),
            createVNode("div", { class: "button-bar right" }, [
              createVNode(_component_NuxtLink, {
                to: "/",
                class: "button secondary"
              }, {
                default: withCtx(() => [
                  createTextVNode("Back to homepage")
                ]),
                _: 1
              }),
              createVNode("button", {
                type: "button",
                class: "button secondary",
                onClick: withModifiers(($event) => $options.onReset(), ["prevent"])
              }, "Close", 8, ["onClick"]),
              !$options.hasValidationErrors ? (openBlock(), createBlock(_component_DownloadButton, {
                key: 0,
                "button-style": "select",
                "editor-fixtures": $data.fixtureCreateResult
              }, null, 8, ["editor-fixtures"])) : createCommentVNode("", true),
              createVNode("a", {
                href: $data.pullRequestUrl,
                class: "button primary",
                target: "_blank",
                rel: "noopener"
              }, " See pull request ", 8, ["href"])
            ])
          ])) : $data.state === `error` ? (openBlock(), createBlock("div", { key: 5 }, [
            createTextVNode(" Unfortunately, there was an error while uploading. Please copy the following data and "),
            createVNode("a", {
              href: "https://github.com/OpenLightingProject/open-fixture-library/issues/new",
              target: "_blank",
              rel: "noopener"
            }, " manually submit them to GitHub "),
            createTextVNode(". "),
            withDirectives(createVNode("textarea", {
              "onUpdate:modelValue": ($event) => $options.rawData = $event,
              readonly: ""
            }, null, 8, ["onUpdate:modelValue"]), [
              [vModelText, $options.rawData]
            ]),
            createVNode("div", { class: "button-bar right" }, [
              createVNode("button", {
                type: "button",
                class: "button secondary",
                onClick: withModifiers(($event) => $options.onCancel(), ["prevent"])
              }, "Close", 8, ["onClick"]),
              createVNode("a", {
                href: "https://github.com/OpenLightingProject/open-fixture-library/issues/new",
                class: "button primary",
                target: "_blank",
                rel: "noopener"
              }, " Submit manually ")
            ])
          ])) : createCommentVNode("", true)
        ];
      }
    }),
    _: 2
  }, [
    $data.state === `preview` ? {
      name: "title",
      fn: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<span class="preview-fixture-title" data-v-d7049b4c${_scopeId}>${ssrInterpolate($options.title)}</span>`);
          if ($options.fixtureKeys.length > 1) {
            _push2(`<select class="preview-fixture-chooser" data-v-d7049b4c${_scopeId}><option disabled data-v-d7049b4c${ssrIncludeBooleanAttr(Array.isArray($data.previewFixtureKey) ? ssrLooseContain($data.previewFixtureKey, null) : ssrLooseEqual($data.previewFixtureKey, null)) ? " selected" : ""}${_scopeId}>Choose fixture to preview</option><!--[-->`);
            ssrRenderList($options.fixtureKeys, (key) => {
              _push2(`<option${ssrRenderAttr("value", key)} data-v-d7049b4c${ssrIncludeBooleanAttr(Array.isArray($data.previewFixtureKey) ? ssrLooseContain($data.previewFixtureKey, key) : ssrLooseEqual($data.previewFixtureKey, key)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(key)}</option>`);
            });
            _push2(`<!--]--></select>`);
          } else {
            _push2(`<!---->`);
          }
        } else {
          return [
            createVNode("span", { class: "preview-fixture-title" }, toDisplayString($options.title), 1),
            $options.fixtureKeys.length > 1 ? withDirectives((openBlock(), createBlock("select", {
              key: 0,
              "onUpdate:modelValue": ($event) => $data.previewFixtureKey = $event,
              class: "preview-fixture-chooser"
            }, [
              createVNode("option", { disabled: "" }, "Choose fixture to preview"),
              (openBlock(true), createBlock(Fragment, null, renderList($options.fixtureKeys, (key) => {
                return openBlock(), createBlock("option", {
                  key,
                  value: key
                }, toDisplayString(key), 9, ["value"]);
              }), 128))
            ], 8, ["onUpdate:modelValue"])), [
              [vModelSelect, $data.previewFixtureKey]
            ]) : createCommentVNode("", true)
          ];
        }
      }),
      key: "0"
    } : void 0
  ]), _parent));
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/EditorSubmitDialog.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const EditorSubmitDialog = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-d7049b4c"]]), { __name: "EditorSubmitDialog" });

export { EditorSubmitDialog as E, getEmptyChannel as a, getEmptyMode as b, constants as c, getEmptyFormState as d, anyProp as e, getEmptyCapability as f, getEmptyFixture as g, getEmptyFineChannel as h, getSanitizedChannel as i, isChannelChanged as j, isCapabilityChanged as k, getEmptyLink as l, getEmptyPhysical as m, colorsHexStringToArray as n, getEmptyWheelSlot as o };
//# sourceMappingURL=EditorSubmitDialog-B5U3WmZ-.mjs.map
