import { _ as __nuxt_component_0$2 } from './nuxt-link-BmOBtkDI.mjs';
import { p as propOptionsGenerator, _ as _export_sfc, e as __nuxt_component_2$2$1, c as createError, a as useHead, f as __nuxt_component_5, b as __nuxt_component_1$1$1, g as __nuxt_component_6$2, h as __nuxt_component_1$2 } from './server.mjs';
import scrollIntoView from 'scroll-into-view';
import { s as schemaDefinitions, p as physicalLensProperties, a as physicalBulbProperties, b as physicalProperties, m as modeProperties, n as numberProp, c as manufacturerProperties, f as fixtureProperties, _ as __nuxt_component_1$1$2, d as capabilityTypes, e as channelProperties, u as unitsSchema, g as capabilityDmxRange, h as fixtureLinkTypes, l as linksProperties, i as entitiesSchema, w as wheelSlotTypes } from './Manufacturer-D4NeCXtn.mjs';
import { E as EditorSubmitDialog, g as getEmptyFixture, a as getEmptyChannel, c as constants, b as getEmptyMode, d as getEmptyFormState, e as anyProp, f as getEmptyCapability, h as getEmptyFineChannel, i as getSanitizedChannel, j as isChannelChanged, k as isCapabilityChanged, l as getEmptyLink, m as getEmptyPhysical, n as colorsHexStringToArray, o as getEmptyWheelSlot } from './EditorSubmitDialog-B5U3WmZ-.mjs';
import { _ as __nuxt_component_0$1$1 } from './HelpWantedMessage-b-LiPWlj.mjs';
import { _ as __nuxt_component_2$3, a as __nuxt_component_1$3 } from './LabeledInput-818znnbz.mjs';
import { mergeProps, withCtx, createTextVNode, createVNode, toDisplayString, withModifiers, openBlock, createBlock, createCommentVNode, resolveComponent, withKeys, withDirectives, vModelText, Fragment, renderList, vModelSelect, resolveDynamicComponent, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrGetDynamicModelProps, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrRenderAttr, ssrRenderClass, ssrLooseEqual, ssrRenderList, ssrRenderStyle, ssrRenderVNode } from 'vue/server-renderer';
import { _ as __nuxt_component_3$2 } from './ConditionalDetails-BGP2N0Fc.mjs';
import Draggable from 'vuedraggable';
import { u as useAsyncData } from './asyncData-CINZYKlw.mjs';
import { s as stringProp, b as booleanProp, o as objectProp } from '../_/object.mjs';
import { v as v4 } from '../nitro/nitro.mjs';
import { i as integerProp } from './DownloadButton-DO934bEq.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import './register-vmKDb_jz.mjs';
import '../_/oneOf.mjs';
import 'perfect-debounce';
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

/**
 * Allows any array. No further runtime validation is performed by default.
 *
 * @template T - can be used to restrict the type of the array items at compile time.
 *  @param validator - Optional function for further runtime validation; should return `undefined` if valid, or an error string if invalid.
 */
const arrayProp = (validator) => propOptionsGenerator(Array, validator);

/**
 * Allows any of the passed constructor types (validated at runtime).
 *
 * @template T - has to be used to adjust the type at compile time.
 * @param type - A single constructor or an array of constructors to allow.
 * @param validator - Optional function for further runtime validation; should return `undefined` if valid, or an error string if invalid.
 */
const oneOfTypesProp = (type, validator) => propOptionsGenerator(type, validator);

const _sfc_main$1c = {
  props: {
    schemaProperty: objectProp().required,
    required: booleanProp().withDefault(false),
    hint: stringProp().optional,
    modelValue: anyProp().required
  },
  emits: {
    "update:modelValue": (value) => true,
    "blur": (value) => true,
    "vf:validate": (validationData) => true
  },
  data() {
    return {
      localValue: ""
    };
  },
  computed: {
    /**
     * @public
     * @returns {Record<string, string | null>} Validation data for vue-form
     */
    validationData() {
      return {
        pattern: "pattern" in this.schemaProperty ? `${this.schemaProperty.pattern}` : null,
        minlength: "minLength" in this.schemaProperty ? `${this.schemaProperty.minLength}` : null,
        maxlength: "maxLength" in this.schemaProperty ? `${this.schemaProperty.maxLength}` : null
      };
    }
  },
  watch: {
    modelValue: {
      handler(newValue) {
        this.localValue = newValue ? String(newValue) : "";
      },
      immediate: true
    },
    validationData: {
      handler(newValidationData) {
        this.$emit("vf:validate", newValidationData);
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    /** @public */
    focus() {
      this.$el.focus();
    },
    update() {
      this.$emit("update:modelValue", this.localValue);
    },
    async onBlur() {
      await this.$nextTick();
      this.$emit("blur", this.localValue);
    }
  }
};
function _sfc_ssrRender$1c(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  let _temp0;
  _push(`<input${ssrRenderAttrs((_temp0 = mergeProps({
    value: $data.localValue,
    required: $props.required,
    placeholder: $props.hint,
    pattern: $props.schemaProperty.pattern,
    minlength: $props.schemaProperty.minLength,
    maxlength: $props.schemaProperty.maxLength,
    type: "text"
  }, _attrs), mergeProps(_temp0, ssrGetDynamicModelProps(_temp0, $data.localValue))))}>`);
}
const _sfc_setup$1c = _sfc_main$1c.setup;
_sfc_main$1c.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PropertyInputText.vue");
  return _sfc_setup$1c ? _sfc_setup$1c(props, ctx) : void 0;
};
const PropertyInputText = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1c, [["ssrRender", _sfc_ssrRender$1c]]), { __name: "PropertyInputText" });
const _sfc_main$1b = {
  props: {
    schemaProperty: objectProp().required,
    required: booleanProp().withDefault(false),
    hint: stringProp().optional,
    minimum: oneOfTypesProp([Number, String]).optional,
    // can be the string `invalid`
    maximum: oneOfTypesProp([Number, String]).optional,
    // can be the string `invalid`
    modelValue: anyProp().required,
    lazy: booleanProp().withDefault(false),
    stepOverride: numberProp().optional
  },
  emits: {
    "update:modelValue": (value) => true,
    "focus": () => true,
    "blur": () => true,
    "vf:validate": (validationData) => true
  },
  computed: {
    min() {
      if (this.minimum !== void 0 && this.minimum !== "invalid") {
        return this.minimum;
      }
      if ("minimum" in this.schemaProperty) {
        return this.schemaProperty.minimum;
      }
      return this.exclusiveMinimum;
    },
    max() {
      if (this.maximum !== void 0 && this.maximum !== "invalid") {
        return this.maximum;
      }
      if ("maximum" in this.schemaProperty) {
        return this.schemaProperty.maximum;
      }
      return this.exclusiveMaximum;
    },
    exclusiveMinimum() {
      if ("exclusiveMinimum" in this.schemaProperty) {
        return this.schemaProperty.exclusiveMinimum;
      }
      return null;
    },
    exclusiveMaximum() {
      if ("exclusiveMaximum" in this.schemaProperty) {
        return this.schemaProperty.exclusiveMaximum;
      }
      return null;
    },
    step() {
      if (this.stepOverride !== void 0) {
        return this.stepOverride;
      }
      return this.schemaProperty.type === "integer" ? 1 : "any";
    },
    /**
     * @public
     * @returns {Record<string, string | null>} Validation data for vue-form
     */
    validationData() {
      return {
        "min": this.min === null ? null : `${this.min}`,
        "max": this.max === null ? null : `${this.max}`,
        "data-exclusive-minimum": this.exclusiveMinimum === null ? null : `${this.exclusiveMinimum}`,
        "data-exclusive-maximum": this.exclusiveMaximum === null ? null : `${this.exclusiveMaximum}`,
        "step": `${this.step}`,
        "type": "number"
      };
    }
  },
  watch: {
    validationData: {
      handler(newValidationData) {
        this.$emit("vf:validate", newValidationData);
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    /** @public */
    focus() {
      this.$el.focus();
    },
    update() {
      const input = this.$el;
      if (input.validity && input.validity.badInput) {
        this.$emit("update:modelValue", "invalid");
        return;
      }
      if (input.value === "") {
        this.$emit("update:modelValue", null);
        return;
      }
      let value;
      try {
        value = Number.parseFloat(input.value);
      } catch {
        value = "invalid";
      }
      this.$emit("update:modelValue", value);
    }
  }
};
function _sfc_ssrRender$1b(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<input${ssrRenderAttrs(mergeProps({
    required: $props.required,
    min: $options.min,
    max: $options.max,
    "data-exclusive-minimum": $options.exclusiveMinimum,
    "data-exclusive-maximum": $options.exclusiveMaximum,
    step: $options.step,
    placeholder: $props.hint,
    value: $props.modelValue === `invalid` ? `` : $props.modelValue,
    type: "number"
  }, _attrs))}>`);
}
const _sfc_setup$1b = _sfc_main$1b.setup;
_sfc_main$1b.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PropertyInputNumber.vue");
  return _sfc_setup$1b ? _sfc_setup$1b(props, ctx) : void 0;
};
const __nuxt_component_3$1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1b, [["ssrRender", _sfc_ssrRender$1b]]), { __name: "PropertyInputNumber" });
const _sfc_main$1a = {
  components: {
    PropertyInputNumber: __nuxt_component_3$1
  },
  props: {
    schemaProperty: objectProp().required,
    required: booleanProp().withDefault(false),
    modelValue: anyProp().withDefault(""),
    associatedEntity: anyProp().optional,
    minNumber: numberProp().optional,
    maxNumber: numberProp().optional,
    name: stringProp().required,
    wide: booleanProp().withDefault(false)
  },
  emits: {
    "update:modelValue": (value) => true,
    "focus": () => true,
    "blur": () => true,
    "unit-selected": (unitString) => true,
    "vf:validate": (validationData) => true
  },
  data() {
    return {
      validationData: {
        "entity-complete": "",
        "entities-have-same-units": ""
      }
    };
  },
  computed: {
    subSchemas() {
      return this.schemaProperty.oneOf || [this.schemaProperty];
    },
    enumValues() {
      const enumSubSchema = this.subSchemas.find((subSchema) => "enum" in subSchema);
      return enumSubSchema ? enumSubSchema.enum : [];
    },
    unitNames() {
      return this.subSchemas.filter(
        (subSchema) => "$ref" in subSchema && subSchema.$ref.includes("#/units/")
      ).map(
        (subSchema) => subSchema.$ref.replace(/^(?:definitions\.json)?#\/units\//, "")
      );
    },
    units() {
      const units = {};
      for (const unitName of this.unitNames) {
        const unitSchema = unitsSchema[unitName];
        const unitString = "pattern" in unitSchema ? parseUnitFromPattern(unitSchema.pattern) : "";
        const numberSchema = "pattern" in unitSchema ? unitsSchema.number : unitSchema;
        units[unitName] = {
          unitString,
          displayString: getUnitDisplayString(unitString),
          numberSchema
        };
      }
      return units;
    },
    selectedUnit: {
      get() {
        return getSelectedUnit(this.modelValue, this.enumValues, this.unitNames, this.units);
      },
      set(newUnit) {
        if (this.enumValues.includes(newUnit) || newUnit === "") {
          this.update(newUnit);
        } else if (this.units[newUnit].unitString === "") {
          if (this.selectedNumber === "") {
            this.update("[no unit]");
          } else {
            this.update(Number.parseFloat(this.selectedNumber));
          }
          this.$emit("unit-selected", "[no unit]");
        } else {
          this.update(this.selectedNumber + this.units[newUnit].unitString);
          this.$emit("unit-selected", this.units[newUnit].unitString);
        }
      }
    },
    hasNumber() {
      return hasNumber(this.selectedUnit, this.enumValues);
    },
    selectedNumber: {
      get() {
        if (typeof this.modelValue !== "string") {
          return this.modelValue;
        }
        const number = Number.parseFloat(this.modelValue.replace(this.selectedUnit, ""));
        return Number.isNaN(number) ? "" : number;
      },
      set(newNumber) {
        if (newNumber === null || newNumber === "invalid") {
          newNumber = "";
        }
        if (this.units[this.selectedUnit].unitString === "") {
          if (newNumber === "") {
            this.update("[no unit]");
          } else {
            this.update(Number.parseFloat(newNumber));
          }
        } else {
          this.update(newNumber + this.units[this.selectedUnit].unitString);
        }
      }
    },
    /**
     * Used by vue-form's `entities-have-same-units` validation rule.
     * @public
     * @returns {boolean} True if this and the associated entity have the same unit.
     */
    hasSameUnit() {
      if (!this.associatedEntity) {
        return true;
      }
      const otherFieldSelectedUnit = getSelectedUnit(this.associatedEntity, this.enumValues, this.unitNames, this.units);
      if (!this.hasNumber && !hasNumber(otherFieldSelectedUnit, this.enumValues)) {
        return true;
      }
      return this.selectedUnit === otherFieldSelectedUnit;
    }
  },
  mounted() {
    this.$emit("vf:validate", this.validationData);
  },
  methods: {
    /** @public */
    focus() {
      const focusField = this.$refs.input ?? this.$refs.select;
      focusField.focus();
    },
    update(newValue) {
      this.$emit("update:modelValue", newValue);
    },
    /**
     * Called by {@link EditorProportionalPropertySwitcher}
     * @param {string} newUnitString The unit string to set.
     * @public
     */
    setUnitString(newUnitString) {
      if (newUnitString === "[no unit]") {
        newUnitString = "";
      }
      this.selectedUnit = Object.keys(this.units).find(
        (unitName) => this.units[unitName].unitString === newUnitString
      );
    },
    async unitSelected() {
      await this.$nextTick();
      await this.$nextTick();
      this.focus();
    },
    onFocus() {
      this.$emit("focus");
    },
    onBlur(event) {
      if (!(event.target && event.relatedTarget) || event.target.closest(".entity-input") !== event.relatedTarget.closest(".entity-input")) {
        this.$emit("blur");
      }
    }
  }
};
function parseUnitFromPattern(pattern) {
  if (!pattern.endsWith("$")) {
    throw new Error(`Pattern does not end with '$': ${pattern}`);
  }
  const lastNumberPartIndex = Math.max(pattern.lastIndexOf(")"), pattern.lastIndexOf("?"));
  return pattern.slice(lastNumberPartIndex + 1, -1).replaceAll("\\", "");
}
function getUnitDisplayString(unitString) {
  if (unitString === "") {
    return "number";
  }
  return unitString.replace("^2", "²").replace("^3", "³");
}
function getSelectedUnit(value, enumValues, unitNames, units) {
  if (enumValues.includes(value) || value === "") {
    return value;
  }
  if (value === "[no unit]" || typeof value !== "string") {
    return unitNames.find((name) => units[name].unitString === "");
  }
  const unit = value.replace(/^-?\d+(\.\d+)?/, "");
  return unitNames.find((name) => units[name].unitString === unit) || "";
}
function hasNumber(unitName, enumValues) {
  return unitName !== "" && !enumValues.includes(unitName);
}
function _sfc_ssrRender$1a(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Validate = __nuxt_component_5;
  const _component_PropertyInputNumber = __nuxt_component_3$1;
  _push(`<span${ssrRenderAttrs(mergeProps({
    class: ["entity-input", { "has-number": $options.hasNumber, wide: $props.wide }]
  }, _attrs))} data-v-121cffdf>`);
  if ($options.hasNumber) {
    _push(ssrRenderComponent(_component_Validate, { tag: "span" }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_PropertyInputNumber, {
            ref: "input",
            modelValue: $options.selectedNumber,
            "onUpdate:modelValue": ($event) => $options.selectedNumber = $event,
            class: "property-input-number",
            "schema-property": $options.units[$options.selectedUnit].numberSchema,
            required: "",
            minimum: $props.minNumber === void 0 ? `invalid` : $props.minNumber,
            maximum: $props.maxNumber === void 0 ? `invalid` : $props.maxNumber,
            name: $props.name ? `${$props.name}-number` : null,
            onFocus: ($event) => $options.onFocus(),
            onBlur: ($event) => $options.onBlur($event)
          }, null, _parent2, _scopeId));
        } else {
          return [
            createVNode(_component_PropertyInputNumber, {
              ref: "input",
              modelValue: $options.selectedNumber,
              "onUpdate:modelValue": ($event) => $options.selectedNumber = $event,
              class: "property-input-number",
              "schema-property": $options.units[$options.selectedUnit].numberSchema,
              required: "",
              minimum: $props.minNumber === void 0 ? `invalid` : $props.minNumber,
              maximum: $props.maxNumber === void 0 ? `invalid` : $props.maxNumber,
              name: $props.name ? `${$props.name}-number` : null,
              onFocus: ($event) => $options.onFocus(),
              onBlur: ($event) => $options.onBlur($event)
            }, null, 8, ["modelValue", "onUpdate:modelValue", "schema-property", "minimum", "maximum", "name", "onFocus", "onBlur"])
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(`<select${ssrIncludeBooleanAttr($props.required) ? " required" : ""} class="${ssrRenderClass({ empty: $options.selectedUnit === `` })}" data-v-121cffdf><option${ssrIncludeBooleanAttr($props.required) ? " disabled" : ""} value="" data-v-121cffdf${ssrIncludeBooleanAttr(Array.isArray($options.selectedUnit) ? ssrLooseContain($options.selectedUnit, "") : ssrLooseEqual($options.selectedUnit, "")) ? " selected" : ""}>unset</option>`);
  if ($options.enumValues.length > 0) {
    _push(`<optgroup label="Keywords" data-v-121cffdf><!--[-->`);
    ssrRenderList($options.enumValues, (enumValue) => {
      _push(`<option${ssrRenderAttr("value", enumValue)} data-v-121cffdf${ssrIncludeBooleanAttr(Array.isArray($options.selectedUnit) ? ssrLooseContain($options.selectedUnit, enumValue) : ssrLooseEqual($options.selectedUnit, enumValue)) ? " selected" : ""}>${ssrInterpolate(enumValue)}</option>`);
    });
    _push(`<!--]--></optgroup>`);
  } else {
    _push(`<!---->`);
  }
  if (Object.keys($options.units).length > 0) {
    _push(`<optgroup label="Units" data-v-121cffdf><!--[-->`);
    ssrRenderList($options.units, ({ displayString }, unitName) => {
      _push(`<option${ssrRenderAttr("value", unitName)} data-v-121cffdf${ssrIncludeBooleanAttr(Array.isArray($options.selectedUnit) ? ssrLooseContain($options.selectedUnit, unitName) : ssrLooseEqual($options.selectedUnit, unitName)) ? " selected" : ""}>${ssrInterpolate(displayString)}</option>`);
    });
    _push(`<!--]--></optgroup>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</select></span>`);
}
const _sfc_setup$1a = _sfc_main$1a.setup;
_sfc_main$1a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PropertyInputEntity.vue");
  return _sfc_setup$1a ? _sfc_setup$1a(props, ctx) : void 0;
};
const __nuxt_component_4$2 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1a, [["ssrRender", _sfc_ssrRender$1a], ["__scopeId", "data-v-121cffdf"]]), { __name: "PropertyInputEntity" });
const _sfc_main$19 = {
  components: {
    PropertyInputEntity: __nuxt_component_4$2,
    PropertyInputNumber: __nuxt_component_3$1,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    propertyName: stringProp().required,
    required: booleanProp().withDefault(false),
    hint: stringProp().optional,
    formstate: objectProp().optional
  },
  data() {
    const slotNumberUnit = entitiesSchema.slotNumber.$ref.replace("#/units/", "");
    return {
      schemaDefinitions,
      slotNumberSchema: unitsSchema[slotNumberUnit]
    };
  },
  computed: {
    entity() {
      const capabilitySchema = capabilityTypes[this.capability.type];
      if (!capabilitySchema) {
        return "";
      }
      const propertySchema = capabilitySchema.properties[this.propertyName];
      if (!propertySchema) {
        return "";
      }
      return (propertySchema.$ref || "").replace("definitions.json#/entities/", "");
    },
    entitySchema() {
      if (this.entity === "") {
        return null;
      }
      return entitiesSchema[this.entity];
    },
    propertyDataStepped: {
      get() {
        return this.capability.typeData[this.propertyName];
      },
      set(newData) {
        this.capability.typeData[this.propertyName] = newData;
      }
    },
    propertyDataStart: {
      get() {
        return this.capability.typeData[`${this.propertyName}Start`];
      },
      set(newData) {
        this.capability.typeData[`${this.propertyName}Start`] = newData;
      }
    },
    propertyDataEnd: {
      get() {
        return this.capability.typeData[`${this.propertyName}End`];
      },
      set(newData) {
        this.capability.typeData[`${this.propertyName}End`] = newData;
      }
    },
    hasStartEnd: {
      get() {
        if (this.propertyDataStepped === null && this.propertyDataStart === null) {
          throw new Error("Stepped and start value are both null. At least one of them should have a value, e.g. an empty string.");
        }
        return this.propertyDataStepped === null;
      },
      set(shouldHaveStartEnd) {
        if (shouldHaveStartEnd && !this.hasStartEnd) {
          const savedData = this.propertyDataStepped;
          this.propertyDataStepped = null;
          this.propertyDataStart = savedData;
          this.propertyDataEnd = savedData;
        } else if (!shouldHaveStartEnd && this.hasStartEnd) {
          const savedData = this.propertyDataStart;
          this.propertyDataStepped = savedData;
          this.propertyDataStart = null;
          this.propertyDataEnd = null;
        }
      }
    },
    // slotNumber entity requires a bit of special handling
    slotNumberStepped: {
      get() {
        return this.capability.typeData[this.propertyName];
      },
      set(newData) {
        this.capability.typeData[this.propertyName] = newData === null ? "" : newData;
      }
    },
    slotNumberStart: {
      get() {
        return this.capability.typeData[`${this.propertyName}Start`];
      },
      set(newData) {
        this.capability.typeData[`${this.propertyName}Start`] = newData === null ? "" : newData;
      }
    },
    slotNumberEnd: {
      get() {
        return this.capability.typeData[`${this.propertyName}End`];
      },
      set(newData) {
        this.capability.typeData[`${this.propertyName}End`] = newData === null ? "" : newData;
      }
    },
    swapButtonTabIndex() {
      return this.propertyDataStart === this.propertyDataEnd || this.propertyDataStart === "" || this.propertyDataEnd === "" ? "-1" : null;
    }
  },
  methods: {
    /** @public */
    focus() {
      for (const field of ["steppedField", "startField", "endField"]) {
        if (this.$refs[field]) {
          this.$refs[field].focus();
          return;
        }
      }
    },
    async focusEndField() {
      await this.$nextTick();
      if (this.hasStartEnd) {
        const focusField = this.propertyDataStart === "" ? this.$refs.startField : this.$refs.endField;
        focusField.focus();
      }
    },
    onUnitSelected(newUnit) {
      if (!this.propertyDataStart.endsWith(newUnit)) {
        this.$refs.startField.setUnitString(newUnit);
      }
      if (!this.propertyDataEnd.endsWith(newUnit)) {
        this.$refs.endField.setUnitString(newUnit);
      }
    },
    swapStartEnd() {
      [this.propertyDataStart, this.propertyDataEnd] = [this.propertyDataEnd, this.propertyDataStart];
    }
  }
};
function _sfc_ssrRender$19(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_PropertyInputNumber = __nuxt_component_3$1;
  const _component_PropertyInputEntity = __nuxt_component_4$2;
  const _component_PropertyInputText = PropertyInputText;
  const _component_OflSvg = __nuxt_component_1$1$1;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "proportional-capability-data" }, _attrs))} data-v-63b6c9d7>`);
  if ($options.hasStartEnd) {
    ssrRenderVNode(_push, createVNode(resolveDynamicComponent($props.formstate ? "Validate" : "span"), {
      state: $props.formstate,
      tag: $props.formstate ? "span" : null
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          ssrRenderVNode(_push2, createVNode(resolveDynamicComponent($props.formstate ? "Validate" : "label"), {
            state: $props.formstate,
            tag: $props.formstate ? "label" : null,
            class: "entity-input"
          }, {
            default: withCtx((_2, _push3, _parent3, _scopeId2) => {
              if (_push3) {
                if ($options.entity === `slotNumber`) {
                  _push3(ssrRenderComponent(_component_PropertyInputNumber, {
                    ref: "startField",
                    modelValue: $options.slotNumberStart,
                    "onUpdate:modelValue": ($event) => $options.slotNumberStart = $event,
                    name: `capability${$props.capability.uuid}-${$props.propertyName}Start`,
                    required: $props.required,
                    "schema-property": $data.slotNumberSchema,
                    "step-override": 0.5
                  }, null, _parent3, _scopeId2));
                } else if ($options.entitySchema) {
                  _push3(ssrRenderComponent(_component_PropertyInputEntity, {
                    ref: "startField",
                    modelValue: $options.propertyDataStart,
                    "onUpdate:modelValue": ($event) => $options.propertyDataStart = $event,
                    name: `capability${$props.capability.uuid}-${$props.propertyName}Start`,
                    required: $props.required,
                    "schema-property": $options.entitySchema,
                    "associated-entity": $options.propertyDataEnd,
                    onUnitSelected: ($event) => $options.onUnitSelected($event)
                  }, null, _parent3, _scopeId2));
                } else {
                  _push3(ssrRenderComponent(_component_PropertyInputText, {
                    ref: "startField",
                    modelValue: $options.propertyDataStart,
                    "onUpdate:modelValue": ($event) => $options.propertyDataStart = $event,
                    name: `capability${$props.capability.uuid}-${$props.propertyName}Start`,
                    required: $props.required,
                    "schema-property": $data.schemaDefinitions.nonEmptyString,
                    "valid-color-hex-list": $props.propertyName === `colorsHexString`,
                    hint: "start"
                  }, null, _parent3, _scopeId2));
                }
                _push3(`<span class="hint" data-v-63b6c9d7${_scopeId2}>${ssrInterpolate($props.hint || `value`)} at ${ssrInterpolate($props.capability.dmxRange && $props.capability.dmxRange[0] !== null ? `DMX value ${$props.capability.dmxRange[0]}` : `capability start`)}</span>`);
              } else {
                return [
                  $options.entity === `slotNumber` ? (openBlock(), createBlock(_component_PropertyInputNumber, {
                    key: 0,
                    ref: "startField",
                    modelValue: $options.slotNumberStart,
                    "onUpdate:modelValue": ($event) => $options.slotNumberStart = $event,
                    name: `capability${$props.capability.uuid}-${$props.propertyName}Start`,
                    required: $props.required,
                    "schema-property": $data.slotNumberSchema,
                    "step-override": 0.5
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "required", "schema-property"])) : $options.entitySchema ? (openBlock(), createBlock(_component_PropertyInputEntity, {
                    key: 1,
                    ref: "startField",
                    modelValue: $options.propertyDataStart,
                    "onUpdate:modelValue": ($event) => $options.propertyDataStart = $event,
                    name: `capability${$props.capability.uuid}-${$props.propertyName}Start`,
                    required: $props.required,
                    "schema-property": $options.entitySchema,
                    "associated-entity": $options.propertyDataEnd,
                    onUnitSelected: ($event) => $options.onUnitSelected($event)
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "required", "schema-property", "associated-entity", "onUnitSelected"])) : (openBlock(), createBlock(_component_PropertyInputText, {
                    key: 2,
                    ref: "startField",
                    modelValue: $options.propertyDataStart,
                    "onUpdate:modelValue": ($event) => $options.propertyDataStart = $event,
                    name: `capability${$props.capability.uuid}-${$props.propertyName}Start`,
                    required: $props.required,
                    "schema-property": $data.schemaDefinitions.nonEmptyString,
                    "valid-color-hex-list": $props.propertyName === `colorsHexString`,
                    hint: "start"
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "required", "schema-property", "valid-color-hex-list"])),
                  createVNode("span", { class: "hint" }, toDisplayString($props.hint || `value`) + " at " + toDisplayString($props.capability.dmxRange && $props.capability.dmxRange[0] !== null ? `DMX value ${$props.capability.dmxRange[0]}` : `capability start`), 1)
                ];
              }
            }),
            _: 1
          }), _parent2, _scopeId);
          _push2(`<span class="separator" data-v-63b6c9d7${_scopeId}><button${ssrRenderAttr("tabindex", $options.swapButtonTabIndex)} type="button" class="swap icon-button" title="Swap start and end values" data-v-63b6c9d7${_scopeId}>`);
          _push2(ssrRenderComponent(_component_OflSvg, { name: "swap-horizontal" }, null, _parent2, _scopeId));
          _push2(`</button> … </span>`);
          ssrRenderVNode(_push2, createVNode(resolveDynamicComponent($props.formstate ? "Validate" : "label"), {
            state: $props.formstate,
            tag: $props.formstate ? "label" : null,
            class: "entity-input"
          }, {
            default: withCtx((_2, _push3, _parent3, _scopeId2) => {
              if (_push3) {
                if ($options.entity === `slotNumber`) {
                  _push3(ssrRenderComponent(_component_PropertyInputNumber, {
                    ref: "endField",
                    modelValue: $options.slotNumberEnd,
                    "onUpdate:modelValue": ($event) => $options.slotNumberEnd = $event,
                    name: `capability${$props.capability.uuid}-${$props.propertyName}End`,
                    required: $props.required,
                    "schema-property": $data.slotNumberSchema,
                    "step-override": 0.5
                  }, null, _parent3, _scopeId2));
                } else if ($options.entitySchema) {
                  _push3(ssrRenderComponent(_component_PropertyInputEntity, {
                    ref: "endField",
                    modelValue: $options.propertyDataEnd,
                    "onUpdate:modelValue": ($event) => $options.propertyDataEnd = $event,
                    name: `capability${$props.capability.uuid}-${$props.propertyName}End`,
                    required: $props.required,
                    "schema-property": $options.entitySchema,
                    "associated-entity": $options.propertyDataStart,
                    onUnitSelected: ($event) => $options.onUnitSelected($event)
                  }, null, _parent3, _scopeId2));
                } else {
                  _push3(ssrRenderComponent(_component_PropertyInputText, {
                    ref: "endField",
                    modelValue: $options.propertyDataEnd,
                    "onUpdate:modelValue": ($event) => $options.propertyDataEnd = $event,
                    name: `capability${$props.capability.uuid}-${$props.propertyName}End`,
                    required: $props.required,
                    "schema-property": $data.schemaDefinitions.nonEmptyString,
                    "valid-color-hex-list": $props.propertyName === `colorsHexString`,
                    hint: "end"
                  }, null, _parent3, _scopeId2));
                }
                _push3(`<span class="hint" data-v-63b6c9d7${_scopeId2}>${ssrInterpolate($props.hint || `value`)} at ${ssrInterpolate($props.capability.dmxRange && $props.capability.dmxRange[1] !== null ? `DMX value ${$props.capability.dmxRange[1]}` : `capability end`)}</span>`);
              } else {
                return [
                  $options.entity === `slotNumber` ? (openBlock(), createBlock(_component_PropertyInputNumber, {
                    key: 0,
                    ref: "endField",
                    modelValue: $options.slotNumberEnd,
                    "onUpdate:modelValue": ($event) => $options.slotNumberEnd = $event,
                    name: `capability${$props.capability.uuid}-${$props.propertyName}End`,
                    required: $props.required,
                    "schema-property": $data.slotNumberSchema,
                    "step-override": 0.5
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "required", "schema-property"])) : $options.entitySchema ? (openBlock(), createBlock(_component_PropertyInputEntity, {
                    key: 1,
                    ref: "endField",
                    modelValue: $options.propertyDataEnd,
                    "onUpdate:modelValue": ($event) => $options.propertyDataEnd = $event,
                    name: `capability${$props.capability.uuid}-${$props.propertyName}End`,
                    required: $props.required,
                    "schema-property": $options.entitySchema,
                    "associated-entity": $options.propertyDataStart,
                    onUnitSelected: ($event) => $options.onUnitSelected($event)
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "required", "schema-property", "associated-entity", "onUnitSelected"])) : (openBlock(), createBlock(_component_PropertyInputText, {
                    key: 2,
                    ref: "endField",
                    modelValue: $options.propertyDataEnd,
                    "onUpdate:modelValue": ($event) => $options.propertyDataEnd = $event,
                    name: `capability${$props.capability.uuid}-${$props.propertyName}End`,
                    required: $props.required,
                    "schema-property": $data.schemaDefinitions.nonEmptyString,
                    "valid-color-hex-list": $props.propertyName === `colorsHexString`,
                    hint: "end"
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "required", "schema-property", "valid-color-hex-list"])),
                  createVNode("span", { class: "hint" }, toDisplayString($props.hint || `value`) + " at " + toDisplayString($props.capability.dmxRange && $props.capability.dmxRange[1] !== null ? `DMX value ${$props.capability.dmxRange[1]}` : `capability end`), 1)
                ];
              }
            }),
            _: 1
          }), _parent2, _scopeId);
        } else {
          return [
            (openBlock(), createBlock(resolveDynamicComponent($props.formstate ? "Validate" : "label"), {
              state: $props.formstate,
              tag: $props.formstate ? "label" : null,
              class: "entity-input"
            }, {
              default: withCtx(() => [
                $options.entity === `slotNumber` ? (openBlock(), createBlock(_component_PropertyInputNumber, {
                  key: 0,
                  ref: "startField",
                  modelValue: $options.slotNumberStart,
                  "onUpdate:modelValue": ($event) => $options.slotNumberStart = $event,
                  name: `capability${$props.capability.uuid}-${$props.propertyName}Start`,
                  required: $props.required,
                  "schema-property": $data.slotNumberSchema,
                  "step-override": 0.5
                }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "required", "schema-property"])) : $options.entitySchema ? (openBlock(), createBlock(_component_PropertyInputEntity, {
                  key: 1,
                  ref: "startField",
                  modelValue: $options.propertyDataStart,
                  "onUpdate:modelValue": ($event) => $options.propertyDataStart = $event,
                  name: `capability${$props.capability.uuid}-${$props.propertyName}Start`,
                  required: $props.required,
                  "schema-property": $options.entitySchema,
                  "associated-entity": $options.propertyDataEnd,
                  onUnitSelected: ($event) => $options.onUnitSelected($event)
                }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "required", "schema-property", "associated-entity", "onUnitSelected"])) : (openBlock(), createBlock(_component_PropertyInputText, {
                  key: 2,
                  ref: "startField",
                  modelValue: $options.propertyDataStart,
                  "onUpdate:modelValue": ($event) => $options.propertyDataStart = $event,
                  name: `capability${$props.capability.uuid}-${$props.propertyName}Start`,
                  required: $props.required,
                  "schema-property": $data.schemaDefinitions.nonEmptyString,
                  "valid-color-hex-list": $props.propertyName === `colorsHexString`,
                  hint: "start"
                }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "required", "schema-property", "valid-color-hex-list"])),
                createVNode("span", { class: "hint" }, toDisplayString($props.hint || `value`) + " at " + toDisplayString($props.capability.dmxRange && $props.capability.dmxRange[0] !== null ? `DMX value ${$props.capability.dmxRange[0]}` : `capability start`), 1)
              ]),
              _: 1
            }, 8, ["state", "tag"])),
            createVNode("span", { class: "separator" }, [
              createVNode("button", {
                tabindex: $options.swapButtonTabIndex,
                type: "button",
                class: "swap icon-button",
                title: "Swap start and end values",
                onClick: withModifiers(($event) => $options.swapStartEnd(), ["prevent"])
              }, [
                createVNode(_component_OflSvg, { name: "swap-horizontal" })
              ], 8, ["tabindex", "onClick"]),
              createTextVNode(" … ")
            ]),
            (openBlock(), createBlock(resolveDynamicComponent($props.formstate ? "Validate" : "label"), {
              state: $props.formstate,
              tag: $props.formstate ? "label" : null,
              class: "entity-input"
            }, {
              default: withCtx(() => [
                $options.entity === `slotNumber` ? (openBlock(), createBlock(_component_PropertyInputNumber, {
                  key: 0,
                  ref: "endField",
                  modelValue: $options.slotNumberEnd,
                  "onUpdate:modelValue": ($event) => $options.slotNumberEnd = $event,
                  name: `capability${$props.capability.uuid}-${$props.propertyName}End`,
                  required: $props.required,
                  "schema-property": $data.slotNumberSchema,
                  "step-override": 0.5
                }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "required", "schema-property"])) : $options.entitySchema ? (openBlock(), createBlock(_component_PropertyInputEntity, {
                  key: 1,
                  ref: "endField",
                  modelValue: $options.propertyDataEnd,
                  "onUpdate:modelValue": ($event) => $options.propertyDataEnd = $event,
                  name: `capability${$props.capability.uuid}-${$props.propertyName}End`,
                  required: $props.required,
                  "schema-property": $options.entitySchema,
                  "associated-entity": $options.propertyDataStart,
                  onUnitSelected: ($event) => $options.onUnitSelected($event)
                }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "required", "schema-property", "associated-entity", "onUnitSelected"])) : (openBlock(), createBlock(_component_PropertyInputText, {
                  key: 2,
                  ref: "endField",
                  modelValue: $options.propertyDataEnd,
                  "onUpdate:modelValue": ($event) => $options.propertyDataEnd = $event,
                  name: `capability${$props.capability.uuid}-${$props.propertyName}End`,
                  required: $props.required,
                  "schema-property": $data.schemaDefinitions.nonEmptyString,
                  "valid-color-hex-list": $props.propertyName === `colorsHexString`,
                  hint: "end"
                }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "required", "schema-property", "valid-color-hex-list"])),
                createVNode("span", { class: "hint" }, toDisplayString($props.hint || `value`) + " at " + toDisplayString($props.capability.dmxRange && $props.capability.dmxRange[1] !== null ? `DMX value ${$props.capability.dmxRange[1]}` : `capability end`), 1)
              ]),
              _: 1
            }, 8, ["state", "tag"]))
          ];
        }
      }),
      _: 1
    }), _parent);
  } else {
    _push(`<!--[-->`);
    if ($options.entity === `slotNumber`) {
      _push(ssrRenderComponent(_component_PropertyInputNumber, {
        ref: "steppedField",
        modelValue: $options.slotNumberStepped,
        "onUpdate:modelValue": ($event) => $options.slotNumberStepped = $event,
        name: `capability${$props.capability.uuid}-${$props.propertyName}`,
        required: $props.required,
        "schema-property": $data.slotNumberSchema,
        "step-override": 0.5
      }, null, _parent));
    } else if ($options.entitySchema) {
      _push(ssrRenderComponent(_component_PropertyInputEntity, {
        ref: "steppedField",
        modelValue: $options.propertyDataStepped,
        "onUpdate:modelValue": ($event) => $options.propertyDataStepped = $event,
        name: `capability${$props.capability.uuid}-${$props.propertyName}`,
        required: $props.required,
        "schema-property": $options.entitySchema
      }, null, _parent));
    } else {
      _push(ssrRenderComponent(_component_PropertyInputText, {
        ref: "steppedField",
        modelValue: $options.propertyDataStepped,
        "onUpdate:modelValue": ($event) => $options.propertyDataStepped = $event,
        name: `capability${$props.capability.uuid}-${$props.propertyName}`,
        required: $props.required,
        "schema-property": $data.schemaDefinitions.nonEmptyString,
        "valid-color-hex-list": $props.propertyName === `colorsHexString`
      }, null, _parent));
    }
    if ($props.hint) {
      _push(`<span class="hint" data-v-63b6c9d7>${ssrInterpolate($props.hint)}</span>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<!--]-->`);
  }
  _push(`<section data-v-63b6c9d7><label data-v-63b6c9d7><input${ssrIncludeBooleanAttr(Array.isArray($options.hasStartEnd) ? ssrLooseContain($options.hasStartEnd, null) : $options.hasStartEnd) ? " checked" : ""} type="checkbox" data-v-63b6c9d7> Specify range instead of a single value </label></section></div>`);
}
const _sfc_setup$19 = _sfc_main$19.setup;
_sfc_main$19.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/EditorProportionalPropertySwitcher.vue");
  return _sfc_setup$19 ? _sfc_setup$19(props, ctx) : void 0;
};
const __nuxt_component_1$1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$19, [["ssrRender", _sfc_ssrRender$19], ["__scopeId", "data-v-63b6c9d7"]]), { __name: "EditorProportionalPropertySwitcher" });
const _sfc_main$18 = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        angle: null,
        angleStart: "narrow",
        angleEnd: "wide",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$18(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-angle`,
    label: "Angle"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "angle"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "angle"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$18 = _sfc_main$18.setup;
_sfc_main$18.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityBeamAngle.vue");
  return _sfc_setup$18 ? _sfc_setup$18(props, ctx) : void 0;
};
const CapabilityBeamAngle = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$18, [["ssrRender", _sfc_ssrRender$18]]), { __name: "EditorCapabilitiesCapabilityBeamAngle" });
const _sfc_main$17 = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      hint: "Only move the beam and not a visible physical part of the fixture. This is especially useful for lasers. Use Pan/Tilt for moving heads.",
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        horizontalAngle: null,
        horizontalAngleStart: "",
        horizontalAngleEnd: "",
        verticalAngle: null,
        verticalAngleStart: "",
        verticalAngleEnd: "",
        comment: ""
      }
    };
  },
  methods: {
    isPropertyEmpty(property) {
      const typeData = this.capability.typeData;
      const isSteppedEmpty = typeData[property] === null || typeData[property] === "";
      const isProportionalEmpty = typeData[`${property}Start`] === null || typeData[`${property}Start`] === "";
      return isSteppedEmpty && isProportionalEmpty;
    }
  }
};
function _sfc_ssrRender$17(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-horizontalAngle`,
    label: "Horizontal angle"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: $options.isPropertyEmpty(`verticalAngle`),
          "property-name": "horizontalAngle"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: $options.isPropertyEmpty(`verticalAngle`),
            "property-name": "horizontalAngle"
          }, null, 8, ["capability", "formstate", "required"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-verticalAngle`,
    label: "Vertical angle"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: $options.isPropertyEmpty(`horizontalAngle`),
          "property-name": "verticalAngle"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: $options.isPropertyEmpty(`horizontalAngle`),
            "property-name": "verticalAngle"
          }, null, 8, ["capability", "formstate", "required"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$17 = _sfc_main$17.setup;
_sfc_main$17.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityBeamPosition.vue");
  return _sfc_setup$17 ? _sfc_setup$17(props, ctx) : void 0;
};
const CapabilityBeamPosition = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$17, [["ssrRender", _sfc_ssrRender$17]]), { __name: "EditorCapabilitiesCapabilityBeamPosition" });
const _sfc_main$16 = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputEntity: __nuxt_component_4$2,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      bladeSchema: capabilityTypes.BladeInsertion.properties.blade,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        blade: "",
        insertion: null,
        insertionStart: "out",
        insertionEnd: "in",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$16(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_PropertyInputEntity = __nuxt_component_4$2;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-blade`,
    label: "Blade"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputEntity, {
          modelValue: $props.capability.typeData.blade,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.blade = $event,
          name: `capability${$props.capability.uuid}-blade`,
          "schema-property": $data.bladeSchema,
          required: ""
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputEntity, {
            modelValue: $props.capability.typeData.blade,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.blade = $event,
            name: `capability${$props.capability.uuid}-blade`,
            "schema-property": $data.bladeSchema,
            required: ""
          }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-insertion`,
    label: "Insertion"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "insertion"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "insertion"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$16 = _sfc_main$16.setup;
_sfc_main$16.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityBladeInsertion.vue");
  return _sfc_setup$16 ? _sfc_setup$16(props, ctx) : void 0;
};
const CapabilityBladeInsertion = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$16, [["ssrRender", _sfc_ssrRender$16]]), { __name: "EditorCapabilitiesCapabilityBladeInsertion" });
const _sfc_main$15 = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputEntity: __nuxt_component_4$2,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      bladeSchema: capabilityTypes.BladeInsertion.properties.blade,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        blade: "",
        angle: null,
        angleStart: "0deg",
        angleEnd: "360deg",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$15(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_PropertyInputEntity = __nuxt_component_4$2;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-blade`,
    label: "Blade"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputEntity, {
          modelValue: $props.capability.typeData.blade,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.blade = $event,
          name: `capability${$props.capability.uuid}-blade`,
          "schema-property": $data.bladeSchema,
          required: ""
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputEntity, {
            modelValue: $props.capability.typeData.blade,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.blade = $event,
            name: `capability${$props.capability.uuid}-blade`,
            "schema-property": $data.bladeSchema,
            required: ""
          }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-angle`,
    label: "Angle"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "angle"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "angle"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$15 = _sfc_main$15.setup;
_sfc_main$15.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityBladeRotation.vue");
  return _sfc_setup$15 ? _sfc_setup$15(props, ctx) : void 0;
};
const CapabilityBladeRotation = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$15, [["ssrRender", _sfc_ssrRender$15]]), { __name: "EditorCapabilitiesCapabilityBladeRotation" });
const _sfc_main$14 = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        angle: null,
        angleStart: "0deg",
        angleEnd: "360deg",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$14(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-angle`,
    label: "Angle"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "angle"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "angle"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$14 = _sfc_main$14.setup;
_sfc_main$14.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityBladeSystemRotation.vue");
  return _sfc_setup$14 ? _sfc_setup$14(props, ctx) : void 0;
};
const CapabilityBladeSystemRotation = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$14, [["ssrRender", _sfc_ssrRender$14]]), { __name: "EditorCapabilitiesCapabilityBladeSystemRotation" });
const _sfc_main$13 = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      colors: capabilityTypes.ColorIntensity.properties.color.enum,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        color: "",
        brightness: null,
        brightnessStart: "off",
        brightnessEnd: "bright",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$13(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-color`,
    label: "Color"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<select class="${ssrRenderClass({ empty: $props.capability.typeData.color === `` })}"${ssrRenderAttr("name", `capability${$props.capability.uuid}-color`)} required${_scopeId}><option value="" disabled${ssrIncludeBooleanAttr(Array.isArray($props.capability.typeData.color) ? ssrLooseContain($props.capability.typeData.color, "") : ssrLooseEqual($props.capability.typeData.color, "")) ? " selected" : ""}${_scopeId}>Please select a color</option><!--[-->`);
        ssrRenderList($data.colors, (color) => {
          _push2(`<option${ssrRenderAttr("value", color)}${ssrIncludeBooleanAttr(Array.isArray($props.capability.typeData.color) ? ssrLooseContain($props.capability.typeData.color, color) : ssrLooseEqual($props.capability.typeData.color, color)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(color)}</option>`);
        });
        _push2(`<!--]--></select>`);
      } else {
        return [
          withDirectives(createVNode("select", {
            "onUpdate:modelValue": ($event) => $props.capability.typeData.color = $event,
            class: { empty: $props.capability.typeData.color === `` },
            name: `capability${$props.capability.uuid}-color`,
            required: ""
          }, [
            createVNode("option", {
              value: "",
              disabled: ""
            }, "Please select a color"),
            (openBlock(true), createBlock(Fragment, null, renderList($data.colors, (color) => {
              return openBlock(), createBlock("option", {
                key: color,
                value: color
              }, toDisplayString(color), 9, ["value"]);
            }), 128))
          ], 10, ["onUpdate:modelValue", "name"]), [
            [vModelSelect, $props.capability.typeData.color]
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-brightness`,
    label: "Brightness"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "brightness"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "brightness"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$13 = _sfc_main$13.setup;
_sfc_main$13.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityColorIntensity.vue");
  return _sfc_setup$13 ? _sfc_setup$13(props, ctx) : void 0;
};
const CapabilityColorIntensity = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$13, [["ssrRender", _sfc_ssrRender$13]]), { __name: "EditorCapabilitiesCapabilityColorIntensity" });
const _sfc_main$12 = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      hint: "This capability enables a static predefined RGB/CMY color. Use WheelSlot for color wheel filters.",
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        comment: "",
        colors: null,
        colorsStart: null,
        colorsEnd: null,
        colorsHexString: "",
        colorsHexStringStart: null,
        colorsHexStringEnd: null,
        colorTemperature: "",
        colorTemperatureStart: null,
        colorTemperatureEnd: null
      },
      colorPreview: null,
      colorPreviewStart: null,
      colorPreviewEnd: null
    };
  },
  watch: {
    "capability.typeData.colorsHexString": {
      handler(hexString) {
        this.capability.typeData.colors = colorsHexStringToArray(hexString);
        this.colorPreview = this.capability.typeData.colors;
      },
      immediate: true
    },
    "capability.typeData.colorsHexStringStart": {
      handler(hexString) {
        this.capability.typeData.colorsStart = colorsHexStringToArray(hexString);
        this.colorPreviewStart = this.capability.typeData.colorsStart;
      },
      immediate: true
    },
    "capability.typeData.colorsHexStringEnd": {
      handler(hexString) {
        this.capability.typeData.colorsEnd = colorsHexStringToArray(hexString);
        this.colorPreviewEnd = this.capability.typeData.colorsEnd;
      },
      immediate: true
    }
  }
};
function _sfc_ssrRender$12(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_PropertyInputText = PropertyInputText;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_OflSvg = __nuxt_component_1$1$1;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Color preset name"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    "multiple-inputs": "",
    label: "Color hex code(s)"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          "property-name": "colorsHexString",
          hint: "comma-separated list of #rrggbb hex codes"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": "colorsHexString",
            hint: "comma-separated list of #rrggbb hex codes"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  if ($data.colorPreview !== null) {
    _push(ssrRenderComponent(_component_LabeledInput, {
      key: "color-preview",
      formstate: $props.formstate,
      name: `capability${$props.capability.uuid}-colorsHexString`,
      label: "Color preview"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<!--[-->`);
          ssrRenderList($data.colorPreview, (color) => {
            _push2(ssrRenderComponent(_component_OflSvg, {
              key: color,
              colors: [color],
              type: "color-circle"
            }, null, _parent2, _scopeId));
          });
          _push2(`<!--]-->`);
        } else {
          return [
            (openBlock(true), createBlock(Fragment, null, renderList($data.colorPreview, (color) => {
              return openBlock(), createBlock(_component_OflSvg, {
                key: color,
                colors: [color],
                type: "color-circle"
              }, null, 8, ["colors"]);
            }), 128))
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(`<!---->`);
  }
  if ($data.colorPreviewStart !== null || $data.colorPreviewEnd !== null) {
    _push(ssrRenderComponent(_component_LabeledInput, {
      key: "color-preview-start-end",
      formstate: $props.formstate,
      name: `capability${$props.capability.uuid}-colorsHexString`,
      label: "Color preview"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<!--[-->`);
          ssrRenderList($data.colorPreviewStart || [], (color) => {
            _push2(ssrRenderComponent(_component_OflSvg, {
              key: color,
              colors: [color],
              type: "color-circle"
            }, null, _parent2, _scopeId));
          });
          _push2(`<!--]--> … <!--[-->`);
          ssrRenderList($data.colorPreviewEnd || [], (color) => {
            _push2(ssrRenderComponent(_component_OflSvg, {
              key: color,
              colors: [color],
              type: "color-circle"
            }, null, _parent2, _scopeId));
          });
          _push2(`<!--]-->`);
        } else {
          return [
            (openBlock(true), createBlock(Fragment, null, renderList($data.colorPreviewStart || [], (color) => {
              return openBlock(), createBlock(_component_OflSvg, {
                key: color,
                colors: [color],
                type: "color-circle"
              }, null, 8, ["colors"]);
            }), 128)),
            createTextVNode(" … "),
            (openBlock(true), createBlock(Fragment, null, renderList($data.colorPreviewEnd || [], (color) => {
              return openBlock(), createBlock(_component_OflSvg, {
                key: color,
                colors: [color],
                type: "color-circle"
              }, null, 8, ["colors"]);
            }), 128))
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-colorTemperature`,
    label: "Color temperature"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          "property-name": "colorTemperature"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": "colorTemperature"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$12 = _sfc_main$12.setup;
_sfc_main$12.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityColorPreset.vue");
  return _sfc_setup$12 ? _sfc_setup$12(props, ctx) : void 0;
};
const CapabilityColorPreset = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$12, [["ssrRender", _sfc_ssrRender$12]]), { __name: "EditorCapabilitiesCapabilityColorPreset" });
const _sfc_main$11 = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        colorTemperature: null,
        colorTemperatureStart: "",
        colorTemperatureEnd: "",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$11(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-colorTemperature`,
    label: "Color temperature"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "colorTemperature"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "colorTemperature"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$11 = _sfc_main$11.setup;
_sfc_main$11.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityColorTemperature.vue");
  return _sfc_setup$11 ? _sfc_setup$11(props, ctx) : void 0;
};
const CapabilityColorTemperature = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$11, [["ssrRender", _sfc_ssrRender$11]]), { __name: "EditorCapabilitiesCapabilityColorTemperature" });
const _sfc_main$10 = {
  props: {
    required: booleanProp().withDefault(false),
    modelValue: booleanProp().withDefault(false),
    name: stringProp().required,
    label: stringProp().required
  },
  emits: {
    "update:modelValue": (value) => true
  },
  computed: {
    localValue: {
      get() {
        return this.modelValue;
      },
      set(newValue) {
        this.$emit("update:modelValue", newValue ? true : null);
      }
    }
  },
  methods: {
    /** @public */
    focus() {
      this.$refs.input.focus();
    }
  }
};
function _sfc_ssrRender$10(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<span${ssrRenderAttrs(_attrs)}><input${ssrIncludeBooleanAttr(Array.isArray($options.localValue) ? ssrLooseContain($options.localValue, null) : $options.localValue) ? " checked" : ""} type="checkbox"${ssrIncludeBooleanAttr($props.required) ? " required" : ""}${ssrRenderAttr("name", $props.name)}> ${ssrInterpolate($props.label)}</span>`);
}
const _sfc_setup$10 = _sfc_main$10.setup;
_sfc_main$10.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PropertyInputBoolean.vue");
  return _sfc_setup$10 ? _sfc_setup$10(props, ctx) : void 0;
};
const __nuxt_component_8 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$10, [["ssrRender", _sfc_ssrRender$10]]), { __name: "PropertyInputBoolean" });
const _sfc_main$$ = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputBoolean: __nuxt_component_8,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      effectPresets: schemaDefinitions.effectPreset.enum,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        effectNameOrPreset: "effectName",
        effectName: "",
        effectPreset: "",
        speed: "",
        speedStart: null,
        speedEnd: null,
        duration: "",
        durationStart: null,
        durationEnd: null,
        parameter: "",
        parameterStart: null,
        parameterEnd: null,
        soundControlled: null,
        soundSensitivity: "",
        soundSensitivityStart: null,
        soundSensitivityEnd: null,
        comment: ""
      }
    };
  },
  computed: {
    /**
     * Called from {@link EditorCapabilityTypeData}
     * @public
     * @returns {string[]} Array of all props to reset to default data when capability is saved.
     */
    resetProperties() {
      const resetProperties = [this.capability.typeData.effectNameOrPreset === "effectName" ? "effectPreset" : "effectName"];
      if (!this.capability.typeData.soundControlled) {
        resetProperties.push("soundSensitivity", "soundSensitivityStart", "soundSensitivityEnd");
      }
      return resetProperties;
    }
  },
  methods: {
    async changeEffectNameOrPreset(newValue) {
      this.capability.typeData.effectNameOrPreset = newValue;
      await this.$nextTick();
      this.$refs.effectNameOrPresetInput.focus();
    }
  }
};
function _sfc_ssrRender$$(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_PropertyInputText = PropertyInputText;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputBoolean = __nuxt_component_8;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-${$props.capability.typeData.effectNameOrPreset}`
  }, {
    label: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        if ($props.capability.typeData.effectNameOrPreset === `effectName`) {
          _push2(`<!--[--> Effect name / <a href="#effectPreset" class="button secondary inline" title="Choose effect preset instead of entering effect name manually"${_scopeId}>preset</a><!--]-->`);
        } else {
          _push2(`<!--[--> Effect preset / <a href="#effectName" class="button secondary inline" title="Specify effect name manually instead of choosing effect preset"${_scopeId}>name</a><!--]-->`);
        }
      } else {
        return [
          $props.capability.typeData.effectNameOrPreset === `effectName` ? (openBlock(), createBlock(Fragment, { key: 0 }, [
            createTextVNode(" Effect name / "),
            createVNode("a", {
              href: "#effectPreset",
              class: "button secondary inline",
              title: "Choose effect preset instead of entering effect name manually",
              onClick: withModifiers(($event) => $options.changeEffectNameOrPreset(`effectPreset`), ["prevent"])
            }, "preset", 8, ["onClick"])
          ], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
            createTextVNode(" Effect preset / "),
            createVNode("a", {
              href: "#effectName",
              class: "button secondary inline",
              title: "Specify effect name manually instead of choosing effect preset",
              onClick: withModifiers(($event) => $options.changeEffectNameOrPreset(`effectName`), ["prevent"])
            }, "name", 8, ["onClick"])
          ], 64))
        ];
      }
    }),
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        if ($props.capability.typeData.effectNameOrPreset === `effectName`) {
          _push2(ssrRenderComponent(_component_PropertyInputText, {
            ref: "effectNameOrPresetInput",
            modelValue: $props.capability.typeData.effectName,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.effectName = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-effectName`,
            "schema-property": $data.schemaDefinitions.nonEmptyString,
            required: ""
          }, null, _parent2, _scopeId));
        } else {
          _push2(`<select class="${ssrRenderClass({ empty: $props.capability.typeData.effectPreset === `` })}"${ssrRenderAttr("name", `capability${$props.capability.uuid}-effectPreset`)} required${_scopeId}><option value="" disabled${ssrIncludeBooleanAttr(Array.isArray($props.capability.typeData.effectPreset) ? ssrLooseContain($props.capability.typeData.effectPreset, "") : ssrLooseEqual($props.capability.typeData.effectPreset, "")) ? " selected" : ""}${_scopeId}>Please select an effect preset</option><!--[-->`);
          ssrRenderList($data.effectPresets, (effect) => {
            _push2(`<option${ssrRenderAttr("value", effect)}${ssrIncludeBooleanAttr(Array.isArray($props.capability.typeData.effectPreset) ? ssrLooseContain($props.capability.typeData.effectPreset, effect) : ssrLooseEqual($props.capability.typeData.effectPreset, effect)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(effect)}</option>`);
          });
          _push2(`<!--]--></select>`);
        }
      } else {
        return [
          $props.capability.typeData.effectNameOrPreset === `effectName` ? (openBlock(), createBlock(_component_PropertyInputText, {
            key: 0,
            ref: "effectNameOrPresetInput",
            modelValue: $props.capability.typeData.effectName,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.effectName = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-effectName`,
            "schema-property": $data.schemaDefinitions.nonEmptyString,
            required: ""
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])) : withDirectives((openBlock(), createBlock("select", {
            key: 1,
            ref: "effectNameOrPresetInput",
            "onUpdate:modelValue": ($event) => $props.capability.typeData.effectPreset = $event,
            class: { empty: $props.capability.typeData.effectPreset === `` },
            name: `capability${$props.capability.uuid}-effectPreset`,
            required: ""
          }, [
            createVNode("option", {
              value: "",
              disabled: ""
            }, "Please select an effect preset"),
            (openBlock(true), createBlock(Fragment, null, renderList($data.effectPresets, (effect) => {
              return openBlock(), createBlock("option", {
                key: effect,
                value: effect
              }, toDisplayString(effect), 9, ["value"]);
            }), 128))
          ], 10, ["onUpdate:modelValue", "name"])), [
            [vModelSelect, $props.capability.typeData.effectPreset]
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-speed`,
    label: "Speed"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          "property-name": "speed"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": "speed"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-duration`,
    label: "Duration"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          "property-name": "duration"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": "duration"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-parameter`,
    label: "Parameter"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          "property-name": "parameter"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": "parameter"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-soundControlled`,
    label: "Sound-controlled?"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputBoolean, {
          modelValue: $props.capability.typeData.soundControlled,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.soundControlled = $event,
          name: `capability${$props.capability.uuid}-soundControlled`,
          label: "Effect is sound-controlled"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputBoolean, {
            modelValue: $props.capability.typeData.soundControlled,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.soundControlled = $event,
            name: `capability${$props.capability.uuid}-soundControlled`,
            label: "Effect is sound-controlled"
          }, null, 8, ["modelValue", "onUpdate:modelValue", "name"])
        ];
      }
    }),
    _: 1
  }, _parent));
  if ($props.capability.typeData.soundControlled) {
    _push(ssrRenderComponent(_component_LabeledInput, {
      formstate: $props.formstate,
      "multiple-inputs": "",
      name: `capability${$props.capability.uuid}-soundSensitivity`,
      label: "Sound sensitivity"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": "soundSensitivity"
          }, null, _parent2, _scopeId));
        } else {
          return [
            createVNode(_component_EditorProportionalPropertySwitcher, {
              capability: $props.capability,
              formstate: $props.formstate,
              "property-name": "soundSensitivity"
            }, null, 8, ["capability", "formstate"])
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$$ = _sfc_main$$.setup;
_sfc_main$$.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityEffect.vue");
  return _sfc_setup$$ ? _sfc_setup$$(props, ctx) : void 0;
};
const CapabilityEffect = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$$, [["ssrRender", _sfc_ssrRender$$]]), { __name: "EditorCapabilitiesCapabilityEffect" });
const _sfc_main$_ = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      hint: "Doesn't activate an effect, only controls the duration of running effects.",
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        duration: null,
        durationStart: "short",
        durationEnd: "long",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$_(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-duration`,
    label: "Duration"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "duration"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "duration"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$_ = _sfc_main$_.setup;
_sfc_main$_.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityEffectDuration.vue");
  return _sfc_setup$_ ? _sfc_setup$_(props, ctx) : void 0;
};
const CapabilityEffectDuration = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$_, [["ssrRender", _sfc_ssrRender$_]]), { __name: "EditorCapabilitiesCapabilityEffectDuration" });
const _sfc_main$Z = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      hint: "Doesn't activate an effect, only controls a generic parameter of running effects.",
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        parameter: null,
        parameterStart: "low",
        parameterEnd: "high",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$Z(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-parameter`,
    label: "Parameter"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "parameter"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "parameter"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$Z = _sfc_main$Z.setup;
_sfc_main$Z.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityEffectParameter.vue");
  return _sfc_setup$Z ? _sfc_setup$Z(props, ctx) : void 0;
};
const CapabilityEffectParameter = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$Z, [["ssrRender", _sfc_ssrRender$Z]]), { __name: "EditorCapabilitiesCapabilityEffectParameter" });
const _sfc_main$Y = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      hint: "Doesn't activate an effect, only controls the speed of running effects.",
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        speed: null,
        speedStart: "slow",
        speedEnd: "fast",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$Y(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-speed`,
    label: "Speed"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "speed"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "speed"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$Y = _sfc_main$Y.setup;
_sfc_main$Y.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityEffectSpeed.vue");
  return _sfc_setup$Y ? _sfc_setup$Y(props, ctx) : void 0;
};
const CapabilityEffectSpeed = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$Y, [["ssrRender", _sfc_ssrRender$Y]]), { __name: "EditorCapabilitiesCapabilityEffectSpeed" });
const _sfc_main$X = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        distance: null,
        distanceStart: "near",
        distanceEnd: "far",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$X(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-distance`,
    label: "Distance"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "distance"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "distance"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$X = _sfc_main$X.setup;
_sfc_main$X.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityFocus.vue");
  return _sfc_setup$X ? _sfc_setup$X(props, ctx) : void 0;
};
const CapabilityFocus = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$X, [["ssrRender", _sfc_ssrRender$X]]), { __name: "EditorCapabilitiesCapabilityFocus" });
const _sfc_main$W = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      fogTypes: capabilityTypes.Fog.properties.fogType.enum,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        fogType: "",
        fogOutput: "",
        fogOutputStart: null,
        fogOutputEnd: null,
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$W(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-fogType`,
    label: "Fog type"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<select class="${ssrRenderClass({ empty: $props.capability.typeData.fogType === `` })}"${ssrRenderAttr("name", `capability${$props.capability.uuid}-fogType`)} required${_scopeId}><option value="" disabled${ssrIncludeBooleanAttr(Array.isArray($props.capability.typeData.fogType) ? ssrLooseContain($props.capability.typeData.fogType, "") : ssrLooseEqual($props.capability.typeData.fogType, "")) ? " selected" : ""}${_scopeId}>Please select a fog type</option><!--[-->`);
        ssrRenderList($data.fogTypes, (fogType) => {
          _push2(`<option${ssrRenderAttr("value", fogType)}${ssrIncludeBooleanAttr(Array.isArray($props.capability.typeData.fogType) ? ssrLooseContain($props.capability.typeData.fogType, fogType) : ssrLooseEqual($props.capability.typeData.fogType, fogType)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(fogType)}</option>`);
        });
        _push2(`<!--]--></select>`);
      } else {
        return [
          withDirectives(createVNode("select", {
            "onUpdate:modelValue": ($event) => $props.capability.typeData.fogType = $event,
            class: { empty: $props.capability.typeData.fogType === `` },
            name: `capability${$props.capability.uuid}-fogType`,
            required: ""
          }, [
            createVNode("option", {
              value: "",
              disabled: ""
            }, "Please select a fog type"),
            (openBlock(true), createBlock(Fragment, null, renderList($data.fogTypes, (fogType) => {
              return openBlock(), createBlock("option", {
                key: fogType,
                value: fogType
              }, toDisplayString(fogType), 9, ["value"]);
            }), 128))
          ], 10, ["onUpdate:modelValue", "name"]), [
            [vModelSelect, $props.capability.typeData.fogType]
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-fogOutput`,
    label: "Fog output"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          "property-name": "fogOutput"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": "fogOutput"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$W = _sfc_main$W.setup;
_sfc_main$W.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityFog.vue");
  return _sfc_setup$W ? _sfc_setup$W(props, ctx) : void 0;
};
const CapabilityFog = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$W, [["ssrRender", _sfc_ssrRender$W]]), { __name: "EditorCapabilitiesCapabilityFog" });
const _sfc_main$V = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      hint: "Doesn't activate fog, only controls the intensity of the fog output.",
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        fogOutput: null,
        fogOutputStart: "weak",
        fogOutputEnd: "strong",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$V(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-fogOutput`,
    label: "Fog output"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "fogOutput"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "fogOutput"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$V = _sfc_main$V.setup;
_sfc_main$V.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityFogOutput.vue");
  return _sfc_setup$V ? _sfc_setup$V(props, ctx) : void 0;
};
const CapabilityFogOutput = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$V, [["ssrRender", _sfc_ssrRender$V]]), { __name: "EditorCapabilitiesCapabilityFogOutput" });
const _sfc_main$U = {
  components: {
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      fogTypes: capabilityTypes.Fog.properties.fogType.enum,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      hint: "Doesn't activate fog, only selects the fog type (Fog or Haze).",
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        fogType: "",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$U(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-fogType`,
    label: "Fog type"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<select class="${ssrRenderClass({ empty: $props.capability.typeData.fogType === `` })}"${ssrRenderAttr("name", `capability${$props.capability.uuid}-fogType`)} required${_scopeId}><option value="" disabled${ssrIncludeBooleanAttr(Array.isArray($props.capability.typeData.fogType) ? ssrLooseContain($props.capability.typeData.fogType, "") : ssrLooseEqual($props.capability.typeData.fogType, "")) ? " selected" : ""}${_scopeId}>Please select a fog type</option><!--[-->`);
        ssrRenderList($data.fogTypes, (fogType) => {
          _push2(`<option${ssrRenderAttr("value", fogType)}${ssrIncludeBooleanAttr(Array.isArray($props.capability.typeData.fogType) ? ssrLooseContain($props.capability.typeData.fogType, fogType) : ssrLooseEqual($props.capability.typeData.fogType, fogType)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(fogType)}</option>`);
        });
        _push2(`<!--]--></select>`);
      } else {
        return [
          withDirectives(createVNode("select", {
            "onUpdate:modelValue": ($event) => $props.capability.typeData.fogType = $event,
            class: { empty: $props.capability.typeData.fogType === `` },
            name: `capability${$props.capability.uuid}-fogType`,
            required: ""
          }, [
            createVNode("option", {
              value: "",
              disabled: ""
            }, "Please select a fog type"),
            (openBlock(true), createBlock(Fragment, null, renderList($data.fogTypes, (fogType) => {
              return openBlock(), createBlock("option", {
                key: fogType,
                value: fogType
              }, toDisplayString(fogType), 9, ["value"]);
            }), 128))
          ], 10, ["onUpdate:modelValue", "name"]), [
            [vModelSelect, $props.capability.typeData.fogType]
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$U = _sfc_main$U.setup;
_sfc_main$U.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityFogType.vue");
  return _sfc_setup$U ? _sfc_setup$U(props, ctx) : void 0;
};
const CapabilityFogType = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$U, [["ssrRender", _sfc_ssrRender$U]]), { __name: "EditorCapabilitiesCapabilityFogType" });
const _sfc_main$T = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        frostIntensity: null,
        frostIntensityStart: "off",
        frostIntensityEnd: "high",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$T(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-frostIntensity`,
    label: "Frost intensity"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "frostIntensity"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "frostIntensity"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$T = _sfc_main$T.setup;
_sfc_main$T.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityFrost.vue");
  return _sfc_setup$T ? _sfc_setup$T(props, ctx) : void 0;
};
const CapabilityFrost = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$T, [["ssrRender", _sfc_ssrRender$T]]), { __name: "EditorCapabilitiesCapabilityFrost" });
const _sfc_main$S = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      hint: "This capability enables a non-static frost effect, e.g. pulse. Use the Frost type instead if a static frost intensity can be chosen.",
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        effectName: "",
        speed: "",
        speedStart: null,
        speedEnd: null,
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$S(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_PropertyInputText = PropertyInputText;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-effectName`,
    label: "Effect name"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.effectName,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.effectName = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-effectName`,
          "schema-property": $data.schemaDefinitions.nonEmptyString,
          required: ""
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.effectName,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.effectName = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-effectName`,
            "schema-property": $data.schemaDefinitions.nonEmptyString,
            required: ""
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-speed`,
    label: "Speed"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          "property-name": "speed"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": "speed"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$S = _sfc_main$S.setup;
_sfc_main$S.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityFrostEffect.vue");
  return _sfc_setup$S ? _sfc_setup$S(props, ctx) : void 0;
};
const CapabilityFrostEffect = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$S, [["ssrRender", _sfc_ssrRender$S]]), { __name: "EditorCapabilitiesCapabilityFrostEffect" });
const _sfc_main$R = {
  components: {
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$R(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$R = _sfc_main$R.setup;
_sfc_main$R.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityGeneric.vue");
  return _sfc_setup$R ? _sfc_setup$R(props, ctx) : void 0;
};
const CapabilityGeneric = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$R, [["ssrRender", _sfc_ssrRender$R]]), { __name: "EditorCapabilitiesCapabilityGeneric" });
const _sfc_main$Q = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      hint: "Master dimmer for the lamp's brightness. Use ColorIntensity for individual color components (e.g. Red, Green, Blue).",
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        brightness: null,
        brightnessStart: "off",
        brightnessEnd: "bright",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$Q(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-brightness`,
    label: "Brightness"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "brightness"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "brightness"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$Q = _sfc_main$Q.setup;
_sfc_main$Q.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityIntensity.vue");
  return _sfc_setup$Q ? _sfc_setup$Q(props, ctx) : void 0;
};
const CapabilityIntensity = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$Q, [["ssrRender", _sfc_ssrRender$Q]]), { __name: "EditorCapabilitiesCapabilityIntensity" });
const _sfc_main$P = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        openPercent: null,
        openPercentStart: "open",
        openPercentEnd: "closed",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$P(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-openPercent`,
    label: "Degree of opening"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "openPercent"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "openPercent"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$P = _sfc_main$P.setup;
_sfc_main$P.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityIris.vue");
  return _sfc_setup$P ? _sfc_setup$P(props, ctx) : void 0;
};
const CapabilityIris = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$P, [["ssrRender", _sfc_ssrRender$P]]), { __name: "EditorCapabilitiesCapabilityIris" });
const _sfc_main$O = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      hint: "This capability enables a non-static iris effect, e.g. pulse. Use the Iris type instead if a static degree of opening can be chosen.",
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        effectName: "",
        speed: "",
        speedStart: null,
        speedEnd: null,
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$O(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_PropertyInputText = PropertyInputText;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-effectName`,
    label: "Effect name"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.effectName,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.effectName = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-effectName`,
          "schema-property": $data.schemaDefinitions.nonEmptyString,
          required: ""
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.effectName,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.effectName = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-effectName`,
            "schema-property": $data.schemaDefinitions.nonEmptyString,
            required: ""
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-speed`,
    label: "Speed"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          "property-name": "speed"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": "speed"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$O = _sfc_main$O.setup;
_sfc_main$O.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityIrisEffect.vue");
  return _sfc_setup$O ? _sfc_setup$O(props, ctx) : void 0;
};
const CapabilityIrisEffect = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$O, [["ssrRender", _sfc_ssrRender$O]]), { __name: "EditorCapabilitiesCapabilityIrisEffect" });
const _sfc_main$N = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputEntity: __nuxt_component_4$2,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    const holdPropertySchema = capabilityTypes.Maintenance.properties.hold;
    const holdEntityName = holdPropertySchema.$ref.replace("definitions.json#/entities/", "");
    return {
      schemaDefinitions,
      holdSchema: entitiesSchema[holdEntityName],
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        parameter: "",
        parameterStart: null,
        parameterEnd: null,
        hold: "",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$N(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputEntity = __nuxt_component_4$2;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-parameter`,
    label: "Parameter"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          "property-name": "parameter"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": "parameter"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-hold`,
    label: "Hold"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputEntity, {
          modelValue: $props.capability.typeData.hold,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.hold = $event,
          name: `capability${$props.capability.uuid}-hold`,
          "schema-property": $data.holdSchema
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputEntity, {
            modelValue: $props.capability.typeData.hold,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.hold = $event,
            name: `capability${$props.capability.uuid}-hold`,
            "schema-property": $data.holdSchema
          }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$N = _sfc_main$N.setup;
_sfc_main$N.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityMaintenance.vue");
  return _sfc_setup$N ? _sfc_setup$N(props, ctx) : void 0;
};
const CapabilityMaintenance = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$N, [["ssrRender", _sfc_ssrRender$N]]), { __name: "EditorCapabilitiesCapabilityMaintenance" });
const _sfc_main$M = {
  components: {
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$M(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$M = _sfc_main$M.setup;
_sfc_main$M.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityNoFunction.vue");
  return _sfc_setup$M ? _sfc_setup$M(props, ctx) : void 0;
};
const CapabilityNoFunction = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$M, [["ssrRender", _sfc_ssrRender$M]]), { __name: "EditorCapabilitiesCapabilityNoFunction" });
const _sfc_main$L = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        angle: null,
        angleStart: "deg",
        angleEnd: "deg",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$L(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-angle`,
    label: "Angle"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "angle"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "angle"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$L = _sfc_main$L.setup;
_sfc_main$L.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityPan.vue");
  return _sfc_setup$L ? _sfc_setup$L(props, ctx) : void 0;
};
const CapabilityPan = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$L, [["ssrRender", _sfc_ssrRender$L]]), { __name: "EditorCapabilitiesCapabilityPan" });
const _sfc_main$K = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        speed: "",
        speedStart: null,
        speedEnd: null,
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$K(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-speed`,
    label: "Speed"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "speed"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "speed"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$K = _sfc_main$K.setup;
_sfc_main$K.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityPanContinuous.vue");
  return _sfc_setup$K ? _sfc_setup$K(props, ctx) : void 0;
};
const CapabilityPanContinuous = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$K, [["ssrRender", _sfc_ssrRender$K]]), { __name: "EditorCapabilitiesCapabilityPanContinuous" });
const _sfc_main$J = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        speedOrDuration: "speed",
        speed: null,
        speedStart: "fast",
        speedEnd: "slow",
        duration: "",
        durationStart: null,
        durationEnd: null,
        comment: ""
      }
    };
  },
  computed: {
    /**
     * Called from {@link EditorCapabilityTypeData}
     * @public
     * @returns {string[]} Array of all props to reset to default data when capability is saved.
     */
    resetProperties() {
      const resetProperty = this.capability.typeData.speedOrDuration === "duration" ? "speed" : "duration";
      return [resetProperty, `${resetProperty}Start`, `${resetProperty}End`];
    }
  },
  methods: {
    async changeSpeedOrDuration(newValue) {
      this.capability.typeData.speedOrDuration = newValue;
      await this.$nextTick();
      this.$refs.speedOrDurationInput.focus();
    }
  }
};
function _sfc_ssrRender$J(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-${$props.capability.typeData.speedOrDuration}`
  }, {
    label: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        if ($props.capability.typeData.speedOrDuration === `duration`) {
          _push2(`<!--[--> Duration / <a href="#speed" class="button secondary inline" title="Specify speed instead of duration"${_scopeId}>Speed</a><!--]-->`);
        } else {
          _push2(`<!--[--> Speed / <a href="#duration" class="button secondary inline" title="Specify duration instead of speed"${_scopeId}>Duration</a><!--]-->`);
        }
      } else {
        return [
          $props.capability.typeData.speedOrDuration === `duration` ? (openBlock(), createBlock(Fragment, { key: 0 }, [
            createTextVNode(" Duration / "),
            createVNode("a", {
              href: "#speed",
              class: "button secondary inline",
              title: "Specify speed instead of duration",
              onClick: withModifiers(($event) => $options.changeSpeedOrDuration(`speed`), ["prevent"])
            }, "Speed", 8, ["onClick"])
          ], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
            createTextVNode(" Speed / "),
            createVNode("a", {
              href: "#duration",
              class: "button secondary inline",
              title: "Specify duration instead of speed",
              onClick: withModifiers(($event) => $options.changeSpeedOrDuration(`duration`), ["prevent"])
            }, "Duration", 8, ["onClick"])
          ], 64))
        ];
      }
    }),
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        if ($props.capability.typeData.speedOrDuration) {
          _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
            ref: "speedOrDurationInput",
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": $props.capability.typeData.speedOrDuration,
            required: ""
          }, null, _parent2, _scopeId));
        } else {
          _push2(`<!---->`);
        }
      } else {
        return [
          $props.capability.typeData.speedOrDuration ? (openBlock(), createBlock(_component_EditorProportionalPropertySwitcher, {
            key: 0,
            ref: "speedOrDurationInput",
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": $props.capability.typeData.speedOrDuration,
            required: ""
          }, null, 8, ["capability", "formstate", "property-name"])) : createCommentVNode("", true)
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$J = _sfc_main$J.setup;
_sfc_main$J.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityPanTiltSpeed.vue");
  return _sfc_setup$J ? _sfc_setup$J(props, ctx) : void 0;
};
const CapabilityPanTiltSpeed = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$J, [["ssrRender", _sfc_ssrRender$J]]), { __name: "EditorCapabilitiesCapabilityPanTiltSpeed" });
const _sfc_main$I = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        speedOrAngle: "speed",
        speed: "",
        speedStart: null,
        speedEnd: null,
        angle: "",
        angleStart: null,
        angleEnd: null,
        comment: ""
      }
    };
  },
  computed: {
    /**
     * Called from {@link EditorCapabilityTypeData}
     * @public
     * @returns {string[]} Array of all props to reset to default data when capability is saved.
     */
    resetProperties() {
      const resetProperty = this.capability.typeData.speedOrAngle === "speed" ? "angle" : "speed";
      return [resetProperty, `${resetProperty}Start`, `${resetProperty}End`];
    }
  },
  methods: {
    async changeSpeedOrAngle(newValue) {
      this.capability.typeData.speedOrAngle = newValue;
      await this.$nextTick();
      this.$refs.speedOrAngleInput.focus();
    }
  }
};
function _sfc_ssrRender$I(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-${$props.capability.typeData.speedOrAngle}`
  }, {
    label: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        if ($props.capability.typeData.speedOrAngle === `speed`) {
          _push2(`<!--[--> Speed / <a href="#anglr" class="button secondary inline" title="Specify angle instead of speed"${_scopeId}>Angle</a><!--]-->`);
        } else {
          _push2(`<!--[--> Angle / <a href="#speed" class="button secondary inline" title="Specify speed instead of angle"${_scopeId}>Speed</a><!--]-->`);
        }
      } else {
        return [
          $props.capability.typeData.speedOrAngle === `speed` ? (openBlock(), createBlock(Fragment, { key: 0 }, [
            createTextVNode(" Speed / "),
            createVNode("a", {
              href: "#anglr",
              class: "button secondary inline",
              title: "Specify angle instead of speed",
              onClick: withModifiers(($event) => $options.changeSpeedOrAngle(`angle`), ["prevent"])
            }, "Angle", 8, ["onClick"])
          ], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
            createTextVNode(" Angle / "),
            createVNode("a", {
              href: "#speed",
              class: "button secondary inline",
              title: "Specify speed instead of angle",
              onClick: withModifiers(($event) => $options.changeSpeedOrAngle(`speed`), ["prevent"])
            }, "Speed", 8, ["onClick"])
          ], 64))
        ];
      }
    }),
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        if ($props.capability.typeData.speedOrAngle) {
          _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
            ref: "speedOrAngleInput",
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": $props.capability.typeData.speedOrAngle
          }, null, _parent2, _scopeId));
        } else {
          _push2(`<!---->`);
        }
      } else {
        return [
          $props.capability.typeData.speedOrAngle ? (openBlock(), createBlock(_component_EditorProportionalPropertySwitcher, {
            key: 0,
            ref: "speedOrAngleInput",
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": $props.capability.typeData.speedOrAngle
          }, null, 8, ["capability", "formstate", "property-name"])) : createCommentVNode("", true)
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$I = _sfc_main$I.setup;
_sfc_main$I.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityPrism.vue");
  return _sfc_setup$I ? _sfc_setup$I(props, ctx) : void 0;
};
const CapabilityPrism = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$I, [["ssrRender", _sfc_ssrRender$I]]), { __name: "EditorCapabilitiesCapabilityPrism" });
const _sfc_main$H = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      hint: "Doesn't activate the prism, only controls the prism rotation.",
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        speedOrAngle: "speed",
        speed: "",
        speedStart: null,
        speedEnd: null,
        angle: "",
        angleStart: null,
        angleEnd: null,
        comment: ""
      }
    };
  },
  computed: {
    /**
     * Called from {@link EditorCapabilityTypeData}
     * @public
     * @returns {string[]} Array of all props to reset to default data when capability is saved.
     */
    resetProperties() {
      const resetProperty = this.capability.typeData.speedOrAngle === "speed" ? "angle" : "speed";
      return [resetProperty, `${resetProperty}Start`, `${resetProperty}End`];
    }
  },
  methods: {
    async changeSpeedOrAngle(newValue) {
      this.capability.typeData.speedOrAngle = newValue;
      await this.$nextTick();
      this.$refs.speedOrAngleInput.focus();
    }
  }
};
function _sfc_ssrRender$H(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-${$props.capability.typeData.speedOrAngle}`
  }, {
    label: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        if ($props.capability.typeData.speedOrAngle === `speed`) {
          _push2(`<!--[--> Speed / <a href="#angle" class="button secondary inline" title="Specify angle instead of speed"${_scopeId}>Angle</a><!--]-->`);
        } else {
          _push2(`<!--[--> Angle / <a href="#speed" class="button secondary inline" title="Specify speed instead of angle"${_scopeId}>Speed</a><!--]-->`);
        }
      } else {
        return [
          $props.capability.typeData.speedOrAngle === `speed` ? (openBlock(), createBlock(Fragment, { key: 0 }, [
            createTextVNode(" Speed / "),
            createVNode("a", {
              href: "#angle",
              class: "button secondary inline",
              title: "Specify angle instead of speed",
              onClick: withModifiers(($event) => $options.changeSpeedOrAngle(`angle`), ["prevent"])
            }, "Angle", 8, ["onClick"])
          ], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
            createTextVNode(" Angle / "),
            createVNode("a", {
              href: "#speed",
              class: "button secondary inline",
              title: "Specify speed instead of angle",
              onClick: withModifiers(($event) => $options.changeSpeedOrAngle(`speed`), ["prevent"])
            }, "Speed", 8, ["onClick"])
          ], 64))
        ];
      }
    }),
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        if ($props.capability.typeData.speedOrAngle) {
          _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
            ref: "speedOrAngleInput",
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": $props.capability.typeData.speedOrAngle,
            required: ""
          }, null, _parent2, _scopeId));
        } else {
          _push2(`<!---->`);
        }
      } else {
        return [
          $props.capability.typeData.speedOrAngle ? (openBlock(), createBlock(_component_EditorProportionalPropertySwitcher, {
            key: 0,
            ref: "speedOrAngleInput",
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": $props.capability.typeData.speedOrAngle,
            required: ""
          }, null, 8, ["capability", "formstate", "property-name"])) : createCommentVNode("", true)
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$H = _sfc_main$H.setup;
_sfc_main$H.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityPrismRotation.vue");
  return _sfc_setup$H ? _sfc_setup$H(props, ctx) : void 0;
};
const CapabilityPrismRotation = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$H, [["ssrRender", _sfc_ssrRender$H]]), { __name: "EditorCapabilitiesCapabilityPrismRotation" });
const _sfc_main$G = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      hint: "Only use this if no other type is applicable. Note that some types like WheelSlot and Prism also allow setting a rotation angle / speed value.",
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        speedOrAngle: "speed",
        speed: "",
        speedStart: null,
        speedEnd: null,
        angle: "",
        angleStart: null,
        angleEnd: null,
        comment: ""
      }
    };
  },
  computed: {
    /**
     * Called from {@link EditorCapabilityTypeData}
     * @public
     * @returns {string[]} Array of all props to reset to default data when capability is saved.
     */
    resetProperties() {
      const resetProperty = this.capability.typeData.speedOrAngle === "speed" ? "angle" : "speed";
      return [resetProperty, `${resetProperty}Start`, `${resetProperty}End`];
    }
  },
  methods: {
    async changeSpeedOrAngle(newValue) {
      this.capability.typeData.speedOrAngle = newValue;
      await this.$nextTick();
      this.$refs.speedOrAngleInput.focus();
    }
  }
};
function _sfc_ssrRender$G(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-${$props.capability.typeData.speedOrAngle}`
  }, {
    label: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        if ($props.capability.typeData.speedOrAngle === `speed`) {
          _push2(`<!--[--> Speed / <a href="#angle" class="button secondary inline" title="Specify angle instead of speed"${_scopeId}>Angle</a><!--]-->`);
        } else {
          _push2(`<!--[--> Angle / <a href="#speed" class="button secondary inline" title="Specify speed instead of angle"${_scopeId}>Speed</a><!--]-->`);
        }
      } else {
        return [
          $props.capability.typeData.speedOrAngle === `speed` ? (openBlock(), createBlock(Fragment, { key: 0 }, [
            createTextVNode(" Speed / "),
            createVNode("a", {
              href: "#angle",
              class: "button secondary inline",
              title: "Specify angle instead of speed",
              onClick: withModifiers(($event) => $options.changeSpeedOrAngle(`angle`), ["prevent"])
            }, "Angle", 8, ["onClick"])
          ], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
            createTextVNode(" Angle / "),
            createVNode("a", {
              href: "#speed",
              class: "button secondary inline",
              title: "Specify speed instead of angle",
              onClick: withModifiers(($event) => $options.changeSpeedOrAngle(`speed`), ["prevent"])
            }, "Speed", 8, ["onClick"])
          ], 64))
        ];
      }
    }),
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        if ($props.capability.typeData.speedOrAngle) {
          _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
            ref: "speedOrAngleInput",
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": $props.capability.typeData.speedOrAngle,
            required: ""
          }, null, _parent2, _scopeId));
        } else {
          _push2(`<!---->`);
        }
      } else {
        return [
          $props.capability.typeData.speedOrAngle ? (openBlock(), createBlock(_component_EditorProportionalPropertySwitcher, {
            key: 0,
            ref: "speedOrAngleInput",
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": $props.capability.typeData.speedOrAngle,
            required: ""
          }, null, 8, ["capability", "formstate", "property-name"])) : createCommentVNode("", true)
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$G = _sfc_main$G.setup;
_sfc_main$G.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityRotation.vue");
  return _sfc_setup$G ? _sfc_setup$G(props, ctx) : void 0;
};
const CapabilityRotation = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$G, [["ssrRender", _sfc_ssrRender$G]]), { __name: "EditorCapabilitiesCapabilityRotation" });
const _sfc_main$F = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputBoolean: __nuxt_component_8,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      shutterEffects: capabilityTypes.ShutterStrobe.properties.shutterEffect.enum,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        shutterEffect: "",
        soundControlled: null,
        speed: null,
        speedStart: "",
        speedEnd: "",
        duration: "",
        durationStart: null,
        durationEnd: null,
        randomTiming: null,
        comment: ""
      }
    };
  },
  computed: {
    isStrobeEffect() {
      return !["", "Open", "Closed"].includes(this.capability.typeData.shutterEffect);
    },
    strobeEffectName() {
      return this.capability.typeData.shutterEffect === "Strobe" ? "Strobe" : `${this.capability.typeData.shutterEffect} Strobe`;
    },
    /**
     * Called from {@link EditorCapabilityTypeData}
     * @public
     * @returns {string[]} Array of all props to reset to default data when capability is saved.
     */
    resetProperties() {
      if (!this.isStrobeEffect) {
        return [
          "soundControlled",
          "speed",
          "speedStart",
          "speedEnd",
          "duration",
          "durationStart",
          "durationEnd",
          "randomTiming"
        ];
      }
      return [];
    }
  }
};
function _sfc_ssrRender$F(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_PropertyInputBoolean = __nuxt_component_8;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-shutterEffect`,
    label: "Shutter effect"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<select class="${ssrRenderClass({ empty: $props.capability.typeData.shutterEffect === `` })}"${ssrRenderAttr("name", `capability${$props.capability.uuid}-shutterEffect`)} required${_scopeId}><option value="" disabled${ssrIncludeBooleanAttr(Array.isArray($props.capability.typeData.shutterEffect) ? ssrLooseContain($props.capability.typeData.shutterEffect, "") : ssrLooseEqual($props.capability.typeData.shutterEffect, "")) ? " selected" : ""}${_scopeId}>Please select a shutter effect</option><!--[-->`);
        ssrRenderList($data.shutterEffects, (effect) => {
          _push2(`<option${ssrRenderAttr("value", effect)}${ssrIncludeBooleanAttr(Array.isArray($props.capability.typeData.shutterEffect) ? ssrLooseContain($props.capability.typeData.shutterEffect, effect) : ssrLooseEqual($props.capability.typeData.shutterEffect, effect)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(effect)}</option>`);
        });
        _push2(`<!--]--></select>`);
      } else {
        return [
          withDirectives(createVNode("select", {
            "onUpdate:modelValue": ($event) => $props.capability.typeData.shutterEffect = $event,
            class: { empty: $props.capability.typeData.shutterEffect === `` },
            name: `capability${$props.capability.uuid}-shutterEffect`,
            required: ""
          }, [
            createVNode("option", {
              value: "",
              disabled: ""
            }, "Please select a shutter effect"),
            (openBlock(true), createBlock(Fragment, null, renderList($data.shutterEffects, (effect) => {
              return openBlock(), createBlock("option", {
                key: effect,
                value: effect
              }, toDisplayString(effect), 9, ["value"]);
            }), 128))
          ], 10, ["onUpdate:modelValue", "name"]), [
            [vModelSelect, $props.capability.typeData.shutterEffect]
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  if ($options.isStrobeEffect) {
    _push(`<!--[-->`);
    _push(ssrRenderComponent(_component_LabeledInput, {
      formstate: $props.formstate,
      name: `capability${$props.capability.uuid}-soundControlled`,
      label: "Sound-controlled?"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_PropertyInputBoolean, {
            modelValue: $props.capability.typeData.soundControlled,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.soundControlled = $event,
            name: `capability${$props.capability.uuid}-soundControlled`,
            label: "Strobe is sound-controlled"
          }, null, _parent2, _scopeId));
        } else {
          return [
            createVNode(_component_PropertyInputBoolean, {
              modelValue: $props.capability.typeData.soundControlled,
              "onUpdate:modelValue": ($event) => $props.capability.typeData.soundControlled = $event,
              name: `capability${$props.capability.uuid}-soundControlled`,
              label: "Strobe is sound-controlled"
            }, null, 8, ["modelValue", "onUpdate:modelValue", "name"])
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(ssrRenderComponent(_component_LabeledInput, {
      formstate: $props.formstate,
      "multiple-inputs": "",
      name: `capability${$props.capability.uuid}-speed`,
      label: "Speed"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": "speed",
            entity: "speed"
          }, null, _parent2, _scopeId));
        } else {
          return [
            createVNode(_component_EditorProportionalPropertySwitcher, {
              capability: $props.capability,
              formstate: $props.formstate,
              "property-name": "speed",
              entity: "speed"
            }, null, 8, ["capability", "formstate"])
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(ssrRenderComponent(_component_LabeledInput, {
      formstate: $props.formstate,
      "multiple-inputs": "",
      name: `capability${$props.capability.uuid}-duration`,
      label: "Duration"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": "duration"
          }, null, _parent2, _scopeId));
        } else {
          return [
            createVNode(_component_EditorProportionalPropertySwitcher, {
              capability: $props.capability,
              formstate: $props.formstate,
              "property-name": "duration"
            }, null, 8, ["capability", "formstate"])
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(ssrRenderComponent(_component_LabeledInput, {
      formstate: $props.formstate,
      name: `capability${$props.capability.uuid}-randomTiming`,
      label: "Random timing?"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_PropertyInputBoolean, {
            modelValue: $props.capability.typeData.randomTiming,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.randomTiming = $event,
            name: `capability${$props.capability.uuid}-randomTiming`,
            label: `Random ${$options.strobeEffectName}`
          }, null, _parent2, _scopeId));
        } else {
          return [
            createVNode(_component_PropertyInputBoolean, {
              modelValue: $props.capability.typeData.randomTiming,
              "onUpdate:modelValue": ($event) => $props.capability.typeData.randomTiming = $event,
              name: `capability${$props.capability.uuid}-randomTiming`,
              label: `Random ${$options.strobeEffectName}`
            }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "label"])
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(`<!--]-->`);
  } else {
    _push(`<!---->`);
  }
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$F = _sfc_main$F.setup;
_sfc_main$F.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityShutterStrobe.vue");
  return _sfc_setup$F ? _sfc_setup$F(props, ctx) : void 0;
};
const CapabilityShutterStrobe = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$F, [["ssrRender", _sfc_ssrRender$F]]), { __name: "EditorCapabilitiesCapabilityShutterStrobe" });
const _sfc_main$E = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      hint: "Doesn't activate sound controlled mode (use Effect for this), only controls the microphone sensitivity.",
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        soundSensitivity: null,
        soundSensitivityStart: "low",
        soundSensitivityEnd: "high",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$E(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-soundSensitivity`,
    label: "Sound sensitivity"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "soundSensitivity"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "soundSensitivity"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$E = _sfc_main$E.setup;
_sfc_main$E.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilitySoundSensitivity.vue");
  return _sfc_setup$E ? _sfc_setup$E(props, ctx) : void 0;
};
const CapabilitySoundSensitivity = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$E, [["ssrRender", _sfc_ssrRender$E]]), { __name: "EditorCapabilitiesCapabilitySoundSensitivity" });
const _sfc_main$D = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      hint: "Only use this if no other type is applicable. Note that some types like Effect, PanContinuous or Rotation also allow setting a speed value.",
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        speed: null,
        speedStart: "slow",
        speedEnd: "fast",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$D(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-speed`,
    label: "Speed"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "speed"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "speed"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$D = _sfc_main$D.setup;
_sfc_main$D.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilitySpeed.vue");
  return _sfc_setup$D ? _sfc_setup$D(props, ctx) : void 0;
};
const CapabilitySpeed = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$D, [["ssrRender", _sfc_ssrRender$D]]), { __name: "EditorCapabilitiesCapabilitySpeed" });
const _sfc_main$C = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      hint: "Doesn't activate strobe, only controls the strobe flash duration.",
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        duration: null,
        durationStart: "ms",
        durationEnd: "ms",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$C(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-duration`,
    label: "Duration"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "duration"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "duration"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$C = _sfc_main$C.setup;
_sfc_main$C.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityStrobeDuration.vue");
  return _sfc_setup$C ? _sfc_setup$C(props, ctx) : void 0;
};
const CapabilityStrobeDuration = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$C, [["ssrRender", _sfc_ssrRender$C]]), { __name: "EditorCapabilitiesCapabilityStrobeDuration" });
const _sfc_main$B = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      hint: "Doesn't activate strobe, only controls the strobe frequency when another channel is set to a ShutterStrobe capability with shutter effect 'Strobe'.",
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        speed: null,
        speedStart: "Hz",
        speedEnd: "Hz",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$B(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-speed`,
    label: "Speed"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "speed"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "speed"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$B = _sfc_main$B.setup;
_sfc_main$B.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityStrobeSpeed.vue");
  return _sfc_setup$B ? _sfc_setup$B(props, ctx) : void 0;
};
const CapabilityStrobeSpeed = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$B, [["ssrRender", _sfc_ssrRender$B]]), { __name: "EditorCapabilitiesCapabilityStrobeSpeed" });
const _sfc_main$A = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        angle: null,
        angleStart: "deg",
        angleEnd: "deg",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$A(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-angle`,
    label: "Angle"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "angle"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "angle"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$A = _sfc_main$A.setup;
_sfc_main$A.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityTilt.vue");
  return _sfc_setup$A ? _sfc_setup$A(props, ctx) : void 0;
};
const CapabilityTilt = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$A, [["ssrRender", _sfc_ssrRender$A]]), { __name: "EditorCapabilitiesCapabilityTilt" });
const _sfc_main$z = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        speed: "",
        speedStart: null,
        speedEnd: null,
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$z(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-speed`,
    label: "Speed"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "speed"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "speed"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$z = _sfc_main$z.setup;
_sfc_main$z.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityTiltContinuous.vue");
  return _sfc_setup$z ? _sfc_setup$z(props, ctx) : void 0;
};
const CapabilityTiltContinuous = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$z, [["ssrRender", _sfc_ssrRender$z]]), { __name: "EditorCapabilitiesCapabilityTiltContinuous" });
const _sfc_main$y = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        time: null,
        timeStart: "",
        timeEnd: "",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$y(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-time`,
    label: "Time"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "time"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "time"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$y = _sfc_main$y.setup;
_sfc_main$y.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityTime.vue");
  return _sfc_setup$y ? _sfc_setup$y(props, ctx) : void 0;
};
const CapabilityTime = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$y, [["ssrRender", _sfc_ssrRender$y]]), { __name: "EditorCapabilitiesCapabilityTime" });
const _sfc_main$x = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      hint: "Rotation of the whole wheel (i.e. over all wheel slots). Use WheelSlotRotation if only the slot itself (e.g. a Gobo) rotates in this capability. If the fixture doesn't have a physical color wheel, use Effect with ColorFade/ColorJump preset instead.",
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        speedOrAngle: "speed",
        speed: null,
        speedStart: "slow CW",
        speedEnd: "fast CW",
        angle: null,
        angleStart: "0deg",
        angleEnd: "360deg",
        comment: ""
      }
    };
  },
  computed: {
    /**
     * Called from {@link EditorCapabilityTypeData}
     * @public
     * @returns {string[]} Array of all props to reset to default data when capability is saved.
     */
    resetProperties() {
      const resetProperty = this.capability.typeData.speedOrAngle === "speed" ? "angle" : "speed";
      return [resetProperty, `${resetProperty}Start`, `${resetProperty}End`];
    }
  },
  methods: {
    async changeSpeedOrAngle(newValue) {
      this.capability.typeData.speedOrAngle = newValue;
      await this.$nextTick();
      this.$refs.speedOrAngleInput.focus();
    }
  }
};
function _sfc_ssrRender$x(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-${$props.capability.typeData.speedOrAngle}`
  }, {
    label: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        if ($props.capability.typeData.speedOrAngle === `speed`) {
          _push2(`<!--[--> Speed / <a href="#angle" class="button secondary inline" title="Specify angle instead of speed"${_scopeId}>Angle</a><!--]-->`);
        } else {
          _push2(`<!--[--> Angle / <a href="#speed" class="button secondary inline" title="Specify speed instead of angle"${_scopeId}>Speed</a><!--]-->`);
        }
      } else {
        return [
          $props.capability.typeData.speedOrAngle === `speed` ? (openBlock(), createBlock(Fragment, { key: 0 }, [
            createTextVNode(" Speed / "),
            createVNode("a", {
              href: "#angle",
              class: "button secondary inline",
              title: "Specify angle instead of speed",
              onClick: withModifiers(($event) => $options.changeSpeedOrAngle(`angle`), ["prevent"])
            }, "Angle", 8, ["onClick"])
          ], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
            createTextVNode(" Angle / "),
            createVNode("a", {
              href: "#speed",
              class: "button secondary inline",
              title: "Specify speed instead of angle",
              onClick: withModifiers(($event) => $options.changeSpeedOrAngle(`speed`), ["prevent"])
            }, "Speed", 8, ["onClick"])
          ], 64))
        ];
      }
    }),
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        if ($props.capability.typeData.speedOrAngle) {
          _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
            ref: "speedOrAngleInput",
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": $props.capability.typeData.speedOrAngle,
            required: ""
          }, null, _parent2, _scopeId));
        } else {
          _push2(`<!---->`);
        }
      } else {
        return [
          $props.capability.typeData.speedOrAngle ? (openBlock(), createBlock(_component_EditorProportionalPropertySwitcher, {
            key: 0,
            ref: "speedOrAngleInput",
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": $props.capability.typeData.speedOrAngle,
            required: ""
          }, null, 8, ["capability", "formstate", "property-name"])) : createCommentVNode("", true)
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$x = _sfc_main$x.setup;
_sfc_main$x.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityWheelRotation.vue");
  return _sfc_setup$x ? _sfc_setup$x(props, ctx) : void 0;
};
const CapabilityWheelRotation = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$x, [["ssrRender", _sfc_ssrRender$x]]), { __name: "EditorCapabilitiesCapabilityWheelRotation" });
const _sfc_main$w = {
  inheritAttrs: false,
  data() {
    return {
      /**
       * Used in {@link EditorWheelSlot}
       * @public
       */
      defaultData: {}
    };
  }
};
function _sfc_ssrRender$w(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "wheel-slot-type-data" }, _attrs))}></div>`);
}
const _sfc_setup$w = _sfc_main$w.setup;
_sfc_main$w.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/wheel-slots/WheelSlotAnimationGoboEnd.vue");
  return _sfc_setup$w ? _sfc_setup$w(props, ctx) : void 0;
};
const WheelSlotAnimationGoboEnd = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$w, [["ssrRender", _sfc_ssrRender$w]]), { __name: "EditorWheelSlotsWheelSlotAnimationGoboEnd" });
const _sfc_main$v = {
  components: {
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    wheelSlot: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorWheelSlot}
       * @public
       */
      defaultData: {
        name: ""
      }
    };
  }
};
function _sfc_ssrRender$v(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "wheel-slot-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `wheel-slot${$props.wheelSlot.uuid}-name`,
    label: "Animation gobo name"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.wheelSlot.typeData.name,
          "onUpdate:modelValue": ($event) => $props.wheelSlot.typeData.name = $event,
          formstate: $props.formstate,
          name: `wheel-slot${$props.wheelSlot.uuid}-name`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.wheelSlot.typeData.name,
            "onUpdate:modelValue": ($event) => $props.wheelSlot.typeData.name = $event,
            formstate: $props.formstate,
            name: `wheel-slot${$props.wheelSlot.uuid}-name`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$v = _sfc_main$v.setup;
_sfc_main$v.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/wheel-slots/WheelSlotAnimationGoboStart.vue");
  return _sfc_setup$v ? _sfc_setup$v(props, ctx) : void 0;
};
const WheelSlotAnimationGoboStart = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$v, [["ssrRender", _sfc_ssrRender$v]]), { __name: "EditorWheelSlotsWheelSlotAnimationGoboStart" });
const _sfc_main$u = {
  inheritAttrs: false,
  data() {
    return {
      /**
       * Used in {@link EditorWheelSlot}
       * @public
       */
      defaultData: {}
    };
  }
};
function _sfc_ssrRender$u(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "wheel-slot-type-data" }, _attrs))}></div>`);
}
const _sfc_setup$u = _sfc_main$u.setup;
_sfc_main$u.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/wheel-slots/WheelSlotClosed.vue");
  return _sfc_setup$u ? _sfc_setup$u(props, ctx) : void 0;
};
const WheelSlotClosed = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$u, [["ssrRender", _sfc_ssrRender$u]]), { __name: "EditorWheelSlotsWheelSlotClosed" });
const _sfc_main$t = {
  components: {
    LabeledInput: __nuxt_component_2$3,
    PropertyInputEntity: __nuxt_component_4$2,
    PropertyInputText
  },
  props: {
    wheelSlot: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      entitiesSchema,
      /**
       * Used in {@link EditorWheelSlot}
       * @public
       */
      defaultData: {
        name: "",
        colors: null,
        colorsHexString: "",
        colorTemperature: ""
      },
      colorPreview: null
    };
  },
  watch: {
    "wheelSlot.typeData.colorsHexString": {
      handler(hexString) {
        this.wheelSlot.typeData.colors = colorsHexStringToArray(hexString);
        this.colorPreview = this.wheelSlot.typeData.colors;
      },
      immediate: true
    }
  }
};
function _sfc_ssrRender$t(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_PropertyInputText = PropertyInputText;
  const _component_OflSvg = __nuxt_component_1$1$1;
  const _component_PropertyInputEntity = __nuxt_component_4$2;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "wheel-slot-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `wheel-slot${$props.wheelSlot.uuid}-name`,
    label: "Color name"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.wheelSlot.typeData.name,
          "onUpdate:modelValue": ($event) => $props.wheelSlot.typeData.name = $event,
          formstate: $props.formstate,
          name: `wheel-slot${$props.wheelSlot.uuid}-name`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.wheelSlot.typeData.name,
            "onUpdate:modelValue": ($event) => $props.wheelSlot.typeData.name = $event,
            formstate: $props.formstate,
            name: `wheel-slot${$props.wheelSlot.uuid}-name`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    label: "Color hex code(s)",
    formstate: $props.formstate,
    name: `wheel-slot${$props.wheelSlot.uuid}-colorsHexString`
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.wheelSlot.typeData.colorsHexString,
          "onUpdate:modelValue": ($event) => $props.wheelSlot.typeData.colorsHexString = $event,
          name: `wheel-slot${$props.wheelSlot.uuid}-colorsHexString`,
          "schema-property": $data.schemaDefinitions.nonEmptyString,
          "valid-color-hex-list": ""
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.wheelSlot.typeData.colorsHexString,
            "onUpdate:modelValue": ($event) => $props.wheelSlot.typeData.colorsHexString = $event,
            name: `wheel-slot${$props.wheelSlot.uuid}-colorsHexString`,
            "schema-property": $data.schemaDefinitions.nonEmptyString,
            "valid-color-hex-list": ""
          }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  if ($data.colorPreview !== null) {
    _push(ssrRenderComponent(_component_LabeledInput, { label: "Color preview" }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<!--[-->`);
          ssrRenderList($data.colorPreview, (color) => {
            _push2(ssrRenderComponent(_component_OflSvg, {
              key: color,
              colors: [color],
              type: "color-circle"
            }, null, _parent2, _scopeId));
          });
          _push2(`<!--]-->`);
        } else {
          return [
            (openBlock(true), createBlock(Fragment, null, renderList($data.colorPreview, (color) => {
              return openBlock(), createBlock(_component_OflSvg, {
                key: color,
                colors: [color],
                type: "color-circle"
              }, null, 8, ["colors"]);
            }), 128))
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `wheel-slot${$props.wheelSlot.uuid}-colorTemperature`,
    label: "Color temperature"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputEntity, {
          modelValue: $props.wheelSlot.typeData.colorTemperature,
          "onUpdate:modelValue": ($event) => $props.wheelSlot.typeData.colorTemperature = $event,
          formstate: $props.formstate,
          name: `wheel-slot${$props.wheelSlot.uuid}-colorTemperature`,
          "schema-property": $data.entitiesSchema.colorTemperature
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputEntity, {
            modelValue: $props.wheelSlot.typeData.colorTemperature,
            "onUpdate:modelValue": ($event) => $props.wheelSlot.typeData.colorTemperature = $event,
            formstate: $props.formstate,
            name: `wheel-slot${$props.wheelSlot.uuid}-colorTemperature`,
            "schema-property": $data.entitiesSchema.colorTemperature
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$t = _sfc_main$t.setup;
_sfc_main$t.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/wheel-slots/WheelSlotColor.vue");
  return _sfc_setup$t ? _sfc_setup$t(props, ctx) : void 0;
};
const WheelSlotColor = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$t, [["ssrRender", _sfc_ssrRender$t]]), { __name: "EditorWheelSlotsWheelSlotColor" });
const _sfc_main$s = {
  components: {
    LabeledInput: __nuxt_component_2$3,
    PropertyInputEntity: __nuxt_component_4$2
  },
  props: {
    wheelSlot: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      entitiesSchema,
      /**
       * Used in {@link EditorWheelSlot}
       * @public
       */
      defaultData: {
        frostIntensity: ""
      }
    };
  }
};
function _sfc_ssrRender$s(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_PropertyInputEntity = __nuxt_component_4$2;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "wheel-slot-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `wheel-slot${$props.wheelSlot.uuid}-frostIntensity`,
    label: "Frost intensity"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputEntity, {
          modelValue: $props.wheelSlot.typeData.frostIntensity,
          "onUpdate:modelValue": ($event) => $props.wheelSlot.typeData.frostIntensity = $event,
          formstate: $props.formstate,
          name: `wheel-slot${$props.wheelSlot.uuid}-frostIntensity`,
          "schema-property": $data.entitiesSchema.percent
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputEntity, {
            modelValue: $props.wheelSlot.typeData.frostIntensity,
            "onUpdate:modelValue": ($event) => $props.wheelSlot.typeData.frostIntensity = $event,
            formstate: $props.formstate,
            name: `wheel-slot${$props.wheelSlot.uuid}-frostIntensity`,
            "schema-property": $data.entitiesSchema.percent
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$s = _sfc_main$s.setup;
_sfc_main$s.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/wheel-slots/WheelSlotFrost.vue");
  return _sfc_setup$s ? _sfc_setup$s(props, ctx) : void 0;
};
const WheelSlotFrost = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$s, [["ssrRender", _sfc_ssrRender$s]]), { __name: "EditorWheelSlotsWheelSlotFrost" });
const _sfc_main$r = {
  components: {
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    wheelSlot: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorWheelSlot}
       * @public
       */
      defaultData: {
        name: ""
      }
    };
  }
};
function _sfc_ssrRender$r(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "wheel-slot-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `wheel-slot${$props.wheelSlot.uuid}-name`,
    label: "Gobo name"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.wheelSlot.typeData.name,
          "onUpdate:modelValue": ($event) => $props.wheelSlot.typeData.name = $event,
          formstate: $props.formstate,
          name: `wheel-slot${$props.wheelSlot.uuid}-name`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.wheelSlot.typeData.name,
            "onUpdate:modelValue": ($event) => $props.wheelSlot.typeData.name = $event,
            formstate: $props.formstate,
            name: `wheel-slot${$props.wheelSlot.uuid}-name`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$r = _sfc_main$r.setup;
_sfc_main$r.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/wheel-slots/WheelSlotGobo.vue");
  return _sfc_setup$r ? _sfc_setup$r(props, ctx) : void 0;
};
const WheelSlotGobo = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$r, [["ssrRender", _sfc_ssrRender$r]]), { __name: "EditorWheelSlotsWheelSlotGobo" });
const _sfc_main$q = {
  components: {
    LabeledInput: __nuxt_component_2$3,
    PropertyInputEntity: __nuxt_component_4$2
  },
  props: {
    wheelSlot: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      entitiesSchema,
      /**
       * Used in {@link EditorWheelSlot}
       * @public
       */
      defaultData: {
        openPercent: ""
      }
    };
  }
};
function _sfc_ssrRender$q(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_PropertyInputEntity = __nuxt_component_4$2;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "wheel-slot-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `wheel-slot${$props.wheelSlot.uuid}-openPercent`,
    label: "Degree of opening"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputEntity, {
          modelValue: $props.wheelSlot.typeData.openPercent,
          "onUpdate:modelValue": ($event) => $props.wheelSlot.typeData.openPercent = $event,
          formstate: $props.formstate,
          name: `wheel-slot${$props.wheelSlot.uuid}-openPercent`,
          "schema-property": $data.entitiesSchema.irisPercent
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputEntity, {
            modelValue: $props.wheelSlot.typeData.openPercent,
            "onUpdate:modelValue": ($event) => $props.wheelSlot.typeData.openPercent = $event,
            formstate: $props.formstate,
            name: `wheel-slot${$props.wheelSlot.uuid}-openPercent`,
            "schema-property": $data.entitiesSchema.irisPercent
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$q = _sfc_main$q.setup;
_sfc_main$q.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/wheel-slots/WheelSlotIris.vue");
  return _sfc_setup$q ? _sfc_setup$q(props, ctx) : void 0;
};
const WheelSlotIris = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$q, [["ssrRender", _sfc_ssrRender$q]]), { __name: "EditorWheelSlotsWheelSlotIris" });
const _sfc_main$p = {
  inheritAttrs: false,
  data() {
    return {
      /**
       * Used in {@link EditorWheelSlot}
       * @public
       */
      defaultData: {}
    };
  }
};
function _sfc_ssrRender$p(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "wheel-slot-type-data" }, _attrs))}></div>`);
}
const _sfc_setup$p = _sfc_main$p.setup;
_sfc_main$p.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/wheel-slots/WheelSlotOpen.vue");
  return _sfc_setup$p ? _sfc_setup$p(props, ctx) : void 0;
};
const WheelSlotOpen = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$p, [["ssrRender", _sfc_ssrRender$p]]), { __name: "EditorWheelSlotsWheelSlotOpen" });
const _sfc_main$o = {
  components: {
    LabeledInput: __nuxt_component_2$3,
    PropertyInputNumber: __nuxt_component_3$1,
    PropertyInputText
  },
  props: {
    wheelSlot: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      facetsSchema: wheelSlotTypes.Prism.properties.facets,
      /**
       * Used in {@link EditorWheelSlot}
       * @public
       */
      defaultData: {
        name: "",
        facets: ""
      }
    };
  }
};
function _sfc_ssrRender$o(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_PropertyInputText = PropertyInputText;
  const _component_PropertyInputNumber = __nuxt_component_3$1;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "wheel-slot-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `wheel-slot${$props.wheelSlot.uuid}-name`,
    label: "Prism name"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.wheelSlot.typeData.name,
          "onUpdate:modelValue": ($event) => $props.wheelSlot.typeData.name = $event,
          formstate: $props.formstate,
          name: `wheel-slot${$props.wheelSlot.uuid}-name`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.wheelSlot.typeData.name,
            "onUpdate:modelValue": ($event) => $props.wheelSlot.typeData.name = $event,
            formstate: $props.formstate,
            name: `wheel-slot${$props.wheelSlot.uuid}-name`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `wheel-slot${$props.wheelSlot.uuid}-facets`,
    label: "Facets"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputNumber, {
          modelValue: $props.wheelSlot.typeData.facets,
          "onUpdate:modelValue": ($event) => $props.wheelSlot.typeData.facets = $event,
          formstate: $props.formstate,
          name: `wheel-slot${$props.wheelSlot.uuid}-facets`,
          "schema-property": $data.facetsSchema
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputNumber, {
            modelValue: $props.wheelSlot.typeData.facets,
            "onUpdate:modelValue": ($event) => $props.wheelSlot.typeData.facets = $event,
            formstate: $props.formstate,
            name: `wheel-slot${$props.wheelSlot.uuid}-facets`,
            "schema-property": $data.facetsSchema
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$o = _sfc_main$o.setup;
_sfc_main$o.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/wheel-slots/WheelSlotPrism.vue");
  return _sfc_setup$o ? _sfc_setup$o(props, ctx) : void 0;
};
const WheelSlotPrism = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$o, [["ssrRender", _sfc_ssrRender$o]]), { __name: "EditorWheelSlotsWheelSlotPrism" });
const _sfc_main$n = {
  components: {
    ConditionalDetails: __nuxt_component_3$2,
    LabeledInput: __nuxt_component_2$3,
    WheelSlotAnimationGoboEnd,
    WheelSlotAnimationGoboStart,
    WheelSlotClosed,
    WheelSlotColor,
    WheelSlotFrost,
    WheelSlotGobo,
    WheelSlotIris,
    WheelSlotOpen,
    WheelSlotPrism
  },
  props: {
    channel: objectProp().required,
    slotNumber: integerProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      slotTypes: Object.keys(wheelSlotTypes),
      open: false
    };
  },
  computed: {
    slot() {
      return this.channel.wheel.slots[this.slotNumber - 1];
    },
    suggestedType() {
      const previousSlot = this.channel.wheel.slots[this.slotNumber - 2];
      if (previousSlot && previousSlot.type === "AnimationGoboStart") {
        return "AnimationGoboEnd";
      }
      if (this.slotNumber === 1) {
        return /\banimation\b/i.test(this.channel.name) ? "AnimationGoboStart" : "Open";
      }
      return this.slotTypes.find((type) => this.channel.name.toLowerCase().includes(type.toLowerCase())) || "";
    },
    animationGoboEndAfterStart() {
      if (this.slot.type !== "AnimationGoboEnd") {
        return true;
      }
      if (this.slotNumber === 1) {
        return false;
      }
      const previousSlot = this.channel.wheel.slots[this.slotNumber - 2];
      return !previousSlot || previousSlot.type === "AnimationGoboStart";
    },
    animationGoboEndValid() {
      const previousSlot = this.channel.wheel.slots[this.slotNumber - 2];
      return !previousSlot || previousSlot.type !== "AnimationGoboStart" || this.slot.type === "AnimationGoboEnd";
    }
  },
  created() {
    this.$watch("slotNumber", async (newSlotNumber) => {
      if (!this.channel.wheel.slots[newSlotNumber - 1]) {
        this.$set(this.channel.wheel.slots, newSlotNumber - 1, getEmptyWheelSlot());
        this.open = true;
        await this.$nextTick();
        this.slot.type = this.suggestedType;
      }
    }, {
      immediate: true
    });
  },
  methods: {
    /**
     * Add all properties to capability.typeData that are required by the current wheel slot type and are not yet in there.
     */
    async changeSlotType() {
      await this.$nextTick();
      const defaultData = this.$refs.typeData.defaultData;
      for (const property of Object.keys(defaultData)) {
        if (!(property in this.slot.typeData)) {
          this.$set(this.slot.typeData, property, defaultData[property]);
        }
      }
    }
  }
};
function _sfc_ssrRender$n(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_ConditionalDetails = __nuxt_component_3$2;
  const _component_LabeledInput = __nuxt_component_2$3;
  _push(ssrRenderComponent(_component_ConditionalDetails, mergeProps({
    class: "editor-wheel-slot",
    open: $data.open
  }, _attrs), {
    summary: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Details for wheel slot ${ssrInterpolate($props.slotNumber)}`);
      } else {
        return [
          createTextVNode("Details for wheel slot " + toDisplayString($props.slotNumber), 1)
        ];
      }
    }),
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<div class="wheel-slot-content" data-v-eddf8f73${_scopeId}>`);
        _push2(ssrRenderComponent(_component_LabeledInput, {
          formstate: $props.formstate,
          "custom-validators": {
            "animation-gobo-end-without-start": $options.animationGoboEndAfterStart,
            "must-be-animation-gobo-end": $options.animationGoboEndValid
          },
          name: `wheel-slot${$options.slot.uuid}-type`,
          label: "Slot type"
        }, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(`<select class="${ssrRenderClass({ empty: $options.slot.type === `` })}"${ssrRenderAttr("name", `wheel-slot${$options.slot.uuid}-type`)} required data-v-eddf8f73${_scopeId2}><option value="" disabled data-v-eddf8f73${ssrIncludeBooleanAttr(Array.isArray($options.slot.type) ? ssrLooseContain($options.slot.type, "") : ssrLooseEqual($options.slot.type, "")) ? " selected" : ""}${_scopeId2}>Please select a slot type</option><!--[-->`);
              ssrRenderList($data.slotTypes, (type) => {
                _push3(`<option${ssrRenderAttr("value", type)} data-v-eddf8f73${ssrIncludeBooleanAttr(Array.isArray($options.slot.type) ? ssrLooseContain($options.slot.type, type) : ssrLooseEqual($options.slot.type, type)) ? " selected" : ""}${_scopeId2}>${ssrInterpolate(type)}</option>`);
              });
              _push3(`<!--]--></select>`);
            } else {
              return [
                withDirectives(createVNode("select", {
                  "onUpdate:modelValue": ($event) => $options.slot.type = $event,
                  class: { empty: $options.slot.type === `` },
                  name: `wheel-slot${$options.slot.uuid}-type`,
                  required: "",
                  onChange: ($event) => $options.changeSlotType()
                }, [
                  createVNode("option", {
                    value: "",
                    disabled: ""
                  }, "Please select a slot type"),
                  (openBlock(true), createBlock(Fragment, null, renderList($data.slotTypes, (type) => {
                    return openBlock(), createBlock("option", {
                      key: type,
                      value: type
                    }, toDisplayString(type), 9, ["value"]);
                  }), 128))
                ], 42, ["onUpdate:modelValue", "name", "onChange"]), [
                  [vModelSelect, $options.slot.type]
                ])
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
        if ($options.slot.type !== ``) {
          ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(`WheelSlot${$options.slot.type}`), {
            ref: "typeData",
            "wheel-slot": $options.slot,
            formstate: $props.formstate
          }, null), _parent2, _scopeId);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</div>`);
      } else {
        return [
          createVNode("div", { class: "wheel-slot-content" }, [
            createVNode(_component_LabeledInput, {
              formstate: $props.formstate,
              "custom-validators": {
                "animation-gobo-end-without-start": $options.animationGoboEndAfterStart,
                "must-be-animation-gobo-end": $options.animationGoboEndValid
              },
              name: `wheel-slot${$options.slot.uuid}-type`,
              label: "Slot type"
            }, {
              default: withCtx(() => [
                withDirectives(createVNode("select", {
                  "onUpdate:modelValue": ($event) => $options.slot.type = $event,
                  class: { empty: $options.slot.type === `` },
                  name: `wheel-slot${$options.slot.uuid}-type`,
                  required: "",
                  onChange: ($event) => $options.changeSlotType()
                }, [
                  createVNode("option", {
                    value: "",
                    disabled: ""
                  }, "Please select a slot type"),
                  (openBlock(true), createBlock(Fragment, null, renderList($data.slotTypes, (type) => {
                    return openBlock(), createBlock("option", {
                      key: type,
                      value: type
                    }, toDisplayString(type), 9, ["value"]);
                  }), 128))
                ], 42, ["onUpdate:modelValue", "name", "onChange"]), [
                  [vModelSelect, $options.slot.type]
                ])
              ]),
              _: 1
            }, 8, ["formstate", "custom-validators", "name"]),
            $options.slot.type !== `` ? (openBlock(), createBlock(resolveDynamicComponent(`WheelSlot${$options.slot.type}`), {
              key: 0,
              ref: "typeData",
              "wheel-slot": $options.slot,
              formstate: $props.formstate
            }, null, 8, ["wheel-slot", "formstate"])) : createCommentVNode("", true)
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
}
const _sfc_setup$n = _sfc_main$n.setup;
_sfc_main$n.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/EditorWheelSlot.vue");
  return _sfc_setup$n ? _sfc_setup$n(props, ctx) : void 0;
};
const __nuxt_component_0$1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$n, [["ssrRender", _sfc_ssrRender$n], ["__scopeId", "data-v-eddf8f73"]]), { __name: "EditorWheelSlot" });
const _sfc_main$m = {
  components: {
    EditorWheelSlot: __nuxt_component_0$1
  },
  props: {
    capability: objectProp().required,
    channel: objectProp().required,
    formstate: objectProp().optional
  },
  computed: {
    slotDetailNumbers() {
      const slotNumbers = [
        this.capability.typeData.slotNumber,
        this.capability.typeData.slotNumberStart,
        this.capability.typeData.slotNumberEnd
      ].filter((slotNumber) => typeof slotNumber === "number");
      if (slotNumbers.length === 0) {
        return [];
      }
      const min = Math.floor(Math.min(...slotNumbers));
      const max = Math.ceil(Math.max(...slotNumbers));
      const length = max - min + 1;
      const slotNumbersInRange = Array.from({ length }, (item, index) => min + index).filter((slotNumber) => slotNumber >= 1);
      if (slotNumbers.at(-1) < slotNumbers[0]) {
        slotNumbersInRange.reverse();
      }
      return slotNumbersInRange;
    }
  }
};
function _sfc_ssrRender$m(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_EditorWheelSlot = __nuxt_component_0$1;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-wheel-slots" }, _attrs))} data-v-32d1d91c><!--[-->`);
  ssrRenderList($options.slotDetailNumbers, (slotNumber) => {
    _push(ssrRenderComponent(_component_EditorWheelSlot, {
      key: slotNumber,
      channel: $props.channel,
      "slot-number": slotNumber,
      formstate: $props.formstate
    }, null, _parent));
  });
  _push(`<!--]--></div>`);
}
const _sfc_setup$m = _sfc_main$m.setup;
_sfc_main$m.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/EditorWheelSlots.vue");
  return _sfc_setup$m ? _sfc_setup$m(props, ctx) : void 0;
};
const __nuxt_component_2$2 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$m, [["ssrRender", _sfc_ssrRender$m], ["__scopeId", "data-v-32d1d91c"]]), { __name: "EditorWheelSlots" });
const _sfc_main$l = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    EditorWheelSlots: __nuxt_component_2$2,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    channel: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        slotNumber: "",
        slotNumberStart: null,
        slotNumberEnd: null,
        shakeSpeed: "",
        shakeSpeedStart: null,
        shakeSpeedEnd: null,
        shakeAngle: "",
        shakeAngleStart: null,
        shakeAngleEnd: null,
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$l(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_EditorWheelSlots = __nuxt_component_2$2;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-slotNumber`,
    label: "Slot number",
    hint: "Leave the slot number empty if this capability doesn't select a wheel slot, but only activates wheel shaking for a WheelSlot capability in another channel. Use 1.5 to indicate a wheel position halfway between slots 1 and 2.",
    style: { "display": "inline-block", "margin-bottom": "12px" }
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          "property-name": "slotNumber"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": "slotNumber"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-shakeSpeed`,
    label: "Shake speed"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          "property-name": "shakeSpeed"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": "shakeSpeed"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-shakeAngle`,
    label: "Shake angle"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          "property-name": "shakeAngle"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": "shakeAngle"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_EditorWheelSlots, {
    channel: $props.channel,
    capability: $props.capability,
    formstate: $props.formstate
  }, null, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$l = _sfc_main$l.setup;
_sfc_main$l.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityWheelShake.vue");
  return _sfc_setup$l ? _sfc_setup$l(props, ctx) : void 0;
};
const CapabilityWheelShake = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$l, [["ssrRender", _sfc_ssrRender$l]]), { __name: "EditorCapabilitiesCapabilityWheelShake" });
const _sfc_main$k = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    EditorWheelSlots: __nuxt_component_2$2,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    channel: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        slotNumber: "",
        slotNumberStart: null,
        slotNumberEnd: null,
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$k(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_EditorWheelSlots = __nuxt_component_2$2;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-slotNumber`,
    label: "Slot number",
    hint: "Use 1.5 to indicate a wheel position halfway between slots 1 and 2.",
    style: { "display": "inline-block", "margin-bottom": "12px" }
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "slotNumber"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "slotNumber"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_EditorWheelSlots, {
    channel: $props.channel,
    capability: $props.capability,
    formstate: $props.formstate
  }, null, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$k = _sfc_main$k.setup;
_sfc_main$k.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityWheelSlot.vue");
  return _sfc_setup$k ? _sfc_setup$k(props, ctx) : void 0;
};
const CapabilityWheelSlot = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$k, [["ssrRender", _sfc_ssrRender$k]]), { __name: "EditorCapabilitiesCapabilityWheelSlot" });
const _sfc_main$j = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    EditorWheelSlots: __nuxt_component_2$2,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    channel: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        slotNumber: "",
        slotNumberStart: null,
        slotNumberEnd: null,
        speedOrAngle: "speed",
        speed: "",
        speedStart: null,
        speedEnd: null,
        angle: "",
        angleStart: null,
        angleEnd: null,
        comment: ""
      }
    };
  },
  computed: {
    /**
     * Called from {@link EditorCapabilityTypeData}
     * @public
     * @returns {string[]} Array of all props to reset to default data when capability is saved.
     */
    resetProperties() {
      const resetProperty = this.capability.typeData.speedOrAngle === "speed" ? "angle" : "speed";
      return [resetProperty, `${resetProperty}Start`, `${resetProperty}End`];
    }
  },
  methods: {
    async changeSpeedOrAngle(newValue) {
      this.capability.typeData.speedOrAngle = newValue;
      await this.$nextTick();
      this.$refs.speedOrAngleInput.focus();
    }
  }
};
function _sfc_ssrRender$j(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_EditorWheelSlots = __nuxt_component_2$2;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-slotNumber`,
    label: "Slot number",
    hint: "Leave the slot number empty if this capability doesn't select a wheel slot, but only activates wheel slot rotation for a WheelSlot capability in another channel. Use 1.5 to indicate a wheel position halfway between slots 1 and 2.",
    style: { "display": "inline-block", "margin-bottom": "12px" }
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          "property-name": "slotNumber"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": "slotNumber"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-${$props.capability.typeData.speedOrAngle}`
  }, {
    label: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        if ($props.capability.typeData.speedOrAngle === `speed`) {
          _push2(`<!--[--> Speed / <a href="#angle" class="button secondary inline" title="Specify angle instead of speed"${_scopeId}>Angle</a><!--]-->`);
        } else {
          _push2(`<!--[--> Angle / <a href="#speed" class="button secondary inline" title="Specify speed instead of angle"${_scopeId}>Speed</a><!--]-->`);
        }
      } else {
        return [
          $props.capability.typeData.speedOrAngle === `speed` ? (openBlock(), createBlock(Fragment, { key: 0 }, [
            createTextVNode(" Speed / "),
            createVNode("a", {
              href: "#angle",
              class: "button secondary inline",
              title: "Specify angle instead of speed",
              onClick: withModifiers(($event) => $options.changeSpeedOrAngle(`angle`), ["prevent"])
            }, "Angle", 8, ["onClick"])
          ], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
            createTextVNode(" Angle / "),
            createVNode("a", {
              href: "#speed",
              class: "button secondary inline",
              title: "Specify speed instead of angle",
              onClick: withModifiers(($event) => $options.changeSpeedOrAngle(`speed`), ["prevent"])
            }, "Speed", 8, ["onClick"])
          ], 64))
        ];
      }
    }),
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        if ($props.capability.typeData.speedOrAngle) {
          _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
            ref: "speedOrAngleInput",
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": $props.capability.typeData.speedOrAngle,
            required: ""
          }, null, _parent2, _scopeId));
        } else {
          _push2(`<!---->`);
        }
      } else {
        return [
          $props.capability.typeData.speedOrAngle ? (openBlock(), createBlock(_component_EditorProportionalPropertySwitcher, {
            key: 0,
            ref: "speedOrAngleInput",
            capability: $props.capability,
            formstate: $props.formstate,
            "property-name": $props.capability.typeData.speedOrAngle,
            required: ""
          }, null, 8, ["capability", "formstate", "property-name"])) : createCommentVNode("", true)
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_EditorWheelSlots, {
    channel: $props.channel,
    capability: $props.capability,
    formstate: $props.formstate
  }, null, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$j = _sfc_main$j.setup;
_sfc_main$j.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityWheelSlotRotation.vue");
  return _sfc_setup$j ? _sfc_setup$j(props, ctx) : void 0;
};
const CapabilityWheelSlotRotation = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$j, [["ssrRender", _sfc_ssrRender$j]]), { __name: "EditorCapabilitiesCapabilityWheelSlotRotation" });
const _sfc_main$i = {
  components: {
    EditorProportionalPropertySwitcher: __nuxt_component_1$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  props: {
    capability: objectProp().required,
    formstate: objectProp().optional
  },
  data() {
    return {
      schemaDefinitions,
      /**
       * Used in {@link EditorCapabilityTypeData}
       * @public
       */
      defaultData: {
        angle: null,
        angleStart: "narrow",
        angleEnd: "wide",
        comment: ""
      }
    };
  }
};
function _sfc_ssrRender$i(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_EditorProportionalPropertySwitcher = __nuxt_component_1$1;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `capability${$props.capability.uuid}-angle`,
    label: "Angle"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorProportionalPropertySwitcher, {
          capability: $props.capability,
          formstate: $props.formstate,
          required: "",
          "property-name": "angle"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorProportionalPropertySwitcher, {
            capability: $props.capability,
            formstate: $props.formstate,
            required: "",
            "property-name": "angle"
          }, null, 8, ["capability", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-comment`,
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.capability.typeData.comment,
          "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
          formstate: $props.formstate,
          name: `capability${$props.capability.uuid}-comment`,
          "schema-property": $data.schemaDefinitions.nonEmptyString
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.capability.typeData.comment,
            "onUpdate:modelValue": ($event) => $props.capability.typeData.comment = $event,
            formstate: $props.formstate,
            name: `capability${$props.capability.uuid}-comment`,
            "schema-property": $data.schemaDefinitions.nonEmptyString
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$i = _sfc_main$i.setup;
_sfc_main$i.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/capabilities/CapabilityZoom.vue");
  return _sfc_setup$i ? _sfc_setup$i(props, ctx) : void 0;
};
const CapabilityZoom = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$i, [["ssrRender", _sfc_ssrRender$i]]), { __name: "EditorCapabilitiesCapabilityZoom" });
const _sfc_main$h = {
  components: {
    LabeledInput: __nuxt_component_2$3,
    CapabilityNoFunction,
    CapabilityShutterStrobe,
    CapabilityStrobeSpeed,
    CapabilityStrobeDuration,
    CapabilityIntensity,
    CapabilityColorIntensity,
    CapabilityColorPreset,
    CapabilityColorTemperature,
    CapabilityPan,
    CapabilityPanContinuous,
    CapabilityTilt,
    CapabilityTiltContinuous,
    CapabilityPanTiltSpeed,
    CapabilityWheelSlot,
    CapabilityWheelShake,
    CapabilityWheelSlotRotation,
    CapabilityWheelRotation,
    CapabilityEffect,
    CapabilityEffectSpeed,
    CapabilityEffectDuration,
    CapabilityEffectParameter,
    CapabilitySoundSensitivity,
    CapabilityBeamAngle,
    CapabilityBeamPosition,
    CapabilityFocus,
    CapabilityZoom,
    CapabilityIris,
    CapabilityIrisEffect,
    CapabilityFrost,
    CapabilityFrostEffect,
    CapabilityPrism,
    CapabilityPrismRotation,
    CapabilityBladeInsertion,
    CapabilityBladeRotation,
    CapabilityBladeSystemRotation,
    CapabilityFog,
    CapabilityFogOutput,
    CapabilityFogType,
    CapabilityRotation,
    CapabilitySpeed,
    CapabilityTime,
    CapabilityMaintenance,
    CapabilityGeneric
  },
  props: {
    capability: objectProp().required,
    channel: objectProp().required,
    formstate: objectProp().optional,
    required: booleanProp().withDefault(false)
  },
  data() {
    return {
      capabilityTypes: Object.keys(capabilityTypes),
      capabilityTypeHint: null
    };
  },
  watch: {
    async "capability.type"() {
      await this.$nextTick();
      const defaultData = this.$refs.capabilityTypeData.defaultData;
      for (const property of Object.keys(defaultData)) {
        if (!(property in this.capability.typeData)) {
          this.$set(this.capability.typeData, property, defaultData[property]);
        }
      }
      this.capabilityTypeHint = "hint" in this.$refs.capabilityTypeData ? this.$refs.capabilityTypeData.hint : null;
    }
  },
  methods: {
    /**
     * Called when the channel is saved. Removes all properties from capability.typeData that are not relevant for this capability type and sets open to false.
     * @public
     */
    cleanCapabilityData() {
      const component = this.$refs.capabilityTypeData;
      const defaultData = component.defaultData;
      for (const property of Object.keys(this.capability.typeData)) {
        if (!(property in defaultData)) {
          delete this.capability.typeData[property];
        }
      }
      if (component && "resetProperties" in component) {
        const resetProperties = component.resetProperties;
        for (const property of resetProperties) {
          const defaultPropertyData = defaultData[property];
          this.capability.typeData[property] = typeof defaultPropertyData === "string" ? "" : defaultPropertyData;
        }
      }
      this.capability.open = false;
    }
  }
};
function _sfc_ssrRender$h(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "editor-capability-type-data" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `capability${$props.capability.uuid}-type`,
    hint: $data.capabilityTypeHint,
    label: "Capability type"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<select class="${ssrRenderClass({ empty: $props.capability.type === `` })}"${ssrRenderAttr("name", `capability${$props.capability.uuid}-type`)}${ssrIncludeBooleanAttr($props.required) ? " required" : ""}${_scopeId}><option value="" disabled${ssrIncludeBooleanAttr(Array.isArray($props.capability.type) ? ssrLooseContain($props.capability.type, "") : ssrLooseEqual($props.capability.type, "")) ? " selected" : ""}${_scopeId}>Please select a capability type</option><!--[-->`);
        ssrRenderList($data.capabilityTypes, (type) => {
          _push2(`<option${ssrRenderAttr("value", type)}${ssrIncludeBooleanAttr(Array.isArray($props.capability.type) ? ssrLooseContain($props.capability.type, type) : ssrLooseEqual($props.capability.type, type)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(type)}</option>`);
        });
        _push2(`<!--]--></select>`);
      } else {
        return [
          withDirectives(createVNode("select", {
            "onUpdate:modelValue": ($event) => $props.capability.type = $event,
            class: { empty: $props.capability.type === `` },
            name: `capability${$props.capability.uuid}-type`,
            required: $props.required
          }, [
            createVNode("option", {
              value: "",
              disabled: ""
            }, "Please select a capability type"),
            (openBlock(true), createBlock(Fragment, null, renderList($data.capabilityTypes, (type) => {
              return openBlock(), createBlock("option", {
                key: type,
                value: type
              }, toDisplayString(type), 9, ["value"]);
            }), 128))
          ], 10, ["onUpdate:modelValue", "name", "required"]), [
            [vModelSelect, $props.capability.type]
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  if ($props.capability.type !== ``) {
    ssrRenderVNode(_push, createVNode(resolveDynamicComponent(`Capability${$props.capability.type}`), {
      ref: "capabilityTypeData",
      capability: $props.capability,
      channel: $props.channel,
      formstate: $props.formstate
    }, null), _parent);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup$h = _sfc_main$h.setup;
_sfc_main$h.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/EditorCapabilityTypeData.vue");
  return _sfc_setup$h ? _sfc_setup$h(props, ctx) : void 0;
};
const __nuxt_component_4$1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$h, [["ssrRender", _sfc_ssrRender$h]]), { __name: "EditorCapabilityTypeData" });
function replaceHashWithIndex(capabilityTypeData, index) {
  if ("effectName" in capabilityTypeData) {
    capabilityTypeData.effectName = capabilityTypeData.effectName.replace(/#/, index + 1);
  }
  if ("comment" in capabilityTypeData) {
    capabilityTypeData.comment = capabilityTypeData.comment.replace(/#/, index + 1);
  }
}
const _sfc_main$g = {
  components: {
    LabeledValue: __nuxt_component_1$3,
    EditorCapabilityTypeData: __nuxt_component_4$1
  },
  props: {
    channel: objectProp().required,
    resolution: numberProp().required,
    wizard: objectProp().required
  },
  emits: {
    close: (insertIndex) => true
  },
  computed: {
    capabilities() {
      return this.channel.capabilities;
    },
    /**
     * @returns {number} Maximum allowed DMX value.
     */
    dmxMax() {
      return Math.pow(256, this.resolution) - 1;
    },
    /**
     * @returns {number} Index in capabilities array where the generated capabilities need to be inserted.
     */
    insertIndex() {
      for (let index = this.capabilities.length - 1; index >= 0; index--) {
        if (this.capabilities[index].dmxRange !== null && this.capabilities[index].dmxRange[1] !== null && this.capabilities[index].dmxRange[1] < this.wizard.start) {
          return index + 1;
        }
      }
      return 0;
    },
    /**
     * @returns {object[]} Generated capabilities. An empty capability is prepended to fill the gap if neccessary.
     */
    computedCapabilites() {
      const capabilities = [];
      const previousCapability = this.capabilities[this.insertIndex - 1];
      if (!previousCapability && this.wizard.start > 0 || previousCapability && previousCapability.dmxRange !== null && this.wizard.start > previousCapability.dmxRange[1] + 1) {
        capabilities.push(getEmptyCapability());
      }
      for (let index = 0; index < this.wizard.count; index++) {
        const capability = getEmptyCapability();
        capability.dmxRange = [
          this.wizard.start + index * this.wizard.width,
          this.wizard.start + (index + 1) * this.wizard.width - 1
        ];
        capability.type = this.wizard.templateCapability.type;
        capability.typeData = structuredClone(this.wizard.templateCapability.typeData);
        replaceHashWithIndex(capability.typeData, index);
        capabilities.push(capability);
      }
      return capabilities;
    },
    /**
     * @returns {number} Number of (empty) capabilities to remove after the generated ones.
     */
    removeCount() {
      const nextCapability = this.capabilities[this.insertIndex];
      if (nextCapability && isCapabilityChanged(nextCapability)) {
        return 0;
      }
      if (this.end === this.dmxMax) {
        return 1;
      }
      const nextNonEmptyCapability = this.capabilities[this.insertIndex + 1];
      if (nextNonEmptyCapability && nextNonEmptyCapability.dmxRange !== null && this.end + 1 === nextNonEmptyCapability.dmxRange[0]) {
        return 1;
      }
      return 0;
    },
    /**
     * @returns {number} DMX value range end of the last generated capability.
     */
    end() {
      return this.computedCapabilites.length === 0 ? -1 : this.computedCapabilites.at(-1).dmxRange[1];
    },
    /**
     * @see {@link getCapabilityWithSource}
     * @returns {object[]} Array of all capabilities (generated and inherited), combined with their source.
     */
    allCapabilities() {
      const inheritedCapabilities = this.capabilities.map(
        (capability) => getCapabilityWithSource(capability, "inherited")
      );
      const computedCapabilites = this.computedCapabilites.map(
        (capability) => getCapabilityWithSource(capability, "computed")
      );
      inheritedCapabilities.splice(this.insertIndex, this.removeCount, ...computedCapabilites);
      return inheritedCapabilities.filter(
        (capability) => capability.dmxRange !== null
      );
    },
    /**
     * Performs validation of the user input.
     * @returns {string | null} A string with an validation error, or null if there is no error.
     */
    validationError() {
      if (this.wizard.start < 0) {
        return "Capabilities must not start below DMX value 0.";
      }
      if (this.wizard.width <= 0) {
        return "Capability width must be greater than zero.";
      }
      if (this.wizard.start % 1 !== 0 || this.wizard.width % 1 !== 0 || this.wizard.count % 1 !== 0) {
        return "Please only enter whole numbers.";
      }
      return null;
    },
    /**
     * @returns {string | null} A string with an error that prevents the generated capabilities from being saved, or null if there is no error.
     */
    error() {
      if (this.validationError) {
        return this.validationError;
      }
      if (this.end > this.dmxMax) {
        return `Capabilities must not end above DMX value ${this.dmxMax}.`;
      }
      const collisionDetected = this.capabilities.some((capability) => {
        if (capability.dmxRange === null) {
          return false;
        }
        const capabilityStart = capability.dmxRange[0] === null ? capability.dmxRange[1] : capability.dmxRange[0];
        const capabilityEnd = capability.dmxRange[1] === null ? capability.dmxRange[0] : capability.dmxRange[1];
        return capabilityEnd >= this.wizard.start && capabilityStart <= this.end;
      });
      if (collisionDetected) {
        return "Generated capabilities must not overlap with existing ones.";
      }
      return null;
    }
  },
  mounted() {
    if (this.$root._oflRestoreComplete) {
      this.$refs.firstInput.focus();
    }
    let lastOccupied = -1;
    for (let index = this.capabilities.length - 1; index >= 0; index--) {
      const capability = this.capabilities[index];
      if (capability.dmxRange === null) {
        continue;
      }
      if (capability.dmxRange[1] !== null) {
        lastOccupied = capability.dmxRange[1];
        break;
      }
      if (capability.dmxRange[0] !== null) {
        lastOccupied = capability.dmxRange[0];
        break;
      }
    }
    this.wizard.start = lastOccupied + 1;
  },
  methods: {
    /**
     * Applies the generated capabilities into the capabilities prop and emits a "close" event.
     */
    apply() {
      if (this.error) {
        return;
      }
      for (const capability of this.capabilities) {
        if (capability.type !== "") {
          capability.open = false;
        }
      }
      this.capabilities.splice(this.insertIndex, this.removeCount, ...this.computedCapabilites);
      this.$emit("close", this.insertIndex);
    }
  }
};
function getCapabilityWithSource(capability, source) {
  return { ...capability, source };
}
function _sfc_ssrRender$g(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledValue = __nuxt_component_1$3;
  const _component_EditorCapabilityTypeData = __nuxt_component_4$1;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "capability-wizard" }, _attrs))} data-v-700cd468><span data-v-700cd468>Generate multiple capabilities with same range width. Occurrences of &#39;#&#39; in text fields will be replaced by an increasing number.</span><section data-v-700cd468><label data-v-700cd468>`);
  _push(ssrRenderComponent(_component_LabeledValue, { label: "DMX start value" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<input${ssrRenderAttr("value", $props.wizard.start)}${ssrRenderAttr("max", $options.dmxMax)} type="number" min="0" step="1" data-v-700cd468${_scopeId}>`);
      } else {
        return [
          withDirectives(createVNode("input", {
            ref: "firstInput",
            "onUpdate:modelValue": ($event) => $props.wizard.start = $event,
            max: $options.dmxMax,
            type: "number",
            min: "0",
            step: "1"
          }, null, 8, ["onUpdate:modelValue", "max"]), [
            [
              vModelText,
              $props.wizard.start,
              void 0,
              { number: true }
            ]
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</label></section><section data-v-700cd468><label data-v-700cd468>`);
  _push(ssrRenderComponent(_component_LabeledValue, { label: "Range width" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<input${ssrRenderAttr("value", $props.wizard.width)}${ssrRenderAttr("max", $options.dmxMax)} type="number" min="1" step="1" data-v-700cd468${_scopeId}>`);
      } else {
        return [
          withDirectives(createVNode("input", {
            "onUpdate:modelValue": ($event) => $props.wizard.width = $event,
            max: $options.dmxMax,
            type: "number",
            min: "1",
            step: "1"
          }, null, 8, ["onUpdate:modelValue", "max"]), [
            [
              vModelText,
              $props.wizard.width,
              void 0,
              { number: true }
            ]
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</label></section><section data-v-700cd468><label data-v-700cd468>`);
  _push(ssrRenderComponent(_component_LabeledValue, { label: "Count" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<input${ssrRenderAttr("value", $props.wizard.count)}${ssrRenderAttr("max", $options.dmxMax)} type="number" min="1" step="1" data-v-700cd468${_scopeId}>`);
      } else {
        return [
          withDirectives(createVNode("input", {
            "onUpdate:modelValue": ($event) => $props.wizard.count = $event,
            max: $options.dmxMax,
            type: "number",
            min: "1",
            step: "1"
          }, null, 8, ["onUpdate:modelValue", "max"]), [
            [
              vModelText,
              $props.wizard.count,
              void 0,
              { number: true }
            ]
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</label></section>`);
  _push(ssrRenderComponent(_component_EditorCapabilityTypeData, {
    capability: $props.wizard.templateCapability,
    channel: $props.channel
  }, null, _parent));
  _push(`<table class="capabilities-table" data-v-700cd468><colgroup data-v-700cd468><col style="${ssrRenderStyle({ "width": "5.8ex" })}" data-v-700cd468><col style="${ssrRenderStyle({ "width": "1ex" })}" data-v-700cd468><col style="${ssrRenderStyle({ "width": "5.8ex" })}" data-v-700cd468><col data-v-700cd468></colgroup><thead data-v-700cd468><tr data-v-700cd468><th colspan="3" style="${ssrRenderStyle({ "text-align": "center" })}" data-v-700cd468>DMX values</th><th data-v-700cd468>Capability</th></tr></thead><tbody data-v-700cd468><!--[-->`);
  ssrRenderList($options.allCapabilities, (capability) => {
    _push(`<tr class="${ssrRenderClass(capability.source)}" data-v-700cd468><td class="capability-dmx-range-start" data-v-700cd468><code data-v-700cd468>${ssrInterpolate(capability.dmxRange[0])}</code></td><td class="capability-dmx-range-separator" data-v-700cd468><code data-v-700cd468>…</code></td><td class="capability-dmx-range-end" data-v-700cd468><code data-v-700cd468>${ssrInterpolate(capability.dmxRange[1])}</code></td><td class="capability-type" data-v-700cd468>${ssrInterpolate(capability.type)}</td></tr>`);
  });
  _push(`<!--]--></tbody></table>`);
  if ($options.error) {
    _push(`<span class="error-message" data-v-700cd468>${ssrInterpolate($options.error)}</span>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<div class="button-bar right" data-v-700cd468><button type="button"${ssrIncludeBooleanAttr($options.error || !$props.wizard.templateCapability.type) ? " disabled" : ""} class="restore primary" data-v-700cd468> Generate capabilities </button></div></div>`);
}
const _sfc_setup$g = _sfc_main$g.setup;
_sfc_main$g.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/EditorCapabilityWizard.vue");
  return _sfc_setup$g ? _sfc_setup$g(props, ctx) : void 0;
};
const __nuxt_component_6$1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$g, [["ssrRender", _sfc_ssrRender$g], ["__scopeId", "data-v-700cd468"]]), { __name: "EditorCapabilityWizard" });
const _sfc_main$f = {
  components: {
    PropertyInputNumber: __nuxt_component_3$1
  },
  props: {
    modelValue: arrayProp().withDefault(null),
    name: stringProp().required,
    startHint: stringProp().withDefault("start"),
    endHint: stringProp().withDefault("end"),
    rangeMin: numberProp().optional,
    rangeMax: numberProp().optional,
    schemaProperty: objectProp().required,
    unit: stringProp().optional,
    required: booleanProp().withDefault(false),
    formstate: objectProp().required
  },
  emits: {
    "update:modelValue": (range) => true,
    "start-updated": () => true,
    "end-updated": () => true,
    "focus": () => true,
    "blur": () => true,
    "vf:validate": (validationData) => true
  },
  data() {
    return {
      validationData: {
        "complete-range": "",
        "valid-range": ""
      }
    };
  },
  computed: {
    start: {
      get() {
        return this.modelValue ? this.modelValue[0] : null;
      },
      set(startInput) {
        this.$emit("update:modelValue", getRange(startInput, this.end));
        this.$emit("start-updated");
      }
    },
    end: {
      get() {
        return this.modelValue ? this.modelValue[1] : null;
      },
      set(endInput) {
        this.$emit("update:modelValue", getRange(this.start, endInput));
        this.$emit("end-updated");
      }
    },
    rangeIncomplete() {
      return this.modelValue && (this.start === null || this.end === null);
    }
  },
  mounted() {
    this.$emit("vf:validate", this.validationData);
  },
  methods: {
    /** @public */
    focus() {
      this.$refs.firstInput.focus();
    },
    onFocus(event) {
      this.$emit("focus");
    },
    onBlur(event) {
      if (!(event.target && event.relatedTarget) || event.target.closest(".range") !== event.relatedTarget.closest(".range")) {
        this.$emit("blur");
      }
    }
  }
};
function getRange(start, end) {
  if (start === null && end === null) {
    return null;
  }
  return [start, end];
}
function _sfc_ssrRender$f(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Validate = __nuxt_component_5;
  const _component_PropertyInputNumber = __nuxt_component_3$1;
  _push(`<span${ssrRenderAttrs(mergeProps({ class: "range" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_Validate, {
    state: $props.formstate,
    tag: "span"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputNumber, {
          ref: "firstInput",
          modelValue: $options.start,
          "onUpdate:modelValue": ($event) => $options.start = $event,
          name: `${$props.name}-start`,
          "schema-property": $props.schemaProperty.items,
          minimum: $props.rangeMin,
          maximum: $options.end === `invalid` ? $props.rangeMax : $options.end,
          required: $props.required || $options.rangeIncomplete,
          hint: $props.startHint,
          lazy: "",
          onFocus: ($event) => $options.onFocus($event),
          onBlur: ($event) => $options.onBlur($event)
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputNumber, {
            ref: "firstInput",
            modelValue: $options.start,
            "onUpdate:modelValue": ($event) => $options.start = $event,
            name: `${$props.name}-start`,
            "schema-property": $props.schemaProperty.items,
            minimum: $props.rangeMin,
            maximum: $options.end === `invalid` ? $props.rangeMax : $options.end,
            required: $props.required || $options.rangeIncomplete,
            hint: $props.startHint,
            lazy: "",
            onFocus: ($event) => $options.onFocus($event),
            onBlur: ($event) => $options.onBlur($event)
          }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property", "minimum", "maximum", "required", "hint", "onFocus", "onBlur"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(` … `);
  _push(ssrRenderComponent(_component_Validate, {
    state: $props.formstate,
    tag: "span"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputNumber, {
          modelValue: $options.end,
          "onUpdate:modelValue": ($event) => $options.end = $event,
          name: `${$props.name}-end`,
          "schema-property": $props.schemaProperty.items,
          minimum: $options.start === `invalid` ? $props.rangeMin : $options.start,
          maximum: $props.rangeMax,
          required: $props.required || $options.rangeIncomplete,
          hint: $props.endHint,
          lazy: "",
          onFocus: ($event) => $options.onFocus($event),
          onBlur: ($event) => $options.onBlur($event)
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputNumber, {
            modelValue: $options.end,
            "onUpdate:modelValue": ($event) => $options.end = $event,
            name: `${$props.name}-end`,
            "schema-property": $props.schemaProperty.items,
            minimum: $options.start === `invalid` ? $props.rangeMin : $options.start,
            maximum: $props.rangeMax,
            required: $props.required || $options.rangeIncomplete,
            hint: $props.endHint,
            lazy: "",
            onFocus: ($event) => $options.onFocus($event),
            onBlur: ($event) => $options.onBlur($event)
          }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property", "minimum", "maximum", "required", "hint", "onFocus", "onBlur"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(` ${ssrInterpolate($props.unit)}</span>`);
}
const _sfc_setup$f = _sfc_main$f.setup;
_sfc_main$f.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PropertyInputRange.vue");
  return _sfc_setup$f ? _sfc_setup$f(props, ctx) : void 0;
};
const __nuxt_component_6 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$f, [["ssrRender", _sfc_ssrRender$f]]), { __name: "PropertyInputRange" });
const _sfc_main$e = {
  components: {
    ConditionalDetails: __nuxt_component_3$2,
    EditorCapabilityTypeData: __nuxt_component_4$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputRange: __nuxt_component_6
  },
  props: {
    channel: objectProp().required,
    capabilityIndex: numberProp().required,
    resolution: numberProp().required,
    formstate: objectProp().required
  },
  emits: {
    "insert-capability-before": () => true,
    "insert-capability-after": () => true
  },
  data() {
    return {
      dmxMin: 0,
      capabilityDmxRange
    };
  },
  computed: {
    capabilities() {
      return this.channel.capabilities;
    },
    capability() {
      return this.capabilities[this.capabilityIndex];
    },
    dmxMax() {
      return Math.pow(256, this.resolution) - 1;
    },
    isChanged() {
      return this.capabilities.some(
        (capability) => isCapabilityChanged(capability)
      );
    },
    start() {
      return this.capability.dmxRange === null ? null : this.capability.dmxRange[0];
    },
    end() {
      return this.capability.dmxRange === null ? null : this.capability.dmxRange[1];
    },
    min() {
      let min = this.dmxMin;
      let index = this.capabilityIndex - 1;
      while (index >= 0) {
        const capability = this.capabilities[index];
        if (capability.dmxRange !== null) {
          if (capability.dmxRange[1]) {
            min = capability.dmxRange[1] + 1;
            break;
          }
          if (capability.dmxRange[0] !== null) {
            min = capability.dmxRange[0] + 1;
            break;
          }
        }
        index--;
      }
      return min;
    },
    max() {
      let max = this.dmxMax;
      let index = this.capabilityIndex + 1;
      while (index < this.capabilities.length) {
        const capability = this.capabilities[index];
        if (capability.dmxRange !== null) {
          if (capability.dmxRange[0] !== null) {
            max = capability.dmxRange[0] - 1;
            break;
          }
          if (capability.dmxRange[1] !== null) {
            max = capability.dmxRange[1] - 1;
            break;
          }
        }
        index++;
      }
      return max;
    }
  },
  methods: {
    onStartUpdated() {
      if (this.start === null) {
        const previousCapability2 = this.capabilities[this.capabilityIndex - 1];
        if (previousCapability2 && !isCapabilityChanged(previousCapability2)) {
          this.removePreviousCapability();
        }
        return;
      }
      const previousCapability = this.capabilities[this.capabilityIndex - 1];
      if (previousCapability) {
        if (isCapabilityChanged(previousCapability)) {
          if (this.start > this.min) {
            this.insertCapabilityBefore();
          }
          return;
        }
        if (this.start <= this.min) {
          this.removePreviousCapability();
        }
        return;
      }
      if (this.start > this.dmxMin) {
        this.insertCapabilityBefore();
      }
    },
    onEndUpdated() {
      if (this.end === null) {
        const nextCapability2 = this.capabilities[this.capabilityIndex + 1];
        if (nextCapability2 && !isCapabilityChanged(nextCapability2)) {
          this.removeNextCapability();
        }
        return;
      }
      const nextCapability = this.capabilities[this.capabilityIndex + 1];
      if (nextCapability) {
        if (isCapabilityChanged(nextCapability)) {
          if (this.end < this.max) {
            this.insertCapabilityAfter();
          }
          return;
        }
        if (this.end >= this.max) {
          this.removeNextCapability();
        }
        return;
      }
      if (this.end < this.dmxMax) {
        this.insertCapabilityAfter();
      }
    },
    clear() {
      const emptyCapability = getEmptyCapability();
      for (const property of Object.keys(emptyCapability)) {
        this.capability[property] = emptyCapability[property];
      }
      this.collapseWithNeighbors();
    },
    collapseWithNeighbors() {
      const previousCapability = this.capabilities[this.capabilityIndex - 1];
      const nextCapability = this.capabilities[this.capabilityIndex + 1];
      if (previousCapability && !isCapabilityChanged(previousCapability)) {
        if (nextCapability && !isCapabilityChanged(nextCapability)) {
          this.removePreviousCapability();
          this.removeCurrentCapability();
          return;
        }
        this.removePreviousCapability();
        return;
      }
      if (nextCapability && !isCapabilityChanged(nextCapability)) {
        this.removeNextCapability();
      }
    },
    async insertCapabilityBefore() {
      this.$emit("insert-capability-before");
      const dialog = this.$el.closest(".dialog");
      await this.$nextTick();
      const newCapability = dialog.querySelector(".capability-editor").children[this.capabilityIndex - 1];
      dialog.scrollTop += newCapability.clientHeight;
    },
    insertCapabilityAfter() {
      this.$emit("insert-capability-after");
    },
    removePreviousCapability() {
      this.$delete(this.capabilities, this.capabilityIndex - 1);
    },
    removeCurrentCapability() {
      this.$delete(this.capabilities, this.capabilityIndex);
    },
    removeNextCapability() {
      this.$delete(this.capabilities, this.capabilityIndex + 1);
    },
    /** @public */
    cleanCapabilityData() {
      if (this.capability.dmxRange === null) {
        this.capability.dmxRange = [null, null];
      }
      if (this.capability.dmxRange[0] === null) {
        this.capability.dmxRange[0] = this.min;
      }
      if (this.capability.dmxRange[1] === null) {
        this.capability.dmxRange[1] = this.max;
      }
      this.$refs.capabilityTypeData.cleanCapabilityData();
    },
    /** @public */
    focus() {
      this.$refs.firstInput.focus();
    }
  }
};
function _sfc_ssrRender$e(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_ConditionalDetails = __nuxt_component_3$2;
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_PropertyInputRange = __nuxt_component_6;
  const _component_OflSvg = __nuxt_component_1$1$1;
  const _component_EditorCapabilityTypeData = __nuxt_component_4$1;
  _push(ssrRenderComponent(_component_ConditionalDetails, mergeProps({
    open: $options.capability.open,
    class: "capability"
  }, _attrs), {
    summary: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(` DMX range <code class="${ssrRenderClass({ unset: $options.start === null })}" data-v-23169405${_scopeId}>${ssrInterpolate($options.start === null ? $options.min : $options.start)}</code> … <code class="${ssrRenderClass({ unset: $options.end === null })}" data-v-23169405${_scopeId}>${ssrInterpolate($options.end === null ? $options.max : $options.end)}</code>: <span class="${ssrRenderClass({ unset: $options.capability.type === `` })}" data-v-23169405${_scopeId}>${ssrInterpolate($options.capability.type || "Unset")}</span>`);
      } else {
        return [
          createTextVNode(" DMX range "),
          createVNode("code", {
            class: { unset: $options.start === null }
          }, toDisplayString($options.start === null ? $options.min : $options.start), 3),
          createTextVNode(" … "),
          createVNode("code", {
            class: { unset: $options.end === null }
          }, toDisplayString($options.end === null ? $options.max : $options.end), 3),
          createTextVNode(": "),
          createVNode("span", {
            class: { unset: $options.capability.type === `` }
          }, toDisplayString($options.capability.type || "Unset"), 3)
        ];
      }
    }),
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<div class="capability-content" data-v-23169405${_scopeId}>`);
        _push2(ssrRenderComponent(_component_LabeledInput, {
          formstate: $props.formstate,
          "multiple-inputs": "",
          name: `capability${$options.capability.uuid}-dmxRange`,
          label: "DMX range"
        }, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(ssrRenderComponent(_component_PropertyInputRange, {
                ref: "firstInput",
                modelValue: $options.capability.dmxRange,
                "onUpdate:modelValue": ($event) => $options.capability.dmxRange = $event,
                formstate: $props.formstate,
                name: `capability${$options.capability.uuid}-dmxRange`,
                "schema-property": $data.capabilityDmxRange,
                "range-min": $options.min,
                "range-max": $options.max,
                "start-hint": $options.capabilities.length === 1 ? `${$options.min}` : `start`,
                "end-hint": $options.capabilities.length === 1 ? `${$options.max}` : `end`,
                required: $options.capabilities.length > 1,
                onStartUpdated: ($event) => $options.onStartUpdated(),
                onEndUpdated: ($event) => $options.onEndUpdated()
              }, null, _parent3, _scopeId2));
            } else {
              return [
                createVNode(_component_PropertyInputRange, {
                  ref: "firstInput",
                  modelValue: $options.capability.dmxRange,
                  "onUpdate:modelValue": ($event) => $options.capability.dmxRange = $event,
                  formstate: $props.formstate,
                  name: `capability${$options.capability.uuid}-dmxRange`,
                  "schema-property": $data.capabilityDmxRange,
                  "range-min": $options.min,
                  "range-max": $options.max,
                  "start-hint": $options.capabilities.length === 1 ? `${$options.min}` : `start`,
                  "end-hint": $options.capabilities.length === 1 ? `${$options.max}` : `end`,
                  required: $options.capabilities.length > 1,
                  onStartUpdated: ($event) => $options.onStartUpdated(),
                  onEndUpdated: ($event) => $options.onEndUpdated()
                }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property", "range-min", "range-max", "start-hint", "end-hint", "required", "onStartUpdated", "onEndUpdated"])
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
        if ($options.isChanged) {
          _push2(`<button type="button" class="close icon-button" title="Remove capability" data-v-23169405${_scopeId}>`);
          _push2(ssrRenderComponent(_component_OflSvg, { name: "close" }, null, _parent2, _scopeId));
          _push2(`</button>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(ssrRenderComponent(_component_EditorCapabilityTypeData, {
          ref: "capabilityTypeData",
          capability: $options.capability,
          channel: $props.channel,
          formstate: $props.formstate,
          required: ""
        }, null, _parent2, _scopeId));
        _push2(`</div>`);
      } else {
        return [
          createVNode("div", { class: "capability-content" }, [
            createVNode(_component_LabeledInput, {
              formstate: $props.formstate,
              "multiple-inputs": "",
              name: `capability${$options.capability.uuid}-dmxRange`,
              label: "DMX range"
            }, {
              default: withCtx(() => [
                createVNode(_component_PropertyInputRange, {
                  ref: "firstInput",
                  modelValue: $options.capability.dmxRange,
                  "onUpdate:modelValue": ($event) => $options.capability.dmxRange = $event,
                  formstate: $props.formstate,
                  name: `capability${$options.capability.uuid}-dmxRange`,
                  "schema-property": $data.capabilityDmxRange,
                  "range-min": $options.min,
                  "range-max": $options.max,
                  "start-hint": $options.capabilities.length === 1 ? `${$options.min}` : `start`,
                  "end-hint": $options.capabilities.length === 1 ? `${$options.max}` : `end`,
                  required: $options.capabilities.length > 1,
                  onStartUpdated: ($event) => $options.onStartUpdated(),
                  onEndUpdated: ($event) => $options.onEndUpdated()
                }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate", "name", "schema-property", "range-min", "range-max", "start-hint", "end-hint", "required", "onStartUpdated", "onEndUpdated"])
              ]),
              _: 1
            }, 8, ["formstate", "name"]),
            $options.isChanged ? (openBlock(), createBlock("button", {
              key: 0,
              type: "button",
              class: "close icon-button",
              title: "Remove capability",
              onClick: withModifiers(($event) => $options.clear(), ["prevent"])
            }, [
              createVNode(_component_OflSvg, { name: "close" })
            ], 8, ["onClick"])) : createCommentVNode("", true),
            createVNode(_component_EditorCapabilityTypeData, {
              ref: "capabilityTypeData",
              capability: $options.capability,
              channel: $props.channel,
              formstate: $props.formstate,
              required: ""
            }, null, 8, ["capability", "channel", "formstate"])
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
}
const _sfc_setup$e = _sfc_main$e.setup;
_sfc_main$e.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/EditorCapability.vue");
  return _sfc_setup$e ? _sfc_setup$e(props, ctx) : void 0;
};
const __nuxt_component_7 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$e, [["ssrRender", _sfc_ssrRender$e], ["__scopeId", "data-v-23169405"]]), { __name: "EditorCapability" });
const _sfc_main$d = {
  props: {
    schemaProperty: objectProp().required,
    required: booleanProp().withDefault(false),
    additionHint: stringProp().optional,
    modelValue: anyProp().required
  },
  emits: {
    "update:modelValue": (value) => true
  },
  computed: {
    localValue: {
      get() {
        return this.modelValue;
      },
      set(newValue) {
        this.$emit("update:modelValue", newValue);
      }
    }
  },
  methods: {
    /** @public */
    focus() {
      this.$el.focus();
    }
  }
};
function _sfc_ssrRender$d(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<select${ssrRenderAttrs(mergeProps({
    required: $props.required,
    class: { empty: $props.modelValue === `` }
  }, _attrs))}><option${ssrIncludeBooleanAttr($props.required) ? " disabled" : ""} value=""${ssrIncludeBooleanAttr(Array.isArray($options.localValue) ? ssrLooseContain($options.localValue, "") : ssrLooseEqual($options.localValue, "")) ? " selected" : ""}>unknown</option><!--[-->`);
  ssrRenderList($props.schemaProperty.enum, (item) => {
    _push(`<option${ssrRenderAttr("value", item)}${ssrIncludeBooleanAttr(Array.isArray($options.localValue) ? ssrLooseContain($options.localValue, item) : ssrLooseEqual($options.localValue, item)) ? " selected" : ""}>${ssrInterpolate(item)}</option>`);
  });
  _push(`<!--]-->`);
  if ($props.additionHint) {
    _push(`<option value="[add-value]"${ssrIncludeBooleanAttr(Array.isArray($options.localValue) ? ssrLooseContain($options.localValue, "[add-value]") : ssrLooseEqual($options.localValue, "[add-value]")) ? " selected" : ""}>${ssrInterpolate($props.additionHint)}</option>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</select>`);
}
const _sfc_setup$d = _sfc_main$d.setup;
_sfc_main$d.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PropertyInputSelect.vue");
  return _sfc_setup$d ? _sfc_setup$d(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$d, [["ssrRender", _sfc_ssrRender$d]]), { __name: "PropertyInputSelect" });
const _sfc_main$c = {
  components: {
    A11yDialog: __nuxt_component_0$1$1,
    EditorCapability: __nuxt_component_7,
    EditorCapabilityWizard: __nuxt_component_6$1,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputBoolean: __nuxt_component_8,
    PropertyInputEntity: __nuxt_component_4$2,
    PropertyInputSelect: __nuxt_component_3,
    PropertyInputText
  },
  props: {
    channel: objectProp().required,
    fixture: objectProp().required
  },
  emits: {
    "channel-changed": () => true,
    "remove-channel": (channelId) => true,
    "reset-channel": () => true
  },
  data() {
    return {
      formstate: getEmptyFormState(),
      restored: false,
      channelChanged: false,
      channelProperties,
      singleColors: capabilityTypes.ColorIntensity.properties.color.enum,
      constants,
      selectedChannelUuids: []
    };
  },
  computed: {
    dmxMax() {
      return Math.pow(256, this.channel.dmxValueResolution) - 1;
    },
    currentMode() {
      const uuid = this.channel.modeId;
      const modeIndex = this.fixture.modes.findIndex((mode) => mode.uuid === uuid);
      return this.fixture.modes[modeIndex];
    },
    currentModeUnchosenChannelUuids() {
      return Object.keys(this.fixture.availableChannels).filter(
        (channelUuid) => !this.currentMode.channels.includes(channelUuid)
      );
    },
    currentModeUnchosenChannels() {
      return this.currentModeUnchosenChannelUuids.map((channelUuid) => ({
        inputId: `unchosen-channel-${channelUuid}`,
        uuid: channelUuid,
        name: this.getChannelName(channelUuid),
        showUuid: !this.isChannelNameUnique(channelUuid),
        isSelected: this.isChannelSelected(channelUuid)
      }));
    },
    selectedChannelUuidsString() {
      return this.selectedChannelUuids.join(",");
    },
    currentModeDisplayName() {
      let modeName = `#${this.fixture.modes.indexOf(this.currentMode) + 1}`;
      if (this.currentMode.shortName) {
        modeName = `"${this.currentMode.shortName}"`;
      } else if (this.currentMode.name) {
        modeName = `"${this.currentMode.name}"`;
      }
      return modeName;
    },
    title() {
      if (this.channel.editMode === "add-existing") {
        return `Add channel to mode ${this.currentModeDisplayName}`;
      }
      if (this.channel.editMode === "create") {
        return "Create new channel";
      }
      if (this.channel.editMode === "edit-duplicate") {
        return "Edit channel duplicate";
      }
      return "Edit channel";
    },
    areCapabilitiesChanged() {
      return this.channel.capabilities.some(
        (capability) => isCapabilityChanged(capability)
      );
    },
    submitButtonTitle() {
      if (this.channel.editMode === "add-existing") {
        const count = this.selectedChannelUuids.length;
        return count <= 1 ? "Add channel" : `Add ${count} channels`;
      }
      if (this.channel.editMode === "create") {
        return "Create channel";
      }
      return "Save changes";
    }
  },
  watch: {
    channel: {
      handler() {
        if (isChannelChanged(this.channel)) {
          this.$emit("channel-changed");
          this.channelChanged = true;
        }
      },
      deep: true
    }
  },
  methods: {
    setEditModeCreate() {
      this.channel.editMode = "create";
      this.channel.uuid = v4();
    },
    getChannelName(channelUuid) {
      const fixtureEditor2 = this.$parent;
      return fixtureEditor2.getChannelName(channelUuid);
    },
    isChannelNameUnique(channelUuid) {
      const fixtureEditor2 = this.$parent;
      return fixtureEditor2.isChannelNameUnique(channelUuid);
    },
    isChannelSelected(channelUuid) {
      return this.selectedChannelUuids.includes(channelUuid);
    },
    modeHasChannel(channelUuid) {
      return this.currentMode.channels.includes(channelUuid);
    },
    toggleChannelSelection(channelUuid) {
      if (this.isChannelSelected(channelUuid)) {
        this.deselectChannel(channelUuid);
      } else {
        this.selectChannel(channelUuid);
      }
      this.channelChanged = true;
    },
    deselectChannel(channelUuid) {
      const deselectedChannel = this.fixture.availableChannels[channelUuid];
      const isFineChannel = "coarseChannelId" in deselectedChannel;
      this.selectedChannelUuids = this.selectedChannelUuids.filter((uuid) => uuid !== channelUuid);
      if (isFineChannel) {
        this.selectedChannelUuids = this.selectedChannelUuids.filter((uuid) => {
          const channel = this.fixture.availableChannels[uuid];
          return !("coarseChannelId" in channel) || channel.coarseChannelId !== deselectedChannel.coarseChannelId || channel.resolution < deselectedChannel.resolution;
        });
        return;
      }
      this.selectedChannelUuids = this.selectedChannelUuids.filter((uuid) => {
        const channel = this.fixture.availableChannels[uuid];
        return !("coarseChannelId" in channel) || channel.coarseChannelId !== channelUuid;
      });
    },
    selectChannel(channelUuid) {
      if (this.isChannelSelected(channelUuid)) {
        return;
      }
      const selectedChannel = this.fixture.availableChannels[channelUuid];
      const isFineChannel = "coarseChannelId" in selectedChannel;
      if (!isFineChannel) {
        this.selectedChannelUuids.push(channelUuid);
        return;
      }
      const coarseChannelId = selectedChannel.coarseChannelId;
      if (!this.isChannelSelected(coarseChannelId) && !this.modeHasChannel(coarseChannelId)) {
        this.selectedChannelUuids.push(coarseChannelId);
      }
      const currentResolution = selectedChannel.resolution;
      for (const uuid of this.currentModeUnchosenChannelUuids) {
        const channel = this.fixture.availableChannels[uuid];
        if ("coarseChannelId" in channel && channel.coarseChannelId === coarseChannelId && channel.resolution < currentResolution && !this.isChannelSelected(uuid) && !this.modeHasChannel(uuid)) {
          this.selectedChannelUuids.push(uuid);
        }
      }
      this.selectedChannelUuids.push(channelUuid);
    },
    async onChannelDoubleClick(channelUuid) {
      if (!this.isChannelSelected(channelUuid)) {
        this.toggleChannelSelection(channelUuid);
      }
      if (this.selectedChannelUuids.some((uuid) => uuid !== channelUuid)) {
        return;
      }
      await this.$nextTick();
      this.onSubmit();
    },
    async onChannelDialogOpen() {
      if (this.restored) {
        this.restored = false;
        return;
      }
      if (this.channel.editMode === "add-existing" && this.currentModeUnchosenChannels.length === 0) {
        this.channel.editMode = "create";
      } else if (this.channel.editMode === "add-existing") {
        this.channel.uuid = "";
        this.selectedChannelUuids = [];
      } else if (this.channel.editMode === "edit-all" || this.channel.editMode === "edit-duplicate") {
        this.copyPropertiesFromChannel(this.fixture.availableChannels[this.channel.uuid]);
      }
      await this.$nextTick();
      this.channelChanged = false;
    },
    copyPropertiesFromChannel(channel) {
      for (const property of Object.keys(channel)) {
        this.channel[property] = structuredClone(channel[property]);
      }
    },
    async onChannelDialogClose() {
      if (this.channel.editMode === "") {
        return;
      }
      if (this.channelChanged && !(void 0).confirm("Do you want to lose the entered channel data?")) {
        await this.$nextTick();
        this.restored = true;
        this.$refs.channelDialog.show();
        return;
      }
      this.resetChannelForm();
    },
    onChannelNameChanged(channelName) {
      if (this.areCapabilitiesChanged || channelName === "") {
        return;
      }
      const capability = this.channel.capabilities[0];
      const matchingColor = this.singleColors.find(
        (color) => channelName.toLowerCase().includes(color.toLowerCase())
      );
      if (matchingColor) {
        capability.type = "ColorIntensity";
        capability.typeData.color = matchingColor;
        return;
      }
      const capabilityTypeSuggestions = {
        NoFunction: /^(?:no function|nothing|reserved)$/i,
        StrobeSpeed: /^(?:strobe speed|strobe rate)$/i,
        StrobeDuration: /^(?:strobe duration|flash duration)$/i,
        Intensity: /^(?:intensity|dimmer|master dimmer)$/i,
        ColorTemperature: /^(?:colou?r temperature(?: correction)?|ctc|cto|ctb)$/i,
        Pan: /^(?:pan|horizontal movement)$/i,
        Tilt: /^(?:tilt|vertical movement)$/i,
        PanTiltSpeed: /^(?:pan ?\/? ?tilt|movement) (?:speed|time|duration)$/i,
        WheelShake: /\bshake\b/i,
        WheelSlotRotation: /gobo ?\d* (?:rotation|index)/i,
        WheelRotation: /wheels? ?\d* (?:rotation|index)/i,
        WheelSlot: /wheel|dis[ck]|(?:gobos? ?\d*$)/i,
        EffectSpeed: /^(?:effect|program|macro) speed$/i,
        EffectDuration: /^(?:effect|program|macro) (?:time|duration)$/i,
        SoundSensitivity: /^(?:sound|mic|microphone) sensitivity$/i,
        Focus: /^focus$/i,
        Zoom: /^zoom$/i,
        Iris: /^iris$/i,
        Frost: /^frost$/i,
        Fog: /^(?:fog|haze)$/i,
        FogOutput: /^(?:fog (?:output|intensity|emission)|pump)$/i,
        Speed: /^.*?speed$/i,
        Time: /^.*?(?:time|duration)$/i
      };
      const matchingType = Object.keys(capabilityTypeSuggestions).find(
        (type) => capabilityTypeSuggestions[type].test(channelName)
      );
      if (matchingType) {
        capability.type = matchingType;
      }
    },
    onResolutionChanged() {
      if (this.channel.dmxValueResolution > this.channel.resolution) {
        this.channel.dmxValueResolution = this.channel.resolution;
      }
    },
    /**
     * Call onEndUpdated() on the last capability component with non-empty
     * DMX end value to add / remove an empty capability at the end.
     */
    async onDmxValueResolutionChanged() {
      await this.$nextTick();
      let index = this.channel.capabilities.length - 1;
      while (index >= 0) {
        const capability = this.channel.capabilities[index];
        if (capability.dmxRange !== null && capability.dmxRange[1] !== null && !this.channel.wizard.show) {
          this.$refs.capabilities[index].onEndUpdated();
          break;
        }
        index--;
      }
    },
    onSubmit() {
      if (this.channel.wizard.show) {
        return;
      }
      if (this.formstate.$invalid) {
        const invalidFields = (void 0).querySelectorAll("#channel-dialog .vf-field-invalid");
        for (let index = 0; index < invalidFields.length; index++) {
          const enclosingDetails = invalidFields[index].closest("details:not([open])");
          if (enclosingDetails) {
            enclosingDetails.open = true;
            index--;
          }
        }
        const scrollContainer = invalidFields[0].closest(".dialog");
        scrollIntoView(invalidFields[0], {
          time: 300,
          align: {
            top: 0,
            left: 0,
            topOffset: 100
          },
          isScrollable: (target) => target === scrollContainer
        }, () => invalidFields[0].focus());
        return;
      }
      for (const capability of this.$refs.capabilities) {
        capability.cleanCapabilityData();
      }
      const actions = {
        "create": this.saveCreatedChannel,
        "edit-all": this.saveEditedChannel,
        "edit-duplicate": this.saveDuplicatedChannel,
        "add-existing": this.addExistingChannel
      };
      if (this.channel.editMode in actions) {
        actions[this.channel.editMode]();
      }
      this.resetChannelForm();
    },
    saveCreatedChannel() {
      this.$set(this.fixture.availableChannels, this.channel.uuid, getSanitizedChannel(this.channel));
      this.currentMode.channels.push(this.channel.uuid);
      this.addFineChannels(this.channel, constants.RESOLUTION_16BIT, true);
    },
    saveEditedChannel() {
      const previousResolution = this.fixture.availableChannels[this.channel.uuid].resolution;
      this.fixture.availableChannels[this.channel.uuid] = getSanitizedChannel(this.channel);
      if (previousResolution > this.channel.resolution) {
        for (const channelId of Object.keys(this.fixture.availableChannels)) {
          const channel = this.fixture.availableChannels[channelId];
          if (channel.coarseChannelId === this.channel.uuid && channel.resolution > this.channel.resolution) {
            this.$emit("remove-channel", channelId);
          }
        }
      } else {
        this.addFineChannels(this.channel, previousResolution + 1, false);
      }
    },
    saveDuplicatedChannel() {
      const oldChannelKey = this.channel.uuid;
      const newChannelKey = v4();
      const newChannel = getSanitizedChannel(this.channel);
      newChannel.uuid = newChannelKey;
      this.$set(this.fixture.availableChannels, newChannelKey, newChannel);
      const fineChannelUuids = this.addFineChannels(newChannel, constants.RESOLUTION_16BIT, false);
      this.currentMode.channels = this.currentMode.channels.map((key) => {
        if (key === oldChannelKey) {
          return newChannelKey;
        }
        const oldFineChannel = this.fixture.availableChannels[key];
        if (oldFineChannel.coarseChannelId === oldChannelKey) {
          return fineChannelUuids[oldFineChannel.resolution];
        }
        return key;
      });
    },
    addExistingChannel() {
      for (const channelUuid of this.selectedChannelUuids) {
        if (!this.modeHasChannel(channelUuid)) {
          this.currentMode.channels.push(channelUuid);
        }
      }
      this.selectedChannelUuids = [];
    },
    /**
     * @param {object} coarseChannel The channel object of the coarse channel.
     * @param {number} offset At which resolution should be started.
     * @param {boolean} [addToMode] If true, the fine channel is pushed to the current mode's channels.
     * @returns {string[]} Array of added fine channel UUIDs (at the index of their resolution).
     */
    addFineChannels(coarseChannel, offset, addToMode) {
      const addedFineChannelUuids = [];
      for (let index = offset; index <= coarseChannel.resolution; index++) {
        const fineChannel = getEmptyFineChannel(coarseChannel.uuid, index);
        this.$set(this.fixture.availableChannels, fineChannel.uuid, getSanitizedChannel(fineChannel));
        addedFineChannelUuids[index] = fineChannel.uuid;
        if (addToMode) {
          this.currentMode.channels.push(fineChannel.uuid);
        }
      }
      return addedFineChannelUuids;
    },
    async resetChannelForm() {
      this.$emit("reset-channel");
      await this.$nextTick();
      this.formstate._reset();
    },
    /**
     * @param {boolean} show Whether to show or hide the Capability Wizard.
     */
    setWizardVisibility(show) {
      this.channel.wizard.show = show;
      if (!show) {
        this.onDmxValueResolutionChanged();
      }
    },
    async onWizardClose(insertIndex) {
      this.setWizardVisibility(false);
      await this.$nextTick();
      const firstNewCapability = this.$refs.capabilities[insertIndex];
      const scrollContainer = firstNewCapability.$el.closest(".dialog");
      scrollIntoView(firstNewCapability.$el, {
        time: 0,
        align: {
          top: 0,
          left: 0,
          topOffset: 100
        },
        isScrollable: (target) => target === scrollContainer
      }, () => firstNewCapability.focus());
    },
    openDetails() {
      for (const details of this.$el.querySelectorAll("details")) {
        details.open = true;
      }
    },
    closeDetails() {
      for (const details of this.$el.querySelectorAll("details")) {
        details.open = false;
      }
    },
    insertEmptyCapability(index) {
      this.channel.capabilities.splice(index, 0, getEmptyCapability());
    }
  }
};
function _sfc_ssrRender$c(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_A11yDialog = __nuxt_component_0$1$1;
  const _component_VueForm = __nuxt_component_1$2;
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_PropertyInputText = PropertyInputText;
  const _component_PropertyInputEntity = __nuxt_component_4$2;
  const _component_OflSvg = __nuxt_component_1$1$1;
  const _component_EditorCapabilityWizard = __nuxt_component_6$1;
  const _component_EditorCapability = __nuxt_component_7;
  const _component_PropertyInputBoolean = __nuxt_component_8;
  const _component_PropertyInputSelect = __nuxt_component_3;
  _push(ssrRenderComponent(_component_A11yDialog, mergeProps({
    id: "channel-dialog",
    ref: "channelDialog",
    shown: $props.channel.editMode !== `` && $props.channel.editMode !== `edit-?`,
    title: $options.title,
    class: `channel-dialog-${$props.channel.editMode}`,
    onShow: ($event) => $options.onChannelDialogOpen(),
    onHide: ($event) => $options.onChannelDialogClose()
  }, _attrs), {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_VueForm, {
          state: $data.formstate,
          action: "#",
          onSubmit: ($event) => $options.onSubmit()
        }, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              if ($props.channel.editMode === `add-existing`) {
                _push3(`<div class="existing-channel-input-container" data-v-f75270bc${_scopeId2}>`);
                _push3(ssrRenderComponent(_component_LabeledInput, {
                  formstate: $data.formstate,
                  name: "existingChannelUuid",
                  "multiple-inputs": ""
                }, {
                  default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                    if (_push4) {
                      _push4(`<input${ssrRenderAttr("value", $options.selectedChannelUuidsString)} name="existingChannelUuid" type="hidden" required data-v-f75270bc${_scopeId3}><fieldset class="channel-list" data-v-f75270bc${_scopeId3}><legend data-v-f75270bc${_scopeId3}>Select existing channel(s)</legend><!--[-->`);
                      ssrRenderList($options.currentModeUnchosenChannels, (item) => {
                        _push4(`<label${ssrRenderAttr("for", item.inputId)} class="channel-list-item" data-v-f75270bc${_scopeId3}><input${ssrRenderAttr("id", item.inputId)}${ssrIncludeBooleanAttr(item.isSelected) ? " checked" : ""} type="checkbox" class="channel-checkbox" data-v-f75270bc${_scopeId3}><span class="channel-name" data-v-f75270bc${_scopeId3}>${ssrInterpolate(item.name)}</span>`);
                        if (item.showUuid) {
                          _push4(`<code class="channel-uuid" data-v-f75270bc${_scopeId3}>${ssrInterpolate(item.uuid)}</code>`);
                        } else {
                          _push4(`<!---->`);
                        }
                        _push4(`</label>`);
                      });
                      _push4(`<!--]--></fieldset>`);
                    } else {
                      return [
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => $options.selectedChannelUuidsString = $event,
                          name: "existingChannelUuid",
                          type: "hidden",
                          required: ""
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, $options.selectedChannelUuidsString]
                        ]),
                        createVNode("fieldset", { class: "channel-list" }, [
                          createVNode("legend", null, "Select existing channel(s)"),
                          (openBlock(true), createBlock(Fragment, null, renderList($options.currentModeUnchosenChannels, (item) => {
                            return openBlock(), createBlock("label", {
                              key: item.uuid,
                              for: item.inputId,
                              class: "channel-list-item",
                              onDblclick: ($event) => $options.onChannelDoubleClick(item.uuid)
                            }, [
                              createVNode("input", {
                                id: item.inputId,
                                checked: item.isSelected,
                                type: "checkbox",
                                class: "channel-checkbox",
                                onChange: ($event) => $options.toggleChannelSelection(item.uuid)
                              }, null, 40, ["id", "checked", "onChange"]),
                              createVNode("span", { class: "channel-name" }, toDisplayString(item.name), 1),
                              item.showUuid ? (openBlock(), createBlock("code", {
                                key: 0,
                                class: "channel-uuid"
                              }, toDisplayString(item.uuid), 1)) : createCommentVNode("", true)
                            ], 40, ["for", "onDblclick"]);
                          }), 128))
                        ])
                      ];
                    }
                  }),
                  _: 1
                }, _parent3, _scopeId2));
                _push3(`<p data-v-f75270bc${_scopeId2}>or <a href="#create-channel" data-v-f75270bc${_scopeId2}>create a new channel</a></p></div>`);
              } else {
                _push3(`<div data-v-f75270bc${_scopeId2}>`);
                _push3(ssrRenderComponent(_component_LabeledInput, {
                  formstate: $data.formstate,
                  name: "name",
                  label: "Name"
                }, {
                  default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                    if (_push4) {
                      _push4(ssrRenderComponent(_component_PropertyInputText, {
                        modelValue: $props.channel.name,
                        "onUpdate:modelValue": ($event) => $props.channel.name = $event,
                        "schema-property": $data.channelProperties.name,
                        required: "",
                        name: "name",
                        "start-with-uppercase-or-number": "",
                        "no-fine-channel-name": "",
                        list: "channel-name-suggestions",
                        title: "Please start with an uppercase letter or a number. Don't create fine channels here, set its resolution below instead.",
                        class: "channelName",
                        onBlur: ($event) => $options.onChannelNameChanged($event)
                      }, null, _parent4, _scopeId3));
                    } else {
                      return [
                        createVNode(_component_PropertyInputText, {
                          modelValue: $props.channel.name,
                          "onUpdate:modelValue": ($event) => $props.channel.name = $event,
                          "schema-property": $data.channelProperties.name,
                          required: "",
                          name: "name",
                          "start-with-uppercase-or-number": "",
                          "no-fine-channel-name": "",
                          list: "channel-name-suggestions",
                          title: "Please start with an uppercase letter or a number. Don't create fine channels here, set its resolution below instead.",
                          class: "channelName",
                          onBlur: ($event) => $options.onChannelNameChanged($event)
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "schema-property", "onBlur"])
                      ];
                    }
                  }),
                  _: 1
                }, _parent3, _scopeId2));
                _push3(`<datalist id="channel-name-suggestions" hidden data-v-f75270bc${_scopeId2}><option data-v-f75270bc${_scopeId2}>Intensity</option><option data-v-f75270bc${_scopeId2}>Dimmer</option><option data-v-f75270bc${_scopeId2}>Shutter / Strobe</option><option data-v-f75270bc${_scopeId2}>Shutter</option><option data-v-f75270bc${_scopeId2}>Strobe</option><option data-v-f75270bc${_scopeId2}>Strobe Speed</option><option data-v-f75270bc${_scopeId2}>Strobe Duration</option><!--[-->`);
                ssrRenderList($data.singleColors, (color) => {
                  _push3(`<option data-v-f75270bc${_scopeId2}>${ssrInterpolate(color)}</option>`);
                });
                _push3(`<!--]--><option data-v-f75270bc${_scopeId2}>Color Macros</option><option data-v-f75270bc${_scopeId2}>Color Presets</option><option data-v-f75270bc${_scopeId2}>Color Wheel</option><option data-v-f75270bc${_scopeId2}>Color Wheel Rotation</option><option data-v-f75270bc${_scopeId2}>Color Temperature</option><option data-v-f75270bc${_scopeId2}>CTC</option><option data-v-f75270bc${_scopeId2}>CTO</option><option data-v-f75270bc${_scopeId2}>CTB</option><option data-v-f75270bc${_scopeId2}>Pan</option><option data-v-f75270bc${_scopeId2}>Tilt</option><option data-v-f75270bc${_scopeId2}>Pan/Tilt Speed</option><option data-v-f75270bc${_scopeId2}>Pan/Tilt Duration</option><option data-v-f75270bc${_scopeId2}>Effect Speed</option><option data-v-f75270bc${_scopeId2}>Program Speed</option><option data-v-f75270bc${_scopeId2}>Effect Duration</option><option data-v-f75270bc${_scopeId2}>Program Duration</option><option data-v-f75270bc${_scopeId2}>Sound Sensitivity</option><option data-v-f75270bc${_scopeId2}>Gobo Wheel</option><option data-v-f75270bc${_scopeId2}>Gobo Wheel Rotation</option><option data-v-f75270bc${_scopeId2}>Gobo Stencil Rotation</option><option data-v-f75270bc${_scopeId2}>Focus</option><option data-v-f75270bc${_scopeId2}>Zoom</option><option data-v-f75270bc${_scopeId2}>Iris</option><option data-v-f75270bc${_scopeId2}>Frost</option><option data-v-f75270bc${_scopeId2}>Prism</option><option data-v-f75270bc${_scopeId2}>Prism Rotation</option><option data-v-f75270bc${_scopeId2}>Blade Insertion</option><option data-v-f75270bc${_scopeId2}>Blade Rotation</option><option data-v-f75270bc${_scopeId2}>Blade System Rotation</option><option data-v-f75270bc${_scopeId2}>Fog</option><option data-v-f75270bc${_scopeId2}>Haze</option><option data-v-f75270bc${_scopeId2}>Fog Output</option><option data-v-f75270bc${_scopeId2}>Fog Intensity</option><option data-v-f75270bc${_scopeId2}>No function</option><option data-v-f75270bc${_scopeId2}>Reserved</option></datalist>`);
                _push3(ssrRenderComponent(_component_LabeledInput, {
                  formstate: $data.formstate,
                  name: "resolution",
                  label: "Channel resolution"
                }, {
                  default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                    if (_push4) {
                      _push4(`<select name="resolution" data-v-f75270bc${_scopeId3}><option${ssrRenderAttr("value", $data.constants.RESOLUTION_8BIT)} data-v-f75270bc${ssrIncludeBooleanAttr(Array.isArray($props.channel.resolution) ? ssrLooseContain($props.channel.resolution, $data.constants.RESOLUTION_8BIT) : ssrLooseEqual($props.channel.resolution, $data.constants.RESOLUTION_8BIT)) ? " selected" : ""}${_scopeId3}>8 bit (No fine channels)</option><option${ssrRenderAttr("value", $data.constants.RESOLUTION_16BIT)} data-v-f75270bc${ssrIncludeBooleanAttr(Array.isArray($props.channel.resolution) ? ssrLooseContain($props.channel.resolution, $data.constants.RESOLUTION_16BIT) : ssrLooseEqual($props.channel.resolution, $data.constants.RESOLUTION_16BIT)) ? " selected" : ""}${_scopeId3}>16 bit (1 fine channel)</option><option${ssrRenderAttr("value", $data.constants.RESOLUTION_24BIT)} data-v-f75270bc${ssrIncludeBooleanAttr(Array.isArray($props.channel.resolution) ? ssrLooseContain($props.channel.resolution, $data.constants.RESOLUTION_24BIT) : ssrLooseEqual($props.channel.resolution, $data.constants.RESOLUTION_24BIT)) ? " selected" : ""}${_scopeId3}>24 bit (2 fine channels)</option></select>`);
                    } else {
                      return [
                        withDirectives(createVNode("select", {
                          "onUpdate:modelValue": ($event) => $props.channel.resolution = $event,
                          name: "resolution",
                          onChange: ($event) => $options.onResolutionChanged()
                        }, [
                          createVNode("option", {
                            value: $data.constants.RESOLUTION_8BIT
                          }, "8 bit (No fine channels)", 8, ["value"]),
                          createVNode("option", {
                            value: $data.constants.RESOLUTION_16BIT
                          }, "16 bit (1 fine channel)", 8, ["value"]),
                          createVNode("option", {
                            value: $data.constants.RESOLUTION_24BIT
                          }, "24 bit (2 fine channels)", 8, ["value"])
                        ], 40, ["onUpdate:modelValue", "onChange"]), [
                          [vModelSelect, $props.channel.resolution]
                        ])
                      ];
                    }
                  }),
                  _: 1
                }, _parent3, _scopeId2));
                if ($props.channel.resolution > $data.constants.RESOLUTION_8BIT) {
                  _push3(ssrRenderComponent(_component_LabeledInput, {
                    formstate: $data.formstate,
                    name: "dmxValueResolution",
                    label: "DMX value resolution"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<select name="dmxValueResolution" required data-v-f75270bc${_scopeId3}><option${ssrRenderAttr("value", $data.constants.RESOLUTION_8BIT)} data-v-f75270bc${ssrIncludeBooleanAttr(Array.isArray($props.channel.dmxValueResolution) ? ssrLooseContain($props.channel.dmxValueResolution, $data.constants.RESOLUTION_8BIT) : ssrLooseEqual($props.channel.dmxValueResolution, $data.constants.RESOLUTION_8BIT)) ? " selected" : ""}${_scopeId3}>8 bit (range 0…255)</option>`);
                        if ($props.channel.resolution >= $data.constants.RESOLUTION_16BIT) {
                          _push4(`<option${ssrRenderAttr("value", $data.constants.RESOLUTION_16BIT)} data-v-f75270bc${ssrIncludeBooleanAttr(Array.isArray($props.channel.dmxValueResolution) ? ssrLooseContain($props.channel.dmxValueResolution, $data.constants.RESOLUTION_16BIT) : ssrLooseEqual($props.channel.dmxValueResolution, $data.constants.RESOLUTION_16BIT)) ? " selected" : ""}${_scopeId3}>16 bit (range 0…65535)</option>`);
                        } else {
                          _push4(`<!---->`);
                        }
                        if ($props.channel.resolution >= $data.constants.RESOLUTION_24BIT) {
                          _push4(`<option${ssrRenderAttr("value", $data.constants.RESOLUTION_24BIT)} data-v-f75270bc${ssrIncludeBooleanAttr(Array.isArray($props.channel.dmxValueResolution) ? ssrLooseContain($props.channel.dmxValueResolution, $data.constants.RESOLUTION_24BIT) : ssrLooseEqual($props.channel.dmxValueResolution, $data.constants.RESOLUTION_24BIT)) ? " selected" : ""}${_scopeId3}>24 bit (range 0…16777215)</option>`);
                        } else {
                          _push4(`<!---->`);
                        }
                        _push4(`</select>`);
                      } else {
                        return [
                          withDirectives(createVNode("select", {
                            "onUpdate:modelValue": ($event) => $props.channel.dmxValueResolution = $event,
                            name: "dmxValueResolution",
                            required: "",
                            onChange: ($event) => $options.onDmxValueResolutionChanged()
                          }, [
                            createVNode("option", {
                              value: $data.constants.RESOLUTION_8BIT
                            }, "8 bit (range 0…255)", 8, ["value"]),
                            $props.channel.resolution >= $data.constants.RESOLUTION_16BIT ? (openBlock(), createBlock("option", {
                              key: 0,
                              value: $data.constants.RESOLUTION_16BIT
                            }, "16 bit (range 0…65535)", 8, ["value"])) : createCommentVNode("", true),
                            $props.channel.resolution >= $data.constants.RESOLUTION_24BIT ? (openBlock(), createBlock("option", {
                              key: 1,
                              value: $data.constants.RESOLUTION_24BIT
                            }, "24 bit (range 0…16777215)", 8, ["value"])) : createCommentVNode("", true)
                          ], 40, ["onUpdate:modelValue", "onChange"]), [
                            [vModelSelect, $props.channel.dmxValueResolution]
                          ])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  _push3(`<!---->`);
                }
                _push3(ssrRenderComponent(_component_LabeledInput, {
                  formstate: $data.formstate,
                  "multiple-inputs": "",
                  name: "defaultValue",
                  label: "Default DMX value"
                }, {
                  default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                    if (_push4) {
                      _push4(ssrRenderComponent(_component_PropertyInputEntity, {
                        modelValue: $props.channel.defaultValue,
                        "onUpdate:modelValue": ($event) => $props.channel.defaultValue = $event,
                        "schema-property": $data.channelProperties.defaultValue,
                        "min-number": 0,
                        "max-number": typeof $props.channel.defaultValue === `string` ? 100 : $options.dmxMax,
                        wide: "",
                        name: "defaultValue"
                      }, null, _parent4, _scopeId3));
                    } else {
                      return [
                        createVNode(_component_PropertyInputEntity, {
                          modelValue: $props.channel.defaultValue,
                          "onUpdate:modelValue": ($event) => $props.channel.defaultValue = $event,
                          "schema-property": $data.channelProperties.defaultValue,
                          "min-number": 0,
                          "max-number": typeof $props.channel.defaultValue === `string` ? 100 : $options.dmxMax,
                          wide: "",
                          name: "defaultValue"
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "schema-property", "max-number"])
                      ];
                    }
                  }),
                  _: 1
                }, _parent3, _scopeId2));
                _push3(`<h3 data-v-f75270bc${_scopeId2}>Capabilities`);
                if (!$props.channel.wizard.show && $props.channel.capabilities.length > 1) {
                  _push3(`<!--[--><button type="button" class="icon-button expand-all" title="Expand all channels" data-v-f75270bc${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_OflSvg, { name: "chevron-double-down" }, null, _parent3, _scopeId2));
                  _push3(`</button><button type="button" class="icon-button collapse-all" title="Collapse all channels" data-v-f75270bc${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_OflSvg, { name: "chevron-double-up" }, null, _parent3, _scopeId2));
                  _push3(`</button><!--]-->`);
                } else {
                  _push3(`<!---->`);
                }
                _push3(`</h3>`);
                if ($props.channel.wizard.show) {
                  _push3(ssrRenderComponent(_component_EditorCapabilityWizard, {
                    wizard: $props.channel.wizard,
                    channel: $props.channel,
                    resolution: $props.channel.dmxValueResolution,
                    onClose: ($event) => $options.onWizardClose($event)
                  }, null, _parent3, _scopeId2));
                } else {
                  _push3(`<div class="capability-editor" data-v-f75270bc${_scopeId2}><!--[-->`);
                  ssrRenderList($props.channel.capabilities, (cap, index) => {
                    _push3(ssrRenderComponent(_component_EditorCapability, {
                      ref_for: true,
                      ref: "capabilities",
                      key: cap.uuid,
                      channel: $props.channel,
                      formstate: $data.formstate,
                      "capability-index": index,
                      resolution: $props.channel.dmxValueResolution,
                      onInsertCapabilityBefore: ($event) => $options.insertEmptyCapability(index),
                      onInsertCapabilityAfter: ($event) => $options.insertEmptyCapability(index + 1)
                    }, null, _parent3, _scopeId2));
                  });
                  _push3(`<!--]--></div>`);
                }
                _push3(`<section data-v-f75270bc${_scopeId2}><a href="#wizard" class="button secondary" data-v-f75270bc${_scopeId2}>`);
                _push3(ssrRenderComponent(_component_OflSvg, { name: "capability-wizard" }, null, _parent3, _scopeId2));
                _push3(` ${ssrInterpolate($props.channel.wizard.show ? "Close" : "Open")} Capability Wizard </a></section><h3 data-v-f75270bc${_scopeId2}>Advanced channel settings</h3>`);
                _push3(ssrRenderComponent(_component_LabeledInput, {
                  formstate: $data.formstate,
                  "multiple-inputs": "",
                  name: "highlightValue",
                  label: "Highlight DMX value"
                }, {
                  default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                    if (_push4) {
                      _push4(ssrRenderComponent(_component_PropertyInputEntity, {
                        modelValue: $props.channel.highlightValue,
                        "onUpdate:modelValue": ($event) => $props.channel.highlightValue = $event,
                        "schema-property": $data.channelProperties.highlightValue,
                        "min-number": 0,
                        "max-number": typeof $props.channel.highlightValue === `string` ? 100 : $options.dmxMax,
                        wide: "",
                        name: "highlightValue"
                      }, null, _parent4, _scopeId3));
                    } else {
                      return [
                        createVNode(_component_PropertyInputEntity, {
                          modelValue: $props.channel.highlightValue,
                          "onUpdate:modelValue": ($event) => $props.channel.highlightValue = $event,
                          "schema-property": $data.channelProperties.highlightValue,
                          "min-number": 0,
                          "max-number": typeof $props.channel.highlightValue === `string` ? 100 : $options.dmxMax,
                          wide: "",
                          name: "highlightValue"
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "schema-property", "max-number"])
                      ];
                    }
                  }),
                  _: 1
                }, _parent3, _scopeId2));
                _push3(ssrRenderComponent(_component_LabeledInput, {
                  formstate: $data.formstate,
                  name: "constant",
                  label: "Constant?"
                }, {
                  default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                    if (_push4) {
                      _push4(ssrRenderComponent(_component_PropertyInputBoolean, {
                        modelValue: $props.channel.constant,
                        "onUpdate:modelValue": ($event) => $props.channel.constant = $event,
                        name: "constant",
                        label: "Channel is fixed to default DMX value"
                      }, null, _parent4, _scopeId3));
                    } else {
                      return [
                        createVNode(_component_PropertyInputBoolean, {
                          modelValue: $props.channel.constant,
                          "onUpdate:modelValue": ($event) => $props.channel.constant = $event,
                          name: "constant",
                          label: "Channel is fixed to default DMX value"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ];
                    }
                  }),
                  _: 1
                }, _parent3, _scopeId2));
                _push3(ssrRenderComponent(_component_LabeledInput, {
                  formstate: $data.formstate,
                  name: "precedence",
                  label: "Precedence"
                }, {
                  default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                    if (_push4) {
                      _push4(ssrRenderComponent(_component_PropertyInputSelect, {
                        modelValue: $props.channel.precedence,
                        "onUpdate:modelValue": ($event) => $props.channel.precedence = $event,
                        "schema-property": $data.channelProperties.precedence,
                        name: "precedence"
                      }, null, _parent4, _scopeId3));
                    } else {
                      return [
                        createVNode(_component_PropertyInputSelect, {
                          modelValue: $props.channel.precedence,
                          "onUpdate:modelValue": ($event) => $props.channel.precedence = $event,
                          "schema-property": $data.channelProperties.precedence,
                          name: "precedence"
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "schema-property"])
                      ];
                    }
                  }),
                  _: 1
                }, _parent3, _scopeId2));
                _push3(`</div>`);
              }
              _push3(`<div class="button-bar right" data-v-f75270bc${_scopeId2}><button${ssrIncludeBooleanAttr($props.channel.wizard.show) ? " disabled" : ""} type="submit" class="primary" data-v-f75270bc${_scopeId2}>${ssrInterpolate($options.submitButtonTitle)}</button></div>`);
            } else {
              return [
                $props.channel.editMode === `add-existing` ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "existing-channel-input-container"
                }, [
                  createVNode(_component_LabeledInput, {
                    formstate: $data.formstate,
                    name: "existingChannelUuid",
                    "multiple-inputs": ""
                  }, {
                    default: withCtx(() => [
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => $options.selectedChannelUuidsString = $event,
                        name: "existingChannelUuid",
                        type: "hidden",
                        required: ""
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, $options.selectedChannelUuidsString]
                      ]),
                      createVNode("fieldset", { class: "channel-list" }, [
                        createVNode("legend", null, "Select existing channel(s)"),
                        (openBlock(true), createBlock(Fragment, null, renderList($options.currentModeUnchosenChannels, (item) => {
                          return openBlock(), createBlock("label", {
                            key: item.uuid,
                            for: item.inputId,
                            class: "channel-list-item",
                            onDblclick: ($event) => $options.onChannelDoubleClick(item.uuid)
                          }, [
                            createVNode("input", {
                              id: item.inputId,
                              checked: item.isSelected,
                              type: "checkbox",
                              class: "channel-checkbox",
                              onChange: ($event) => $options.toggleChannelSelection(item.uuid)
                            }, null, 40, ["id", "checked", "onChange"]),
                            createVNode("span", { class: "channel-name" }, toDisplayString(item.name), 1),
                            item.showUuid ? (openBlock(), createBlock("code", {
                              key: 0,
                              class: "channel-uuid"
                            }, toDisplayString(item.uuid), 1)) : createCommentVNode("", true)
                          ], 40, ["for", "onDblclick"]);
                        }), 128))
                      ])
                    ]),
                    _: 1
                  }, 8, ["formstate"]),
                  createVNode("p", null, [
                    createTextVNode("or "),
                    createVNode("a", {
                      href: "#create-channel",
                      onClick: withModifiers(($event) => $options.setEditModeCreate(), ["prevent"])
                    }, "create a new channel", 8, ["onClick"])
                  ])
                ])) : (openBlock(), createBlock("div", { key: 1 }, [
                  createVNode(_component_LabeledInput, {
                    formstate: $data.formstate,
                    name: "name",
                    label: "Name"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_PropertyInputText, {
                        modelValue: $props.channel.name,
                        "onUpdate:modelValue": ($event) => $props.channel.name = $event,
                        "schema-property": $data.channelProperties.name,
                        required: "",
                        name: "name",
                        "start-with-uppercase-or-number": "",
                        "no-fine-channel-name": "",
                        list: "channel-name-suggestions",
                        title: "Please start with an uppercase letter or a number. Don't create fine channels here, set its resolution below instead.",
                        class: "channelName",
                        onBlur: ($event) => $options.onChannelNameChanged($event)
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "schema-property", "onBlur"])
                    ]),
                    _: 1
                  }, 8, ["formstate"]),
                  createVNode("datalist", {
                    id: "channel-name-suggestions",
                    hidden: ""
                  }, [
                    createVNode("option", null, "Intensity"),
                    createVNode("option", null, "Dimmer"),
                    createVNode("option", null, "Shutter / Strobe"),
                    createVNode("option", null, "Shutter"),
                    createVNode("option", null, "Strobe"),
                    createVNode("option", null, "Strobe Speed"),
                    createVNode("option", null, "Strobe Duration"),
                    (openBlock(true), createBlock(Fragment, null, renderList($data.singleColors, (color) => {
                      return openBlock(), createBlock("option", { key: color }, toDisplayString(color), 1);
                    }), 128)),
                    createVNode("option", null, "Color Macros"),
                    createVNode("option", null, "Color Presets"),
                    createVNode("option", null, "Color Wheel"),
                    createVNode("option", null, "Color Wheel Rotation"),
                    createVNode("option", null, "Color Temperature"),
                    createVNode("option", null, "CTC"),
                    createVNode("option", null, "CTO"),
                    createVNode("option", null, "CTB"),
                    createVNode("option", null, "Pan"),
                    createVNode("option", null, "Tilt"),
                    createVNode("option", null, "Pan/Tilt Speed"),
                    createVNode("option", null, "Pan/Tilt Duration"),
                    createVNode("option", null, "Effect Speed"),
                    createVNode("option", null, "Program Speed"),
                    createVNode("option", null, "Effect Duration"),
                    createVNode("option", null, "Program Duration"),
                    createVNode("option", null, "Sound Sensitivity"),
                    createVNode("option", null, "Gobo Wheel"),
                    createVNode("option", null, "Gobo Wheel Rotation"),
                    createVNode("option", null, "Gobo Stencil Rotation"),
                    createVNode("option", null, "Focus"),
                    createVNode("option", null, "Zoom"),
                    createVNode("option", null, "Iris"),
                    createVNode("option", null, "Frost"),
                    createVNode("option", null, "Prism"),
                    createVNode("option", null, "Prism Rotation"),
                    createVNode("option", null, "Blade Insertion"),
                    createVNode("option", null, "Blade Rotation"),
                    createVNode("option", null, "Blade System Rotation"),
                    createVNode("option", null, "Fog"),
                    createVNode("option", null, "Haze"),
                    createVNode("option", null, "Fog Output"),
                    createVNode("option", null, "Fog Intensity"),
                    createVNode("option", null, "No function"),
                    createVNode("option", null, "Reserved")
                  ]),
                  createVNode(_component_LabeledInput, {
                    formstate: $data.formstate,
                    name: "resolution",
                    label: "Channel resolution"
                  }, {
                    default: withCtx(() => [
                      withDirectives(createVNode("select", {
                        "onUpdate:modelValue": ($event) => $props.channel.resolution = $event,
                        name: "resolution",
                        onChange: ($event) => $options.onResolutionChanged()
                      }, [
                        createVNode("option", {
                          value: $data.constants.RESOLUTION_8BIT
                        }, "8 bit (No fine channels)", 8, ["value"]),
                        createVNode("option", {
                          value: $data.constants.RESOLUTION_16BIT
                        }, "16 bit (1 fine channel)", 8, ["value"]),
                        createVNode("option", {
                          value: $data.constants.RESOLUTION_24BIT
                        }, "24 bit (2 fine channels)", 8, ["value"])
                      ], 40, ["onUpdate:modelValue", "onChange"]), [
                        [vModelSelect, $props.channel.resolution]
                      ])
                    ]),
                    _: 1
                  }, 8, ["formstate"]),
                  $props.channel.resolution > $data.constants.RESOLUTION_8BIT ? (openBlock(), createBlock(_component_LabeledInput, {
                    key: 0,
                    formstate: $data.formstate,
                    name: "dmxValueResolution",
                    label: "DMX value resolution"
                  }, {
                    default: withCtx(() => [
                      withDirectives(createVNode("select", {
                        "onUpdate:modelValue": ($event) => $props.channel.dmxValueResolution = $event,
                        name: "dmxValueResolution",
                        required: "",
                        onChange: ($event) => $options.onDmxValueResolutionChanged()
                      }, [
                        createVNode("option", {
                          value: $data.constants.RESOLUTION_8BIT
                        }, "8 bit (range 0…255)", 8, ["value"]),
                        $props.channel.resolution >= $data.constants.RESOLUTION_16BIT ? (openBlock(), createBlock("option", {
                          key: 0,
                          value: $data.constants.RESOLUTION_16BIT
                        }, "16 bit (range 0…65535)", 8, ["value"])) : createCommentVNode("", true),
                        $props.channel.resolution >= $data.constants.RESOLUTION_24BIT ? (openBlock(), createBlock("option", {
                          key: 1,
                          value: $data.constants.RESOLUTION_24BIT
                        }, "24 bit (range 0…16777215)", 8, ["value"])) : createCommentVNode("", true)
                      ], 40, ["onUpdate:modelValue", "onChange"]), [
                        [vModelSelect, $props.channel.dmxValueResolution]
                      ])
                    ]),
                    _: 1
                  }, 8, ["formstate"])) : createCommentVNode("", true),
                  createVNode(_component_LabeledInput, {
                    formstate: $data.formstate,
                    "multiple-inputs": "",
                    name: "defaultValue",
                    label: "Default DMX value"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_PropertyInputEntity, {
                        modelValue: $props.channel.defaultValue,
                        "onUpdate:modelValue": ($event) => $props.channel.defaultValue = $event,
                        "schema-property": $data.channelProperties.defaultValue,
                        "min-number": 0,
                        "max-number": typeof $props.channel.defaultValue === `string` ? 100 : $options.dmxMax,
                        wide: "",
                        name: "defaultValue"
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "schema-property", "max-number"])
                    ]),
                    _: 1
                  }, 8, ["formstate"]),
                  createVNode("h3", null, [
                    createTextVNode("Capabilities"),
                    !$props.channel.wizard.show && $props.channel.capabilities.length > 1 ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                      createVNode("button", {
                        type: "button",
                        class: "icon-button expand-all",
                        title: "Expand all channels",
                        onClick: withModifiers(($event) => $options.openDetails(), ["prevent"])
                      }, [
                        createVNode(_component_OflSvg, { name: "chevron-double-down" })
                      ], 8, ["onClick"]),
                      createVNode("button", {
                        type: "button",
                        class: "icon-button collapse-all",
                        title: "Collapse all channels",
                        onClick: withModifiers(($event) => $options.closeDetails(), ["prevent"])
                      }, [
                        createVNode(_component_OflSvg, { name: "chevron-double-up" })
                      ], 8, ["onClick"])
                    ], 64)) : createCommentVNode("", true)
                  ]),
                  $props.channel.wizard.show ? (openBlock(), createBlock(_component_EditorCapabilityWizard, {
                    key: 1,
                    wizard: $props.channel.wizard,
                    channel: $props.channel,
                    resolution: $props.channel.dmxValueResolution,
                    onClose: ($event) => $options.onWizardClose($event)
                  }, null, 8, ["wizard", "channel", "resolution", "onClose"])) : (openBlock(), createBlock("div", {
                    key: 2,
                    class: "capability-editor"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList($props.channel.capabilities, (cap, index) => {
                      return openBlock(), createBlock(_component_EditorCapability, {
                        ref_for: true,
                        ref: "capabilities",
                        key: cap.uuid,
                        channel: $props.channel,
                        formstate: $data.formstate,
                        "capability-index": index,
                        resolution: $props.channel.dmxValueResolution,
                        onInsertCapabilityBefore: ($event) => $options.insertEmptyCapability(index),
                        onInsertCapabilityAfter: ($event) => $options.insertEmptyCapability(index + 1)
                      }, null, 8, ["channel", "formstate", "capability-index", "resolution", "onInsertCapabilityBefore", "onInsertCapabilityAfter"]);
                    }), 128))
                  ])),
                  createVNode("section", null, [
                    createVNode("a", {
                      href: "#wizard",
                      class: "button secondary",
                      onClick: withModifiers(($event) => $options.setWizardVisibility(!$props.channel.wizard.show), ["prevent"])
                    }, [
                      createVNode(_component_OflSvg, { name: "capability-wizard" }),
                      createTextVNode(" " + toDisplayString($props.channel.wizard.show ? "Close" : "Open") + " Capability Wizard ", 1)
                    ], 8, ["onClick"])
                  ]),
                  createVNode("h3", null, "Advanced channel settings"),
                  createVNode(_component_LabeledInput, {
                    formstate: $data.formstate,
                    "multiple-inputs": "",
                    name: "highlightValue",
                    label: "Highlight DMX value"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_PropertyInputEntity, {
                        modelValue: $props.channel.highlightValue,
                        "onUpdate:modelValue": ($event) => $props.channel.highlightValue = $event,
                        "schema-property": $data.channelProperties.highlightValue,
                        "min-number": 0,
                        "max-number": typeof $props.channel.highlightValue === `string` ? 100 : $options.dmxMax,
                        wide: "",
                        name: "highlightValue"
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "schema-property", "max-number"])
                    ]),
                    _: 1
                  }, 8, ["formstate"]),
                  createVNode(_component_LabeledInput, {
                    formstate: $data.formstate,
                    name: "constant",
                    label: "Constant?"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_PropertyInputBoolean, {
                        modelValue: $props.channel.constant,
                        "onUpdate:modelValue": ($event) => $props.channel.constant = $event,
                        name: "constant",
                        label: "Channel is fixed to default DMX value"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }, 8, ["formstate"]),
                  createVNode(_component_LabeledInput, {
                    formstate: $data.formstate,
                    name: "precedence",
                    label: "Precedence"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_PropertyInputSelect, {
                        modelValue: $props.channel.precedence,
                        "onUpdate:modelValue": ($event) => $props.channel.precedence = $event,
                        "schema-property": $data.channelProperties.precedence,
                        name: "precedence"
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "schema-property"])
                    ]),
                    _: 1
                  }, 8, ["formstate"])
                ])),
                createVNode("div", { class: "button-bar right" }, [
                  createVNode("button", {
                    disabled: $props.channel.wizard.show,
                    type: "submit",
                    class: "primary"
                  }, toDisplayString($options.submitButtonTitle), 9, ["disabled"])
                ])
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_VueForm, {
            state: $data.formstate,
            action: "#",
            onSubmit: withModifiers(($event) => $options.onSubmit(), ["prevent"])
          }, {
            default: withCtx(() => [
              $props.channel.editMode === `add-existing` ? (openBlock(), createBlock("div", {
                key: 0,
                class: "existing-channel-input-container"
              }, [
                createVNode(_component_LabeledInput, {
                  formstate: $data.formstate,
                  name: "existingChannelUuid",
                  "multiple-inputs": ""
                }, {
                  default: withCtx(() => [
                    withDirectives(createVNode("input", {
                      "onUpdate:modelValue": ($event) => $options.selectedChannelUuidsString = $event,
                      name: "existingChannelUuid",
                      type: "hidden",
                      required: ""
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vModelText, $options.selectedChannelUuidsString]
                    ]),
                    createVNode("fieldset", { class: "channel-list" }, [
                      createVNode("legend", null, "Select existing channel(s)"),
                      (openBlock(true), createBlock(Fragment, null, renderList($options.currentModeUnchosenChannels, (item) => {
                        return openBlock(), createBlock("label", {
                          key: item.uuid,
                          for: item.inputId,
                          class: "channel-list-item",
                          onDblclick: ($event) => $options.onChannelDoubleClick(item.uuid)
                        }, [
                          createVNode("input", {
                            id: item.inputId,
                            checked: item.isSelected,
                            type: "checkbox",
                            class: "channel-checkbox",
                            onChange: ($event) => $options.toggleChannelSelection(item.uuid)
                          }, null, 40, ["id", "checked", "onChange"]),
                          createVNode("span", { class: "channel-name" }, toDisplayString(item.name), 1),
                          item.showUuid ? (openBlock(), createBlock("code", {
                            key: 0,
                            class: "channel-uuid"
                          }, toDisplayString(item.uuid), 1)) : createCommentVNode("", true)
                        ], 40, ["for", "onDblclick"]);
                      }), 128))
                    ])
                  ]),
                  _: 1
                }, 8, ["formstate"]),
                createVNode("p", null, [
                  createTextVNode("or "),
                  createVNode("a", {
                    href: "#create-channel",
                    onClick: withModifiers(($event) => $options.setEditModeCreate(), ["prevent"])
                  }, "create a new channel", 8, ["onClick"])
                ])
              ])) : (openBlock(), createBlock("div", { key: 1 }, [
                createVNode(_component_LabeledInput, {
                  formstate: $data.formstate,
                  name: "name",
                  label: "Name"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_PropertyInputText, {
                      modelValue: $props.channel.name,
                      "onUpdate:modelValue": ($event) => $props.channel.name = $event,
                      "schema-property": $data.channelProperties.name,
                      required: "",
                      name: "name",
                      "start-with-uppercase-or-number": "",
                      "no-fine-channel-name": "",
                      list: "channel-name-suggestions",
                      title: "Please start with an uppercase letter or a number. Don't create fine channels here, set its resolution below instead.",
                      class: "channelName",
                      onBlur: ($event) => $options.onChannelNameChanged($event)
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "schema-property", "onBlur"])
                  ]),
                  _: 1
                }, 8, ["formstate"]),
                createVNode("datalist", {
                  id: "channel-name-suggestions",
                  hidden: ""
                }, [
                  createVNode("option", null, "Intensity"),
                  createVNode("option", null, "Dimmer"),
                  createVNode("option", null, "Shutter / Strobe"),
                  createVNode("option", null, "Shutter"),
                  createVNode("option", null, "Strobe"),
                  createVNode("option", null, "Strobe Speed"),
                  createVNode("option", null, "Strobe Duration"),
                  (openBlock(true), createBlock(Fragment, null, renderList($data.singleColors, (color) => {
                    return openBlock(), createBlock("option", { key: color }, toDisplayString(color), 1);
                  }), 128)),
                  createVNode("option", null, "Color Macros"),
                  createVNode("option", null, "Color Presets"),
                  createVNode("option", null, "Color Wheel"),
                  createVNode("option", null, "Color Wheel Rotation"),
                  createVNode("option", null, "Color Temperature"),
                  createVNode("option", null, "CTC"),
                  createVNode("option", null, "CTO"),
                  createVNode("option", null, "CTB"),
                  createVNode("option", null, "Pan"),
                  createVNode("option", null, "Tilt"),
                  createVNode("option", null, "Pan/Tilt Speed"),
                  createVNode("option", null, "Pan/Tilt Duration"),
                  createVNode("option", null, "Effect Speed"),
                  createVNode("option", null, "Program Speed"),
                  createVNode("option", null, "Effect Duration"),
                  createVNode("option", null, "Program Duration"),
                  createVNode("option", null, "Sound Sensitivity"),
                  createVNode("option", null, "Gobo Wheel"),
                  createVNode("option", null, "Gobo Wheel Rotation"),
                  createVNode("option", null, "Gobo Stencil Rotation"),
                  createVNode("option", null, "Focus"),
                  createVNode("option", null, "Zoom"),
                  createVNode("option", null, "Iris"),
                  createVNode("option", null, "Frost"),
                  createVNode("option", null, "Prism"),
                  createVNode("option", null, "Prism Rotation"),
                  createVNode("option", null, "Blade Insertion"),
                  createVNode("option", null, "Blade Rotation"),
                  createVNode("option", null, "Blade System Rotation"),
                  createVNode("option", null, "Fog"),
                  createVNode("option", null, "Haze"),
                  createVNode("option", null, "Fog Output"),
                  createVNode("option", null, "Fog Intensity"),
                  createVNode("option", null, "No function"),
                  createVNode("option", null, "Reserved")
                ]),
                createVNode(_component_LabeledInput, {
                  formstate: $data.formstate,
                  name: "resolution",
                  label: "Channel resolution"
                }, {
                  default: withCtx(() => [
                    withDirectives(createVNode("select", {
                      "onUpdate:modelValue": ($event) => $props.channel.resolution = $event,
                      name: "resolution",
                      onChange: ($event) => $options.onResolutionChanged()
                    }, [
                      createVNode("option", {
                        value: $data.constants.RESOLUTION_8BIT
                      }, "8 bit (No fine channels)", 8, ["value"]),
                      createVNode("option", {
                        value: $data.constants.RESOLUTION_16BIT
                      }, "16 bit (1 fine channel)", 8, ["value"]),
                      createVNode("option", {
                        value: $data.constants.RESOLUTION_24BIT
                      }, "24 bit (2 fine channels)", 8, ["value"])
                    ], 40, ["onUpdate:modelValue", "onChange"]), [
                      [vModelSelect, $props.channel.resolution]
                    ])
                  ]),
                  _: 1
                }, 8, ["formstate"]),
                $props.channel.resolution > $data.constants.RESOLUTION_8BIT ? (openBlock(), createBlock(_component_LabeledInput, {
                  key: 0,
                  formstate: $data.formstate,
                  name: "dmxValueResolution",
                  label: "DMX value resolution"
                }, {
                  default: withCtx(() => [
                    withDirectives(createVNode("select", {
                      "onUpdate:modelValue": ($event) => $props.channel.dmxValueResolution = $event,
                      name: "dmxValueResolution",
                      required: "",
                      onChange: ($event) => $options.onDmxValueResolutionChanged()
                    }, [
                      createVNode("option", {
                        value: $data.constants.RESOLUTION_8BIT
                      }, "8 bit (range 0…255)", 8, ["value"]),
                      $props.channel.resolution >= $data.constants.RESOLUTION_16BIT ? (openBlock(), createBlock("option", {
                        key: 0,
                        value: $data.constants.RESOLUTION_16BIT
                      }, "16 bit (range 0…65535)", 8, ["value"])) : createCommentVNode("", true),
                      $props.channel.resolution >= $data.constants.RESOLUTION_24BIT ? (openBlock(), createBlock("option", {
                        key: 1,
                        value: $data.constants.RESOLUTION_24BIT
                      }, "24 bit (range 0…16777215)", 8, ["value"])) : createCommentVNode("", true)
                    ], 40, ["onUpdate:modelValue", "onChange"]), [
                      [vModelSelect, $props.channel.dmxValueResolution]
                    ])
                  ]),
                  _: 1
                }, 8, ["formstate"])) : createCommentVNode("", true),
                createVNode(_component_LabeledInput, {
                  formstate: $data.formstate,
                  "multiple-inputs": "",
                  name: "defaultValue",
                  label: "Default DMX value"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_PropertyInputEntity, {
                      modelValue: $props.channel.defaultValue,
                      "onUpdate:modelValue": ($event) => $props.channel.defaultValue = $event,
                      "schema-property": $data.channelProperties.defaultValue,
                      "min-number": 0,
                      "max-number": typeof $props.channel.defaultValue === `string` ? 100 : $options.dmxMax,
                      wide: "",
                      name: "defaultValue"
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "schema-property", "max-number"])
                  ]),
                  _: 1
                }, 8, ["formstate"]),
                createVNode("h3", null, [
                  createTextVNode("Capabilities"),
                  !$props.channel.wizard.show && $props.channel.capabilities.length > 1 ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                    createVNode("button", {
                      type: "button",
                      class: "icon-button expand-all",
                      title: "Expand all channels",
                      onClick: withModifiers(($event) => $options.openDetails(), ["prevent"])
                    }, [
                      createVNode(_component_OflSvg, { name: "chevron-double-down" })
                    ], 8, ["onClick"]),
                    createVNode("button", {
                      type: "button",
                      class: "icon-button collapse-all",
                      title: "Collapse all channels",
                      onClick: withModifiers(($event) => $options.closeDetails(), ["prevent"])
                    }, [
                      createVNode(_component_OflSvg, { name: "chevron-double-up" })
                    ], 8, ["onClick"])
                  ], 64)) : createCommentVNode("", true)
                ]),
                $props.channel.wizard.show ? (openBlock(), createBlock(_component_EditorCapabilityWizard, {
                  key: 1,
                  wizard: $props.channel.wizard,
                  channel: $props.channel,
                  resolution: $props.channel.dmxValueResolution,
                  onClose: ($event) => $options.onWizardClose($event)
                }, null, 8, ["wizard", "channel", "resolution", "onClose"])) : (openBlock(), createBlock("div", {
                  key: 2,
                  class: "capability-editor"
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList($props.channel.capabilities, (cap, index) => {
                    return openBlock(), createBlock(_component_EditorCapability, {
                      ref_for: true,
                      ref: "capabilities",
                      key: cap.uuid,
                      channel: $props.channel,
                      formstate: $data.formstate,
                      "capability-index": index,
                      resolution: $props.channel.dmxValueResolution,
                      onInsertCapabilityBefore: ($event) => $options.insertEmptyCapability(index),
                      onInsertCapabilityAfter: ($event) => $options.insertEmptyCapability(index + 1)
                    }, null, 8, ["channel", "formstate", "capability-index", "resolution", "onInsertCapabilityBefore", "onInsertCapabilityAfter"]);
                  }), 128))
                ])),
                createVNode("section", null, [
                  createVNode("a", {
                    href: "#wizard",
                    class: "button secondary",
                    onClick: withModifiers(($event) => $options.setWizardVisibility(!$props.channel.wizard.show), ["prevent"])
                  }, [
                    createVNode(_component_OflSvg, { name: "capability-wizard" }),
                    createTextVNode(" " + toDisplayString($props.channel.wizard.show ? "Close" : "Open") + " Capability Wizard ", 1)
                  ], 8, ["onClick"])
                ]),
                createVNode("h3", null, "Advanced channel settings"),
                createVNode(_component_LabeledInput, {
                  formstate: $data.formstate,
                  "multiple-inputs": "",
                  name: "highlightValue",
                  label: "Highlight DMX value"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_PropertyInputEntity, {
                      modelValue: $props.channel.highlightValue,
                      "onUpdate:modelValue": ($event) => $props.channel.highlightValue = $event,
                      "schema-property": $data.channelProperties.highlightValue,
                      "min-number": 0,
                      "max-number": typeof $props.channel.highlightValue === `string` ? 100 : $options.dmxMax,
                      wide: "",
                      name: "highlightValue"
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "schema-property", "max-number"])
                  ]),
                  _: 1
                }, 8, ["formstate"]),
                createVNode(_component_LabeledInput, {
                  formstate: $data.formstate,
                  name: "constant",
                  label: "Constant?"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_PropertyInputBoolean, {
                      modelValue: $props.channel.constant,
                      "onUpdate:modelValue": ($event) => $props.channel.constant = $event,
                      name: "constant",
                      label: "Channel is fixed to default DMX value"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  _: 1
                }, 8, ["formstate"]),
                createVNode(_component_LabeledInput, {
                  formstate: $data.formstate,
                  name: "precedence",
                  label: "Precedence"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_PropertyInputSelect, {
                      modelValue: $props.channel.precedence,
                      "onUpdate:modelValue": ($event) => $props.channel.precedence = $event,
                      "schema-property": $data.channelProperties.precedence,
                      name: "precedence"
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "schema-property"])
                  ]),
                  _: 1
                }, 8, ["formstate"])
              ])),
              createVNode("div", { class: "button-bar right" }, [
                createVNode("button", {
                  disabled: $props.channel.wizard.show,
                  type: "submit",
                  class: "primary"
                }, toDisplayString($options.submitButtonTitle), 9, ["disabled"])
              ])
            ]),
            _: 1
          }, 8, ["state", "onSubmit"])
        ];
      }
    }),
    _: 1
  }, _parent));
}
const _sfc_setup$c = _sfc_main$c.setup;
_sfc_main$c.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/EditorChannelDialog.vue");
  return _sfc_setup$c ? _sfc_setup$c(props, ctx) : void 0;
};
const EditorChannelDialog = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$c, [["ssrRender", _sfc_ssrRender$c], ["__scopeId", "data-v-f75270bc"]]), { __name: "EditorChannelDialog" });
const _sfc_main$b = {
  components: {
    A11yDialog: __nuxt_component_0$1$1
  },
  props: {
    channel: objectProp().required,
    fixture: objectProp().required
  },
  methods: {
    onChooseChannelEditModeDialogOpen() {
      const channelUsedElsewhere = this.fixture.modes.some(
        (mode) => mode.uuid !== this.channel.modeId && mode.channels.includes(this.channel.uuid)
      );
      if (channelUsedElsewhere) {
        return;
      }
      this.chooseChannelEditMode("edit-all");
    },
    async chooseChannelEditMode(editMode) {
      this.channel.editMode = "";
      await this.$nextTick();
      this.channel.editMode = editMode;
    }
  }
};
function _sfc_ssrRender$b(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_A11yDialog = __nuxt_component_0$1$1;
  _push(ssrRenderComponent(_component_A11yDialog, mergeProps({
    id: "choose-channel-edit-mode-dialog",
    "is-alert-dialog": "",
    shown: $props.channel.editMode === `edit-?`,
    title: "Edit channel in all modes or just in this one?",
    onShow: ($event) => $options.onChooseChannelEditModeDialogOpen()
  }, _attrs), {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<div class="button-bar right"${_scopeId}><button type="submit" class="secondary"${_scopeId}> Only in this mode </button><button type="submit" class="primary"${_scopeId}> In all modes </button></div>`);
      } else {
        return [
          createVNode("div", { class: "button-bar right" }, [
            createVNode("button", {
              type: "submit",
              class: "secondary",
              onClick: withModifiers(($event) => $options.chooseChannelEditMode(`edit-duplicate`), ["prevent"])
            }, " Only in this mode ", 8, ["onClick"]),
            createVNode("button", {
              type: "submit",
              class: "primary",
              onClick: withModifiers(($event) => $options.chooseChannelEditMode(`edit-all`), ["prevent"])
            }, " In all modes ", 8, ["onClick"])
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
}
const _sfc_setup$b = _sfc_main$b.setup;
_sfc_main$b.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/EditorChooseChannelEditModeDialog.vue");
  return _sfc_setup$b ? _sfc_setup$b(props, ctx) : void 0;
};
const EditorChooseChannelEditModeDialog = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$b, [["ssrRender", _sfc_ssrRender$b]]), { __name: "EditorChooseChannelEditModeDialog" });
const _sfc_main$a = {
  components: {
    Draggable,
    CategoryBadge: __nuxt_component_1$1$2
  },
  props: {
    modelValue: arrayProp().required,
    allCategories: arrayProp().required
  },
  emits: {
    "update:modelValue": (value) => true,
    focus: () => true,
    blur: () => true
  },
  computed: {
    selectedCategories: {
      get() {
        return this.modelValue;
      },
      set(newSelectedCategories) {
        this.$emit("update:modelValue", newSelectedCategories);
      }
    },
    unselectedCategories() {
      return this.allCategories.filter(
        (category) => !this.modelValue.includes(category)
      );
    }
  },
  methods: {
    select(selectedCategory) {
      const updatedCategoryList = [...this.modelValue, selectedCategory];
      this.$emit("update:modelValue", updatedCategoryList);
      this.onBlur();
    },
    deselect(deselectedCategory) {
      const updatedCategoryList = this.modelValue.filter((category) => category !== deselectedCategory);
      this.$emit("update:modelValue", updatedCategoryList);
      this.onBlur();
    },
    onFocus() {
      this.$emit("focus");
    },
    onBlur(event) {
      if (!(event && event.target && event.relatedTarget) || event.target.parentNode !== event.relatedTarget.parentNode) {
        this.$emit("blur");
      }
    }
  }
};
function _sfc_ssrRender$a(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Draggable = resolveComponent("Draggable");
  const _component_CategoryBadge = __nuxt_component_1$1$2;
  _push(`<div${ssrRenderAttrs(_attrs)}>`);
  _push(ssrRenderComponent(_component_Draggable, {
    modelValue: $options.selectedCategories,
    "onUpdate:modelValue": ($event) => $options.selectedCategories = $event,
    "item-key": ".",
    tag: "span"
  }, {
    item: withCtx(({ element: cat }, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_CategoryBadge, {
          category: cat,
          selected: "",
          selectable: "",
          onClick: ($event) => $options.deselect(cat),
          onFocus: ($event) => $options.onFocus(),
          onBlur: ($event) => $options.onBlur($event)
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_CategoryBadge, {
            category: cat,
            selected: "",
            selectable: "",
            onClick: ($event) => $options.deselect(cat),
            onFocus: ($event) => $options.onFocus(),
            onBlur: ($event) => $options.onBlur($event)
          }, null, 8, ["category", "onClick", "onFocus", "onBlur"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`<!--[-->`);
  ssrRenderList($options.unselectedCategories, (cat) => {
    _push(ssrRenderComponent(_component_CategoryBadge, {
      key: cat,
      category: cat,
      selectable: "",
      onClick: ($event) => $options.select(cat),
      onFocus: ($event) => $options.onFocus(),
      onBlur: ($event) => $options.onBlur($event)
    }, null, _parent));
  });
  _push(`<!--]--></div>`);
}
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/EditorCategoryChooser.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const __nuxt_component_2$1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$a, [["ssrRender", _sfc_ssrRender$a]]), { __name: "EditorCategoryChooser" });
const _sfc_main$9 = {
  props: {
    schemaProperty: objectProp().required,
    required: booleanProp().withDefault(false),
    hint: stringProp().optional,
    modelValue: anyProp().required
  },
  emits: {
    "update:modelValue": (value) => true,
    "vf:validate": (validationData) => true
  },
  data() {
    return {
      localValue: ""
    };
  },
  computed: {
    /**
     * @public
     * @returns {Record<string, string | null>} Validation data for vue-form
     */
    validationData() {
      return {
        minlength: "minLength" in this.schemaProperty ? `${this.schemaProperty.minLength}` : null,
        maxlength: "maxLength" in this.schemaProperty ? `${this.schemaProperty.maxLength}` : null
      };
    }
  },
  watch: {
    modelValue: {
      handler(newValue) {
        this.localValue = newValue ? String(newValue) : "";
      },
      immediate: true
    },
    validationData: {
      handler(newValidationData) {
        this.$emit("vf:validate", newValidationData);
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    /** @public */
    focus() {
      this.$el.focus();
    },
    update() {
      this.$emit("update:modelValue", this.localValue);
    }
  }
};
function _sfc_ssrRender$9(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<textarea${ssrRenderAttrs(mergeProps({
    required: $props.required,
    placeholder: $props.hint,
    minlength: $props.schemaProperty.minLength,
    maxlength: $props.schemaProperty.maxLength
  }, _attrs), "textarea")}>${ssrInterpolate($data.localValue)}</textarea>`);
}
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PropertyInputTextarea.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$9, [["ssrRender", _sfc_ssrRender$9]]), { __name: "PropertyInputTextarea" });
const placeholders = {
  manual: "e.g. https://example.org/fixture/manual.pdf",
  productPage: "e.g. https://example.org/fixture",
  video: "e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  other: "e.g. https://example.org/relevant-page"
};
const _sfc_main$8 = {
  components: {
    PropertyInputText
  },
  props: {
    link: objectProp().required,
    canRemove: booleanProp().required,
    formstate: objectProp().required
  },
  emits: {
    "set-type": (type) => true,
    "set-url": (url) => true,
    "remove": () => true
  },
  data() {
    const { linkTypeIconNames, linkTypeNames } = fixtureLinkTypes;
    return {
      schemaDefinitions,
      linkTypes: Object.keys(linksProperties),
      linkTypeIconNames,
      linkTypeNames
    };
  },
  computed: {
    type: {
      get() {
        return this.link.type;
      },
      set(type) {
        this.$emit("set-type", type);
      }
    },
    url: {
      get() {
        return this.link.url;
      },
      set(url) {
        this.$emit("set-url", url);
      }
    },
    placeholder() {
      return placeholders[this.type];
    }
  },
  methods: {
    /** @public */
    focus() {
      this.$refs.linkTypeSelect.focus();
    }
  }
};
function _sfc_ssrRender$8(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_OflSvg = __nuxt_component_1$1$1;
  const _component_Validate = __nuxt_component_5;
  const _component_PropertyInputText = PropertyInputText;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "link-row" }, _attrs))} data-v-060fb75f><select data-v-060fb75f><!--[-->`);
  ssrRenderList($data.linkTypes, (linkType) => {
    _push(`<option${ssrRenderAttr("value", linkType)} data-v-060fb75f${ssrIncludeBooleanAttr(Array.isArray($options.type) ? ssrLooseContain($options.type, linkType) : ssrLooseEqual($options.type, linkType)) ? " selected" : ""}>${ssrInterpolate($data.linkTypeNames[linkType])}</option>`);
  });
  _push(`<!--]--></select>`);
  _push(ssrRenderComponent(_component_OflSvg, {
    name: $data.linkTypeIconNames[$props.link.type]
  }, null, _parent));
  _push(ssrRenderComponent(_component_Validate, {
    state: $props.formstate,
    tag: "span"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $options.url,
          "onUpdate:modelValue": ($event) => $options.url = $event,
          name: `links-${$props.link.uuid}`,
          "schema-property": $data.schemaDefinitions.urlString,
          type: "url",
          hint: $options.placeholder,
          required: ""
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $options.url,
            "onUpdate:modelValue": ($event) => $options.url = $event,
            name: `links-${$props.link.uuid}`,
            "schema-property": $data.schemaDefinitions.urlString,
            type: "url",
            hint: $options.placeholder,
            required: ""
          }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property", "hint"])
        ];
      }
    }),
    _: 1
  }, _parent));
  if ($props.canRemove) {
    _push(`<button type="button" class="icon-button" title="Remove link" data-v-060fb75f>`);
    _push(ssrRenderComponent(_component_OflSvg, { name: "close" }, null, _parent));
    _push(`</button>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/EditorLink.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$8, [["ssrRender", _sfc_ssrRender$8], ["__scopeId", "data-v-060fb75f"]]), { __name: "EditorLink" });
const _sfc_main$7 = {
  components: {
    EditorLink: __nuxt_component_0
  },
  inheritAttrs: false,
  props: {
    modelValue: arrayProp().required,
    formstate: objectProp().required
  },
  emits: {
    "update:modelValue": (value) => true
  },
  methods: {
    async addLink() {
      const newLinks = [...this.modelValue, getEmptyLink()];
      this.$emit("update:modelValue", newLinks);
      await this.$nextTick();
      this.$refs.links[newLinks.length - 1].focus();
    },
    updateLinkProperty(updateLink, key, value) {
      const updatedLink = {
        ...updateLink,
        [key]: value
      };
      this.$emit("update:modelValue", this.modelValue.map(
        (link) => link === updateLink ? updatedLink : link
      ));
    },
    removeLink(removeLink) {
      this.$emit("update:modelValue", this.modelValue.filter(
        (link) => link !== removeLink
      ));
    }
  }
};
function _sfc_ssrRender$7(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_EditorLink = __nuxt_component_0;
  const _component_OflSvg = __nuxt_component_1$1$1;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "links" }, _attrs))}><!--[-->`);
  ssrRenderList($props.modelValue, (link) => {
    _push(ssrRenderComponent(_component_EditorLink, {
      key: link.uuid,
      ref_for: true,
      ref: "links",
      link,
      "can-remove": $props.modelValue.length > 1,
      formstate: $props.formstate,
      onSetType: ($event) => $options.updateLinkProperty(link, `type`, $event),
      onSetUrl: ($event) => $options.updateLinkProperty(link, `url`, $event),
      onRemove: ($event) => $options.removeLink(link)
    }, null, _parent));
  });
  _push(`<!--]--><a href="#add-link">`);
  _push(ssrRenderComponent(_component_OflSvg, { name: "plus" }, null, _parent));
  _push(` Add link </a></div>`);
}
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/EditorLinks.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const __nuxt_component_4 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$7, [["ssrRender", _sfc_ssrRender$7]]), { __name: "EditorLinks" });
const _sfc_main$6 = {
  components: {
    EditorCategoryChooser: __nuxt_component_2$1,
    EditorLinks: __nuxt_component_4,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputNumber: __nuxt_component_3$1,
    PropertyInputText,
    PropertyInputTextarea: __nuxt_component_2
  },
  props: {
    fixture: objectProp().required,
    formstate: objectProp().required,
    manufacturers: objectProp().required
  },
  data() {
    return {
      fixtureProperties
    };
  },
  computed: {
    manufacturerName() {
      if (!this.fixture.useExistingManufacturer) {
        return this.fixture.newManufacturerName;
      }
      const manufacturerKey = this.fixture.manufacturerKey;
      if (manufacturerKey === "") {
        return "";
      }
      return this.manufacturers[manufacturerKey].name;
    },
    fixtureNameIsWithoutManufacturer() {
      const manufacturerName = this.manufacturerName.trim().toLowerCase();
      return manufacturerName === "" || !this.fixture.name.trim().toLowerCase().startsWith(manufacturerName);
    }
  }
};
function _sfc_ssrRender$6(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_PropertyInputText = PropertyInputText;
  const _component_EditorCategoryChooser = __nuxt_component_2$1;
  const _component_PropertyInputTextarea = __nuxt_component_2;
  const _component_EditorLinks = __nuxt_component_4;
  const _component_PropertyInputNumber = __nuxt_component_3$1;
  _push(`<section${ssrRenderAttrs(mergeProps({ class: "fixture-info card" }, _attrs))}><h2>Fixture info</h2>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "custom-validators": { "no-manufacturer-name": $options.fixtureNameIsWithoutManufacturer },
    name: "fixture-name",
    label: "Name"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.fixture.name,
          "onUpdate:modelValue": ($event) => $props.fixture.name = $event,
          "schema-property": $data.fixtureProperties.name,
          required: "",
          name: "fixture-name"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.fixture.name,
            "onUpdate:modelValue": ($event) => $props.fixture.name = $event,
            "schema-property": $data.fixtureProperties.name,
            required: "",
            name: "fixture-name"
          }, null, 8, ["modelValue", "onUpdate:modelValue", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: "fixture-shortName",
    label: "Unique short name"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.fixture.shortName,
          "onUpdate:modelValue": ($event) => $props.fixture.shortName = $event,
          "schema-property": $data.fixtureProperties.shortName,
          name: "fixture-shortName",
          hint: "defaults to name"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.fixture.shortName,
            "onUpdate:modelValue": ($event) => $props.fixture.shortName = $event,
            "schema-property": $data.fixtureProperties.shortName,
            name: "fixture-shortName",
            hint: "defaults to name"
          }, null, 8, ["modelValue", "onUpdate:modelValue", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: "fixture-categories",
    label: "Categories",
    hint: "Select and reorder all applicable categories, the most suitable first."
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorCategoryChooser, {
          modelValue: $props.fixture.categories,
          "onUpdate:modelValue": ($event) => $props.fixture.categories = $event,
          "all-categories": $data.fixtureProperties.categories.items.enum,
          name: "fixture-categories",
          "categories-not-empty": ""
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorCategoryChooser, {
            modelValue: $props.fixture.categories,
            "onUpdate:modelValue": ($event) => $props.fixture.categories = $event,
            "all-categories": $data.fixtureProperties.categories.items.enum,
            name: "fixture-categories",
            "categories-not-empty": ""
          }, null, 8, ["modelValue", "onUpdate:modelValue", "all-categories"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: "comment",
    label: "Comment"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputTextarea, {
          modelValue: $props.fixture.comment,
          "onUpdate:modelValue": ($event) => $props.fixture.comment = $event,
          "schema-property": $data.fixtureProperties.comment,
          name: "comment"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputTextarea, {
            modelValue: $props.fixture.comment,
            "onUpdate:modelValue": ($event) => $props.fixture.comment = $event,
            "schema-property": $data.fixtureProperties.comment,
            name: "comment"
          }, null, 8, ["modelValue", "onUpdate:modelValue", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: "links",
    label: "Relevant links"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_EditorLinks, {
          modelValue: $props.fixture.links,
          "onUpdate:modelValue": ($event) => $props.fixture.links = $event,
          name: "links",
          formstate: $props.formstate
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_EditorLinks, {
            modelValue: $props.fixture.links,
            "onUpdate:modelValue": ($event) => $props.fixture.links = $event,
            name: "links",
            formstate: $props.formstate
          }, null, 8, ["modelValue", "onUpdate:modelValue", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: "rdmModelId",
    hint: "The RDM manufacturer ID is saved per manufacturer."
  }, {
    label: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<abbr title="Remote Device Management"${_scopeId}>RDM</abbr> model ID`);
      } else {
        return [
          createVNode("abbr", { title: "Remote Device Management" }, "RDM"),
          createTextVNode(" model ID")
        ];
      }
    }),
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputNumber, {
          modelValue: $props.fixture.rdmModelId,
          "onUpdate:modelValue": ($event) => $props.fixture.rdmModelId = $event,
          "schema-property": $data.fixtureProperties.rdm.properties.modelId,
          name: "rdmModelId"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputNumber, {
            modelValue: $props.fixture.rdmModelId,
            "onUpdate:modelValue": ($event) => $props.fixture.rdmModelId = $event,
            "schema-property": $data.fixtureProperties.rdm.properties.modelId,
            name: "rdmModelId"
          }, null, 8, ["modelValue", "onUpdate:modelValue", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  if ($props.fixture.rdmModelId !== null) {
    _push(ssrRenderComponent(_component_LabeledInput, {
      formstate: $props.formstate,
      name: "rdmSoftwareVersion",
      label: "RDM software version"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_PropertyInputText, {
            modelValue: $props.fixture.rdmSoftwareVersion,
            "onUpdate:modelValue": ($event) => $props.fixture.rdmSoftwareVersion = $event,
            "schema-property": $data.fixtureProperties.rdm.properties.softwareVersion,
            name: "rdmSoftwareVersion"
          }, null, _parent2, _scopeId));
        } else {
          return [
            createVNode(_component_PropertyInputText, {
              modelValue: $props.fixture.rdmSoftwareVersion,
              "onUpdate:modelValue": ($event) => $props.fixture.rdmSoftwareVersion = $event,
              "schema-property": $data.fixtureProperties.rdm.properties.softwareVersion,
              name: "rdmSoftwareVersion"
            }, null, 8, ["modelValue", "onUpdate:modelValue", "schema-property"])
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(`</section>`);
}
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/EditorFixtureInformation.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const EditorFixtureInformation = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$6, [["ssrRender", _sfc_ssrRender$6]]), { __name: "EditorFixtureInformation" });
const _sfc_main$5 = {
  components: {
    LabeledInput: __nuxt_component_2$3,
    PropertyInputNumber: __nuxt_component_3$1,
    PropertyInputText,
    PropertyInputTextarea: __nuxt_component_2
  },
  props: {
    fixture: objectProp().required,
    formstate: objectProp().required,
    manufacturers: objectProp().required
  },
  data() {
    return {
      manufacturerProperties
    };
  },
  watch: {
    async "fixture.useExistingManufacturer"(useExisting) {
      await this.$nextTick();
      this.$refs[useExisting ? "existingManufacturerSelect" : "newManufacturerNameInput"].focus();
    }
  },
  methods: {
    switchManufacturer(useExisting) {
      this.fixture.useExistingManufacturer = useExisting;
    }
  }
};
function _sfc_ssrRender$5(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_PropertyInputText = PropertyInputText;
  const _component_PropertyInputTextarea = __nuxt_component_2;
  const _component_PropertyInputNumber = __nuxt_component_3$1;
  _push(`<section${ssrRenderAttrs(mergeProps({ class: "manufacturer card" }, _attrs))}><h2>Manufacturer</h2>`);
  if ($props.fixture.useExistingManufacturer) {
    _push(`<section>`);
    _push(ssrRenderComponent(_component_LabeledInput, {
      formstate: $props.formstate,
      name: "manufacturerKey",
      label: "Choose from list"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<select class="${ssrRenderClass({ empty: $props.fixture.manufacturerKey === `` })}" required name="manufacturerKey"${_scopeId}><option value="" disabled${ssrIncludeBooleanAttr(Array.isArray($props.fixture.manufacturerKey) ? ssrLooseContain($props.fixture.manufacturerKey, "") : ssrLooseEqual($props.fixture.manufacturerKey, "")) ? " selected" : ""}${_scopeId}>Please select a manufacturer</option><!--[-->`);
          ssrRenderList($props.manufacturers, (manufacturer, manufacturerKey) => {
            _push2(`<!--[-->`);
            if (manufacturerKey !== `$schema`) {
              _push2(`<option${ssrRenderAttr("value", manufacturerKey)}${ssrIncludeBooleanAttr(Array.isArray($props.fixture.manufacturerKey) ? ssrLooseContain($props.fixture.manufacturerKey, manufacturerKey) : ssrLooseEqual($props.fixture.manufacturerKey, manufacturerKey)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(manufacturer.name)}</option>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<!--]-->`);
          });
          _push2(`<!--]--></select>`);
        } else {
          return [
            withDirectives(createVNode("select", {
              ref: "existingManufacturerSelect",
              "onUpdate:modelValue": ($event) => $props.fixture.manufacturerKey = $event,
              class: { empty: $props.fixture.manufacturerKey === `` },
              required: "",
              name: "manufacturerKey"
            }, [
              createVNode("option", {
                value: "",
                disabled: ""
              }, "Please select a manufacturer"),
              (openBlock(true), createBlock(Fragment, null, renderList($props.manufacturers, (manufacturer, manufacturerKey) => {
                return openBlock(), createBlock(Fragment, { key: manufacturerKey }, [
                  manufacturerKey !== `$schema` ? (openBlock(), createBlock("option", {
                    key: 0,
                    value: manufacturerKey
                  }, toDisplayString(manufacturer.name), 9, ["value"])) : createCommentVNode("", true)
                ], 64);
              }), 128))
            ], 10, ["onUpdate:modelValue"]), [
              [vModelSelect, $props.fixture.manufacturerKey]
            ])
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(`<div>or <a href="#add-new-manufacturer">add a new manufacturer</a></div></section>`);
  } else {
    _push(`<div>`);
    _push(ssrRenderComponent(_component_LabeledInput, {
      formstate: $props.formstate,
      name: "new-manufacturer-name",
      label: "Name"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_PropertyInputText, {
            ref: "newManufacturerNameInput",
            modelValue: $props.fixture.newManufacturerName,
            "onUpdate:modelValue": ($event) => $props.fixture.newManufacturerName = $event,
            "schema-property": $data.manufacturerProperties.name,
            required: "",
            name: "new-manufacturer-name"
          }, null, _parent2, _scopeId));
        } else {
          return [
            createVNode(_component_PropertyInputText, {
              ref: "newManufacturerNameInput",
              modelValue: $props.fixture.newManufacturerName,
              "onUpdate:modelValue": ($event) => $props.fixture.newManufacturerName = $event,
              "schema-property": $data.manufacturerProperties.name,
              required: "",
              name: "new-manufacturer-name"
            }, null, 8, ["modelValue", "onUpdate:modelValue", "schema-property"])
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(ssrRenderComponent(_component_LabeledInput, {
      formstate: $props.formstate,
      name: "new-manufacturer-website",
      label: "Website"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_PropertyInputText, {
            modelValue: $props.fixture.newManufacturerWebsite,
            "onUpdate:modelValue": ($event) => $props.fixture.newManufacturerWebsite = $event,
            "schema-property": $data.manufacturerProperties.website,
            type: "url",
            name: "new-manufacturer-website"
          }, null, _parent2, _scopeId));
        } else {
          return [
            createVNode(_component_PropertyInputText, {
              modelValue: $props.fixture.newManufacturerWebsite,
              "onUpdate:modelValue": ($event) => $props.fixture.newManufacturerWebsite = $event,
              "schema-property": $data.manufacturerProperties.website,
              type: "url",
              name: "new-manufacturer-website"
            }, null, 8, ["modelValue", "onUpdate:modelValue", "schema-property"])
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(ssrRenderComponent(_component_LabeledInput, {
      formstate: $props.formstate,
      name: "new-manufacturer-comment",
      label: "Comment"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_PropertyInputTextarea, {
            modelValue: $props.fixture.newManufacturerComment,
            "onUpdate:modelValue": ($event) => $props.fixture.newManufacturerComment = $event,
            "schema-property": $data.manufacturerProperties.comment,
            name: "new-manufacturer-comment"
          }, null, _parent2, _scopeId));
        } else {
          return [
            createVNode(_component_PropertyInputTextarea, {
              modelValue: $props.fixture.newManufacturerComment,
              "onUpdate:modelValue": ($event) => $props.fixture.newManufacturerComment = $event,
              "schema-property": $data.manufacturerProperties.comment,
              name: "new-manufacturer-comment"
            }, null, 8, ["modelValue", "onUpdate:modelValue", "schema-property"])
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(ssrRenderComponent(_component_LabeledInput, {
      formstate: $props.formstate,
      name: "new-manufacturer-rdmId"
    }, {
      label: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<abbr title="Remote Device Management"${_scopeId}>RDM</abbr> manufacturer ID`);
        } else {
          return [
            createVNode("abbr", { title: "Remote Device Management" }, "RDM"),
            createTextVNode(" manufacturer ID")
          ];
        }
      }),
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_PropertyInputNumber, {
            modelValue: $props.fixture.newManufacturerRdmId,
            "onUpdate:modelValue": ($event) => $props.fixture.newManufacturerRdmId = $event,
            "schema-property": $data.manufacturerProperties.rdmId,
            name: "new-manufacturer-rdmId"
          }, null, _parent2, _scopeId));
        } else {
          return [
            createVNode(_component_PropertyInputNumber, {
              modelValue: $props.fixture.newManufacturerRdmId,
              "onUpdate:modelValue": ($event) => $props.fixture.newManufacturerRdmId = $event,
              "schema-property": $data.manufacturerProperties.rdmId,
              name: "new-manufacturer-rdmId"
            }, null, 8, ["modelValue", "onUpdate:modelValue", "schema-property"])
          ];
        }
      }),
      _: 1
    }, _parent));
    _push(`<div>or <a href="#use-existing-manufacturer">choose an existing manufacturer</a></div></div>`);
  }
  _push(`</section>`);
}
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/EditorManufacturer.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const EditorManufacturer = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$5, [["ssrRender", _sfc_ssrRender$5]]), { __name: "EditorManufacturer" });
const _sfc_main$4 = {
  components: {
    PropertyInputNumber: __nuxt_component_3$1
  },
  props: {
    modelValue: arrayProp().withDefault(null),
    hints: arrayProp().withDefault(() => ["x", "y", "z"]),
    schemaProperty: objectProp().required,
    unit: stringProp().optional,
    required: booleanProp().withDefault(false),
    name: stringProp().required,
    formstate: objectProp().required
  },
  emits: {
    "update:modelValue": (dimensions) => true,
    "focus": () => true,
    "blur": () => true,
    "vf:validate": (validationData) => true
  },
  data() {
    return {
      validationData: {
        "complete-dimensions": ""
      }
    };
  },
  computed: {
    x: {
      get() {
        return this.modelValue ? this.modelValue[0] : null;
      },
      set(xInput) {
        this.$emit("update:modelValue", getDimensionsArray(xInput, this.y, this.z));
      }
    },
    y: {
      get() {
        return this.modelValue ? this.modelValue[1] : null;
      },
      set(yInput) {
        this.$emit("update:modelValue", getDimensionsArray(this.x, yInput, this.z));
      }
    },
    z: {
      get() {
        return this.modelValue ? this.modelValue[2] : null;
      },
      set(zInput) {
        this.$emit("update:modelValue", getDimensionsArray(this.x, this.y, zInput));
      }
    },
    dimensionsSpecified() {
      return this.modelValue !== null;
    }
  },
  mounted() {
    this.$emit("vf:validate", this.validationData);
  },
  methods: {
    onFocus() {
      this.$emit("focus");
    },
    onBlur(event) {
      if (!(event.target && event.relatedTarget) || event.target.closest(".dimensions") !== event.relatedTarget.closest(".dimensions")) {
        this.$emit("blur");
      }
    },
    /** @public */
    focus() {
      this.$refs.xInput.focus();
    }
  }
};
function getDimensionsArray(x, y, z) {
  if (x === null && y === null && z === null) {
    return null;
  }
  return [x, y, z];
}
function _sfc_ssrRender$4(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_Validate = __nuxt_component_5;
  const _component_PropertyInputNumber = __nuxt_component_3$1;
  _push(`<span${ssrRenderAttrs(mergeProps({ class: "dimensions" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_Validate, {
    state: $props.formstate,
    tag: "span"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputNumber, {
          ref: "xInput",
          modelValue: $options.x,
          "onUpdate:modelValue": ($event) => $options.x = $event,
          name: `${$props.name}-x`,
          "schema-property": $props.schemaProperty.items,
          required: $props.required || $options.dimensionsSpecified,
          hint: $props.hints[0],
          onFocus: ($event) => $options.onFocus(),
          onBlur: ($event) => $options.onBlur($event)
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputNumber, {
            ref: "xInput",
            modelValue: $options.x,
            "onUpdate:modelValue": ($event) => $options.x = $event,
            name: `${$props.name}-x`,
            "schema-property": $props.schemaProperty.items,
            required: $props.required || $options.dimensionsSpecified,
            hint: $props.hints[0],
            onFocus: ($event) => $options.onFocus(),
            onBlur: ($event) => $options.onBlur($event)
          }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property", "required", "hint", "onFocus", "onBlur"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(` × `);
  _push(ssrRenderComponent(_component_Validate, {
    state: $props.formstate,
    tag: "span"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputNumber, {
          modelValue: $options.y,
          "onUpdate:modelValue": ($event) => $options.y = $event,
          name: `${$props.name}-y`,
          "schema-property": $props.schemaProperty.items,
          required: $props.required || $options.dimensionsSpecified,
          hint: $props.hints[1],
          onFocus: ($event) => $options.onFocus(),
          onBlur: ($event) => $options.onBlur($event)
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputNumber, {
            modelValue: $options.y,
            "onUpdate:modelValue": ($event) => $options.y = $event,
            name: `${$props.name}-y`,
            "schema-property": $props.schemaProperty.items,
            required: $props.required || $options.dimensionsSpecified,
            hint: $props.hints[1],
            onFocus: ($event) => $options.onFocus(),
            onBlur: ($event) => $options.onBlur($event)
          }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property", "required", "hint", "onFocus", "onBlur"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(` × `);
  _push(ssrRenderComponent(_component_Validate, {
    state: $props.formstate,
    tag: "span"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputNumber, {
          modelValue: $options.z,
          "onUpdate:modelValue": ($event) => $options.z = $event,
          name: `${$props.name}-z`,
          "schema-property": $props.schemaProperty.items,
          required: $props.required || $options.dimensionsSpecified,
          hint: $props.hints[2],
          onFocus: ($event) => $options.onFocus(),
          onBlur: ($event) => $options.onBlur($event)
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputNumber, {
            modelValue: $options.z,
            "onUpdate:modelValue": ($event) => $options.z = $event,
            name: `${$props.name}-z`,
            "schema-property": $props.schemaProperty.items,
            required: $props.required || $options.dimensionsSpecified,
            hint: $props.hints[2],
            onFocus: ($event) => $options.onFocus(),
            onBlur: ($event) => $options.onBlur($event)
          }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property", "required", "hint", "onFocus", "onBlur"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(` ${ssrInterpolate($props.unit)}</span>`);
}
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PropertyInputDimensions.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$4, [["ssrRender", _sfc_ssrRender$4]]), { __name: "PropertyInputDimensions" });
const _sfc_main$3 = {
  components: {
    LabeledInput: __nuxt_component_2$3,
    PropertyInputDimensions: __nuxt_component_1,
    PropertyInputNumber: __nuxt_component_3$1,
    PropertyInputRange: __nuxt_component_6,
    PropertyInputSelect: __nuxt_component_3,
    PropertyInputText
  },
  model: {
    prop: "model-value",
    event: "update:model-value"
  },
  props: {
    modelValue: objectProp().required,
    formstate: objectProp().required,
    namePrefix: stringProp().required
  },
  emits: {
    "update:model-value": (value) => true
  },
  data() {
    return {
      schemaDefinitions,
      physicalProperties,
      physicalBulbProperties,
      physicalLensProperties,
      localPhysical: structuredClone(this.modelValue)
    };
  },
  watch: {
    localPhysical: {
      handler() {
        this.$emit("update:model-value", structuredClone(this.localPhysical));
      },
      deep: true
    },
    async "modelValue.DMXconnector"(newValue) {
      if (newValue === "[add-value]" && this.$root._oflRestoreComplete) {
        await this.$nextTick();
        this.$refs.newDmxConnectorInput.focus();
      }
    }
  },
  mounted() {
    if (this.$root._oflRestoreComplete) {
      this.$refs.firstInput.focus();
    }
  }
};
function _sfc_ssrRender$3(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_PropertyInputDimensions = __nuxt_component_1;
  const _component_PropertyInputNumber = __nuxt_component_3$1;
  const _component_PropertyInputSelect = __nuxt_component_3;
  const _component_Validate = __nuxt_component_5;
  const _component_PropertyInputText = PropertyInputText;
  const _component_PropertyInputRange = __nuxt_component_6;
  _push(`<div${ssrRenderAttrs(_attrs)}>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `${$props.namePrefix}-physical-dimensions`,
    label: "Dimensions"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputDimensions, {
          ref: "firstInput",
          modelValue: $data.localPhysical.dimensions,
          "onUpdate:modelValue": ($event) => $data.localPhysical.dimensions = $event,
          name: `${$props.namePrefix}-physical-dimensions`,
          "schema-property": $data.schemaDefinitions.dimensionsXYZ,
          hints: [`width`, `height`, `depth`],
          formstate: $props.formstate,
          unit: "mm"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputDimensions, {
            ref: "firstInput",
            modelValue: $data.localPhysical.dimensions,
            "onUpdate:modelValue": ($event) => $data.localPhysical.dimensions = $event,
            name: `${$props.namePrefix}-physical-dimensions`,
            "schema-property": $data.schemaDefinitions.dimensionsXYZ,
            hints: [`width`, `height`, `depth`],
            formstate: $props.formstate,
            unit: "mm"
          }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `${$props.namePrefix}-physical-weight`,
    label: "Weight"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputNumber, {
          modelValue: $data.localPhysical.weight,
          "onUpdate:modelValue": ($event) => $data.localPhysical.weight = $event,
          name: `${$props.namePrefix}-physical-weight`,
          "schema-property": $data.physicalProperties.weight
        }, null, _parent2, _scopeId));
        _push2(` kg `);
      } else {
        return [
          createVNode(_component_PropertyInputNumber, {
            modelValue: $data.localPhysical.weight,
            "onUpdate:modelValue": ($event) => $data.localPhysical.weight = $event,
            name: `${$props.namePrefix}-physical-weight`,
            "schema-property": $data.physicalProperties.weight
          }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property"]),
          createTextVNode(" kg ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `${$props.namePrefix}-physical-power`,
    label: "Power"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputNumber, {
          modelValue: $data.localPhysical.power,
          "onUpdate:modelValue": ($event) => $data.localPhysical.power = $event,
          name: `${$props.namePrefix}-physical-power`,
          "schema-property": $data.physicalProperties.power
        }, null, _parent2, _scopeId));
        _push2(` W `);
      } else {
        return [
          createVNode(_component_PropertyInputNumber, {
            modelValue: $data.localPhysical.power,
            "onUpdate:modelValue": ($event) => $data.localPhysical.power = $event,
            name: `${$props.namePrefix}-physical-power`,
            "schema-property": $data.physicalProperties.power
          }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property"]),
          createTextVNode(" W ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `${$props.namePrefix}-physical-DMXconnector`,
    label: "DMX connector"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputSelect, {
          modelValue: $data.localPhysical.DMXconnector,
          "onUpdate:modelValue": ($event) => $data.localPhysical.DMXconnector = $event,
          name: `${$props.namePrefix}-physical-DMXconnector`,
          "schema-property": $data.physicalProperties.DMXconnector,
          "addition-hint": "other DMX connector"
        }, null, _parent2, _scopeId));
        if ($props.modelValue.DMXconnector === `[add-value]`) {
          _push2(ssrRenderComponent(_component_Validate, {
            state: $props.formstate,
            tag: "span"
          }, {
            default: withCtx((_2, _push3, _parent3, _scopeId2) => {
              if (_push3) {
                _push3(ssrRenderComponent(_component_PropertyInputText, {
                  ref: "newDmxConnectorInput",
                  modelValue: $data.localPhysical.DMXconnectorNew,
                  "onUpdate:modelValue": ($event) => $data.localPhysical.DMXconnectorNew = $event,
                  name: `${$props.namePrefix}-physical-DMXconnectorNew`,
                  "schema-property": $data.schemaDefinitions.nonEmptyString,
                  required: "",
                  hint: "other DMX connector",
                  class: "addition"
                }, null, _parent3, _scopeId2));
              } else {
                return [
                  createVNode(_component_PropertyInputText, {
                    ref: "newDmxConnectorInput",
                    modelValue: $data.localPhysical.DMXconnectorNew,
                    "onUpdate:modelValue": ($event) => $data.localPhysical.DMXconnectorNew = $event,
                    name: `${$props.namePrefix}-physical-DMXconnectorNew`,
                    "schema-property": $data.schemaDefinitions.nonEmptyString,
                    required: "",
                    hint: "other DMX connector",
                    class: "addition"
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property"])
                ];
              }
            }),
            _: 1
          }, _parent2, _scopeId));
        } else {
          _push2(`<!---->`);
        }
      } else {
        return [
          createVNode(_component_PropertyInputSelect, {
            modelValue: $data.localPhysical.DMXconnector,
            "onUpdate:modelValue": ($event) => $data.localPhysical.DMXconnector = $event,
            name: `${$props.namePrefix}-physical-DMXconnector`,
            "schema-property": $data.physicalProperties.DMXconnector,
            "addition-hint": "other DMX connector"
          }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property"]),
          $props.modelValue.DMXconnector === `[add-value]` ? (openBlock(), createBlock(_component_Validate, {
            key: 0,
            state: $props.formstate,
            tag: "span"
          }, {
            default: withCtx(() => [
              createVNode(_component_PropertyInputText, {
                ref: "newDmxConnectorInput",
                modelValue: $data.localPhysical.DMXconnectorNew,
                "onUpdate:modelValue": ($event) => $data.localPhysical.DMXconnectorNew = $event,
                name: `${$props.namePrefix}-physical-DMXconnectorNew`,
                "schema-property": $data.schemaDefinitions.nonEmptyString,
                required: "",
                hint: "other DMX connector",
                class: "addition"
              }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property"])
            ]),
            _: 1
          }, 8, ["state"])) : createCommentVNode("", true)
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`<h4>Bulb</h4>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `${$props.namePrefix}-physical-bulb-type`,
    label: "Bulb type"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $data.localPhysical.bulb.type,
          "onUpdate:modelValue": ($event) => $data.localPhysical.bulb.type = $event,
          name: `${$props.namePrefix}-physical-bulb-type`,
          "schema-property": $data.physicalBulbProperties.type,
          hint: "e.g. LED"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $data.localPhysical.bulb.type,
            "onUpdate:modelValue": ($event) => $data.localPhysical.bulb.type = $event,
            name: `${$props.namePrefix}-physical-bulb-type`,
            "schema-property": $data.physicalBulbProperties.type,
            hint: "e.g. LED"
          }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `${$props.namePrefix}-physical-bulb-colorTemperature`,
    label: "Color temperature"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputNumber, {
          modelValue: $data.localPhysical.bulb.colorTemperature,
          "onUpdate:modelValue": ($event) => $data.localPhysical.bulb.colorTemperature = $event,
          name: `${$props.namePrefix}-physical-bulb-colorTemperature`,
          "schema-property": $data.physicalBulbProperties.colorTemperature
        }, null, _parent2, _scopeId));
        _push2(` K `);
      } else {
        return [
          createVNode(_component_PropertyInputNumber, {
            modelValue: $data.localPhysical.bulb.colorTemperature,
            "onUpdate:modelValue": ($event) => $data.localPhysical.bulb.colorTemperature = $event,
            name: `${$props.namePrefix}-physical-bulb-colorTemperature`,
            "schema-property": $data.physicalBulbProperties.colorTemperature
          }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property"]),
          createTextVNode(" K ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `${$props.namePrefix}-physical-bulb-lumens`,
    label: "Lumens"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputNumber, {
          modelValue: $data.localPhysical.bulb.lumens,
          "onUpdate:modelValue": ($event) => $data.localPhysical.bulb.lumens = $event,
          name: `${$props.namePrefix}-physical-bulb-lumens`,
          "schema-property": $data.physicalBulbProperties.lumens
        }, null, _parent2, _scopeId));
        _push2(` lm `);
      } else {
        return [
          createVNode(_component_PropertyInputNumber, {
            modelValue: $data.localPhysical.bulb.lumens,
            "onUpdate:modelValue": ($event) => $data.localPhysical.bulb.lumens = $event,
            name: `${$props.namePrefix}-physical-bulb-lumens`,
            "schema-property": $data.physicalBulbProperties.lumens
          }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property"]),
          createTextVNode(" lm ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`<h4>Lens</h4>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `${$props.namePrefix}-physical-lens-name`,
    label: "Lens name"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $data.localPhysical.lens.name,
          "onUpdate:modelValue": ($event) => $data.localPhysical.lens.name = $event,
          name: `${$props.namePrefix}-physical-lens-name`,
          "schema-property": $data.physicalLensProperties.name
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $data.localPhysical.lens.name,
            "onUpdate:modelValue": ($event) => $data.localPhysical.lens.name = $event,
            name: `${$props.namePrefix}-physical-lens-name`,
            "schema-property": $data.physicalLensProperties.name
          }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    "multiple-inputs": "",
    name: `${$props.namePrefix}-physical-lens-degreesMinMax`,
    label: "Beam angle"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputRange, {
          modelValue: $data.localPhysical.lens.degreesMinMax,
          "onUpdate:modelValue": ($event) => $data.localPhysical.lens.degreesMinMax = $event,
          name: `${$props.namePrefix}-physical-lens-degreesMinMax`,
          "schema-property": $data.physicalLensProperties.degreesMinMax,
          formstate: $props.formstate,
          "start-hint": "min",
          "end-hint": "max",
          unit: "°"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputRange, {
            modelValue: $data.localPhysical.lens.degreesMinMax,
            "onUpdate:modelValue": ($event) => $data.localPhysical.lens.degreesMinMax = $event,
            name: `${$props.namePrefix}-physical-lens-degreesMinMax`,
            "schema-property": $data.physicalLensProperties.degreesMinMax,
            formstate: $props.formstate,
            "start-hint": "min",
            "end-hint": "max",
            unit: "°"
          }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property", "formstate"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/EditorPhysical.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const EditorPhysical = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$3, [["ssrRender", _sfc_ssrRender$3]]), { __name: "EditorPhysical" });
const _sfc_main$2 = {
  components: {
    Draggable,
    EditorPhysical,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputNumber: __nuxt_component_3$1,
    PropertyInputText
  },
  props: {
    mode: objectProp().required,
    index: numberProp().required,
    fixture: objectProp().required,
    formstate: objectProp().required
  },
  emits: {
    "remove": () => true,
    "open-channel-editor": (payload) => true
  },
  data() {
    return {
      schemaDefinitions,
      modeProperties,
      dragOptions: {
        animation: 200,
        handle: ".drag-handle",
        emptyInsertThreshold: 20,
        group: {
          name: "mode",
          pull: "clone",
          put: (to, from, dragElement, event) => {
            if (from === to) {
              return false;
            }
            const channelUuid = dragElement.getAttribute("data-channel-uuid");
            const modeUuid = to.el.closest(".fixture-mode").getAttribute("data-mode-uuid");
            const targetMode = this.fixture.modes.find((mode) => mode.uuid === modeUuid);
            if (targetMode.channels.includes(channelUuid)) {
              return false;
            }
            const channel = this.fixture.availableChannels[channelUuid];
            if (!("coarseChannelId" in channel)) {
              return true;
            }
            if (!targetMode.channels.includes(channel.coarseChannelId)) {
              return false;
            }
            if (channel.resolution === constants.RESOLUTION_16BIT) {
              return true;
            }
            return targetMode.channels.some((uuid) => {
              const otherChannel = this.fixture.availableChannels[uuid];
              return otherChannel.coarseChannelId === channel.coarseChannelId && otherChannel.resolution === channel.resolution - 1;
            });
          },
          revertClone: true
        }
      }
    };
  },
  computed: {
    fixtureEditor() {
      const vueForm = this.$parent;
      return vueForm.$parent;
    },
    channelListNotEmpty() {
      return this.mode.channels.length > 0;
    }
  },
  mounted() {
    if (this.$root._oflRestoreComplete) {
      this.$refs.firstInput.focus();
    }
  },
  methods: {
    getChannelName(channelUuid) {
      return this.fixtureEditor.getChannelName(channelUuid);
    },
    editChannel(channelUuid) {
      this.$emit("open-channel-editor", {
        modeId: this.mode.uuid,
        editMode: "edit-?",
        uuid: channelUuid
      });
    },
    addChannel() {
      this.$emit("open-channel-editor", {
        modeId: this.mode.uuid,
        editMode: "add-existing"
      });
    },
    isChannelNameUnique(channelUuid) {
      return this.fixtureEditor.isChannelNameUnique(channelUuid);
    },
    isFineChannel(channelUuid) {
      return "coarseChannelId" in this.fixture.availableChannels[channelUuid];
    },
    moveChannel(channelUuid, delta) {
      const channelIndex = this.mode.channels.indexOf(channelUuid);
      const newIndex = channelIndex + delta;
      if (newIndex < 0 || newIndex >= this.mode.channels.length) {
        return;
      }
      this.mode.channels.splice(channelIndex, 1);
      this.mode.channels.splice(newIndex, 0, channelUuid);
    },
    removeChannel(channelUuid) {
      const channel = this.fixture.availableChannels[channelUuid];
      let coarseChannelId = channelUuid;
      let resolution = constants.RESOLUTION_8BIT;
      if (this.isFineChannel(channelUuid)) {
        coarseChannelId = channel.coarseChannelId;
        resolution = channel.resolution;
      }
      for (const otherChannel of Object.values(this.fixture.availableChannels)) {
        if (otherChannel.coarseChannelId === coarseChannelId && otherChannel.resolution > resolution) {
          this.fixtureEditor.removeChannel(otherChannel.uuid, this.mode.uuid);
        }
      }
      this.fixtureEditor.removeChannel(channelUuid, this.mode.uuid);
    }
  }
};
function _sfc_ssrRender$2(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_OflSvg = __nuxt_component_1$1$1;
  const _component_LabeledInput = __nuxt_component_2$3;
  const _component_PropertyInputText = PropertyInputText;
  const _component_PropertyInputNumber = __nuxt_component_3$1;
  const _component_EditorPhysical = EditorPhysical;
  const _component_Validate = __nuxt_component_5;
  const _component_Draggable = resolveComponent("Draggable");
  const _component_FieldMessages = __nuxt_component_6$2;
  _push(`<section${ssrRenderAttrs(mergeProps({
    "data-mode-uuid": $props.mode.uuid,
    class: "fixture-mode card"
  }, _attrs))} data-v-53af2d8e>`);
  if ($props.fixture.modes.length > 1) {
    _push(`<a href="#remove-mode" class="icon-button close" data-v-53af2d8e> Remove mode `);
    _push(ssrRenderComponent(_component_OflSvg, { name: "close" }, null, _parent));
    _push(`</a>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<h2 data-v-53af2d8e>Mode #${ssrInterpolate($props.index + 1)}</h2>`);
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `mode-${$props.index}-name`,
    label: "Name"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          ref: "firstInput",
          modelValue: $props.mode.name,
          "onUpdate:modelValue": ($event) => $props.mode.name = $event,
          name: `mode-${$props.index}-name`,
          "schema-property": $data.schemaDefinitions.modeNameString.allOf[1],
          required: "",
          "no-mode-name": "",
          hint: "e.g. Extended",
          title: "The name must not contain the word 'mode'."
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            ref: "firstInput",
            modelValue: $props.mode.name,
            "onUpdate:modelValue": ($event) => $props.mode.name = $event,
            name: `mode-${$props.index}-name`,
            "schema-property": $data.schemaDefinitions.modeNameString.allOf[1],
            required: "",
            "no-mode-name": "",
            hint: "e.g. Extended",
            title: "The name must not contain the word 'mode'."
          }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_LabeledInput, {
    formstate: $props.formstate,
    name: `mode-${$props.index}-shortName`,
    label: "Unique short name"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_PropertyInputText, {
          modelValue: $props.mode.shortName,
          "onUpdate:modelValue": ($event) => $props.mode.shortName = $event,
          name: `mode-${$props.index}-shortName`,
          "schema-property": $data.schemaDefinitions.modeNameString.allOf[1],
          "no-mode-name": "",
          hint: "e.g. ext; defaults to name",
          title: "The short name must not contain the word 'mode'."
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_PropertyInputText, {
            modelValue: $props.mode.shortName,
            "onUpdate:modelValue": ($event) => $props.mode.shortName = $event,
            name: `mode-${$props.index}-shortName`,
            "schema-property": $data.schemaDefinitions.modeNameString.allOf[1],
            "no-mode-name": "",
            hint: "e.g. ext; defaults to name",
            title: "The short name must not contain the word 'mode'."
          }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property"])
        ];
      }
    }),
    _: 1
  }, _parent));
  if ($props.fixture.rdmModelId !== null) {
    _push(ssrRenderComponent(_component_LabeledInput, {
      formstate: $props.formstate,
      name: `mode-${$props.index}-rdmPersonalityIndex`,
      label: "RDM personality index"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(ssrRenderComponent(_component_PropertyInputNumber, {
            modelValue: $props.mode.rdmPersonalityIndex,
            "onUpdate:modelValue": ($event) => $props.mode.rdmPersonalityIndex = $event,
            name: `mode-${$props.index}-rdmPersonalityIndex`,
            "schema-property": $data.modeProperties.rdmPersonalityIndex
          }, null, _parent2, _scopeId));
        } else {
          return [
            createVNode(_component_PropertyInputNumber, {
              modelValue: $props.mode.rdmPersonalityIndex,
              "onUpdate:modelValue": ($event) => $props.mode.rdmPersonalityIndex = $event,
              name: `mode-${$props.index}-rdmPersonalityIndex`,
              "schema-property": $data.modeProperties.rdmPersonalityIndex
            }, null, 8, ["modelValue", "onUpdate:modelValue", "name", "schema-property"])
          ];
        }
      }),
      _: 1
    }, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(`<h3 data-v-53af2d8e>Physical override</h3><label data-v-53af2d8e><input${ssrIncludeBooleanAttr(Array.isArray($props.mode.enablePhysicalOverride) ? ssrLooseContain($props.mode.enablePhysicalOverride, null) : $props.mode.enablePhysicalOverride) ? " checked" : ""} type="checkbox" class="enable-physical-override" data-v-53af2d8e> Override fixture&#39;s physical data in this mode </label><section class="physical-override" data-v-53af2d8e>`);
  if ($props.mode.enablePhysicalOverride) {
    _push(ssrRenderComponent(_component_EditorPhysical, {
      modelValue: $props.mode.physical,
      "onUpdate:modelValue": ($event) => $props.mode.physical = $event,
      formstate: $props.formstate,
      "name-prefix": `mode-${$props.index}`
    }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  _push(`</section><h3 data-v-53af2d8e>DMX channels</h3>`);
  _push(ssrRenderComponent(_component_Validate, {
    state: $props.formstate,
    custom: { "no-empty-channel-list": $options.channelListNotEmpty },
    tag: "div",
    class: "mode-channels"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<input${ssrRenderAttr("value", $props.mode.channels)}${ssrRenderAttr("name", `mode-${$props.index}-channels`)} type="hidden" data-v-53af2d8e${_scopeId}>`);
        _push2(ssrRenderComponent(_component_Draggable, mergeProps({
          list: $props.mode.channels,
          "item-key": "."
        }, $data.dragOptions), {
          item: withCtx(({ element: channelUuid, index: channelIndex }, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(`<li${ssrRenderAttr("value", channelIndex + 1)}${ssrRenderAttr("data-channel-uuid", channelUuid)} data-v-53af2d8e${_scopeId2}><span class="channel-name" data-v-53af2d8e${_scopeId2}>${ssrInterpolate($options.getChannelName(channelUuid))}</span>`);
              if (!$options.isChannelNameUnique(channelUuid)) {
                _push3(`<code class="channel-uuid" data-v-53af2d8e${_scopeId2}>${ssrInterpolate(channelUuid)}</code>`);
              } else {
                _push3(`<!---->`);
              }
              _push3(`<span class="channel-buttons" data-v-53af2d8e${_scopeId2}><button type="button" title="Drag or press ↓↑ to change channel order" class="drag-handle icon-button" data-v-53af2d8e${_scopeId2}>`);
              _push3(ssrRenderComponent(_component_OflSvg, { name: "move" }, null, _parent3, _scopeId2));
              _push3(`</button>`);
              if (!$options.isFineChannel(channelUuid)) {
                _push3(`<button type="button" class="icon-button" title="Edit channel" data-v-53af2d8e${_scopeId2}>`);
                _push3(ssrRenderComponent(_component_OflSvg, { name: "pencil" }, null, _parent3, _scopeId2));
                _push3(`</button>`);
              } else {
                _push3(`<!---->`);
              }
              _push3(`<button type="button" class="icon-button" title="Remove channel" data-v-53af2d8e${_scopeId2}>`);
              _push3(ssrRenderComponent(_component_OflSvg, { name: "close" }, null, _parent3, _scopeId2));
              _push3(`</button></span></li>`);
            } else {
              return [
                (openBlock(), createBlock("li", {
                  key: channelUuid,
                  value: channelIndex + 1,
                  "data-channel-uuid": channelUuid
                }, [
                  createVNode("span", { class: "channel-name" }, toDisplayString($options.getChannelName(channelUuid)), 1),
                  !$options.isChannelNameUnique(channelUuid) ? (openBlock(), createBlock("code", {
                    key: 0,
                    class: "channel-uuid"
                  }, toDisplayString(channelUuid), 1)) : createCommentVNode("", true),
                  createVNode("span", { class: "channel-buttons" }, [
                    createVNode("button", {
                      type: "button",
                      title: "Drag or press ↓↑ to change channel order",
                      class: "drag-handle icon-button",
                      onKeyup: [
                        withKeys(withModifiers(($event) => $options.moveChannel(channelUuid, -1), ["prevent"]), ["up"]),
                        withKeys(withModifiers(($event) => $options.moveChannel(channelUuid, 1), ["prevent"]), ["down"])
                      ],
                      onClick: withModifiers(() => {
                      }, ["prevent"])
                    }, [
                      createVNode(_component_OflSvg, { name: "move" })
                    ], 40, ["onKeyup", "onClick"]),
                    !$options.isFineChannel(channelUuid) ? (openBlock(), createBlock("button", {
                      key: 0,
                      type: "button",
                      class: "icon-button",
                      title: "Edit channel",
                      onClick: withModifiers(($event) => $options.editChannel(channelUuid), ["prevent"])
                    }, [
                      createVNode(_component_OflSvg, { name: "pencil" })
                    ], 8, ["onClick"])) : createCommentVNode("", true),
                    createVNode("button", {
                      type: "button",
                      class: "icon-button",
                      title: "Remove channel",
                      onClick: withModifiers(($event) => $options.removeChannel(channelUuid), ["prevent"])
                    }, [
                      createVNode(_component_OflSvg, { name: "close" })
                    ], 8, ["onClick"])
                  ])
                ], 8, ["value", "data-channel-uuid"]))
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
        _push2(ssrRenderComponent(_component_FieldMessages, {
          state: $props.formstate,
          name: `mode-${$props.index}-channels`,
          show: "$submitted",
          tag: "div",
          class: "error-message"
        }, {
          "no-empty-channel-list": withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(`<div data-v-53af2d8e${_scopeId2}>A mode must contain at least one channel.</div>`);
            } else {
              return [
                createVNode("div", null, "A mode must contain at least one channel.")
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
      } else {
        return [
          withDirectives(createVNode("input", {
            "onUpdate:modelValue": ($event) => $props.mode.channels = $event,
            name: `mode-${$props.index}-channels`,
            type: "hidden"
          }, null, 8, ["onUpdate:modelValue", "name"]), [
            [vModelText, $props.mode.channels]
          ]),
          createVNode(_component_Draggable, mergeProps({
            list: $props.mode.channels,
            "item-key": "."
          }, $data.dragOptions), {
            item: withCtx(({ element: channelUuid, index: channelIndex }) => [
              (openBlock(), createBlock("li", {
                key: channelUuid,
                value: channelIndex + 1,
                "data-channel-uuid": channelUuid
              }, [
                createVNode("span", { class: "channel-name" }, toDisplayString($options.getChannelName(channelUuid)), 1),
                !$options.isChannelNameUnique(channelUuid) ? (openBlock(), createBlock("code", {
                  key: 0,
                  class: "channel-uuid"
                }, toDisplayString(channelUuid), 1)) : createCommentVNode("", true),
                createVNode("span", { class: "channel-buttons" }, [
                  createVNode("button", {
                    type: "button",
                    title: "Drag or press ↓↑ to change channel order",
                    class: "drag-handle icon-button",
                    onKeyup: [
                      withKeys(withModifiers(($event) => $options.moveChannel(channelUuid, -1), ["prevent"]), ["up"]),
                      withKeys(withModifiers(($event) => $options.moveChannel(channelUuid, 1), ["prevent"]), ["down"])
                    ],
                    onClick: withModifiers(() => {
                    }, ["prevent"])
                  }, [
                    createVNode(_component_OflSvg, { name: "move" })
                  ], 40, ["onKeyup", "onClick"]),
                  !$options.isFineChannel(channelUuid) ? (openBlock(), createBlock("button", {
                    key: 0,
                    type: "button",
                    class: "icon-button",
                    title: "Edit channel",
                    onClick: withModifiers(($event) => $options.editChannel(channelUuid), ["prevent"])
                  }, [
                    createVNode(_component_OflSvg, { name: "pencil" })
                  ], 8, ["onClick"])) : createCommentVNode("", true),
                  createVNode("button", {
                    type: "button",
                    class: "icon-button",
                    title: "Remove channel",
                    onClick: withModifiers(($event) => $options.removeChannel(channelUuid), ["prevent"])
                  }, [
                    createVNode(_component_OflSvg, { name: "close" })
                  ], 8, ["onClick"])
                ])
              ], 8, ["value", "data-channel-uuid"]))
            ]),
            _: 1
          }, 16, ["list"]),
          createVNode(_component_FieldMessages, {
            state: $props.formstate,
            name: `mode-${$props.index}-channels`,
            show: "$submitted",
            tag: "div",
            class: "error-message"
          }, {
            "no-empty-channel-list": withCtx(() => [
              createVNode("div", null, "A mode must contain at least one channel.")
            ]),
            _: 1
          }, 8, ["state", "name"])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`<a href="#add-channel" class="button primary" data-v-53af2d8e>add channel</a></section>`);
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/EditorMode.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const EditorMode = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender$2], ["__scopeId", "data-v-53af2d8e"]]), { __name: "EditorMode" });
const _sfc_main$1 = {
  components: {
    A11yDialog: __nuxt_component_0$1$1
  },
  model: {
    prop: "model-value",
    event: "update:model-value"
  },
  props: {
    modelValue: objectProp().optional
  },
  emits: {
    "update:model-value": (value) => true,
    "restore-complete": () => true
  },
  computed: {
    restoredDate() {
      if (this.modelValue === void 0) {
        return void 0;
      }
      return new Date(this.modelValue.timestamp).toISOString().replace(/\..*$/, "").replace("T", ", ");
    }
  },
  methods: {
    discardRestored() {
      localStorage.setItem("autoSave", JSON.stringify(JSON.parse(localStorage.getItem("autoSave")).slice(0, -1)));
      this.$emit("update:model-value", void 0);
      this.$emit("restore-complete");
    },
    async applyRestored() {
      const modelValue = structuredClone(this.modelValue);
      this.$emit("update:model-value", void 0);
      await this.$nextTick();
      this.$parent.fixture = getRestoredFixture(modelValue.fixture);
      this.$parent.channel = getRestoredChannel(modelValue.channel, true);
      await this.$nextTick();
      this.$emit("restore-complete");
    }
  }
};
function getRestoredFixture(fixture) {
  const restoredFixture = Object.assign(getEmptyFixture(), fixture);
  for (const [index, link] of restoredFixture.links.entries()) {
    restoredFixture.links[index] = Object.assign(getEmptyLink(), link);
  }
  restoredFixture.physical = Object.assign(getEmptyPhysical(), restoredFixture.physical);
  for (const [index, mode] of restoredFixture.modes.entries()) {
    restoredFixture.modes[index] = Object.assign(getEmptyMode(), mode);
    restoredFixture.modes[index].physical = Object.assign(getEmptyPhysical(), mode.physical);
  }
  for (const channelKey of Object.keys(restoredFixture.availableChannels)) {
    restoredFixture.availableChannels[channelKey] = getRestoredChannel(restoredFixture.availableChannels[channelKey], false);
  }
  return restoredFixture;
}
function getRestoredChannel(channel, isChannelDialog) {
  if ("coarseChannelId" in channel) {
    return Object.assign(getEmptyFineChannel(), channel);
  }
  let emptyChannel = getEmptyChannel();
  if (!isChannelDialog) {
    emptyChannel = getSanitizedChannel(emptyChannel);
  }
  const restoredChannel = Object.assign(emptyChannel, channel);
  for (const [index, capability] of restoredChannel.capabilities.entries()) {
    restoredChannel.capabilities[index] = Object.assign(
      getEmptyCapability(),
      capability
    );
  }
  if (isChannelDialog) {
    restoredChannel.wizard.templateCapability = Object.assign(
      getEmptyCapability(),
      restoredChannel.wizard.templateCapability
    );
  }
  return restoredChannel;
}
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_A11yDialog = __nuxt_component_0$1$1;
  _push(ssrRenderComponent(_component_A11yDialog, mergeProps({
    id: "restore-dialog",
    "is-alert-dialog": "",
    shown: $props.modelValue !== void 0,
    title: "Auto-saved fixture data found"
  }, _attrs), {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(` Do you want to restore the data (auto-saved <time${_scopeId}>${ssrInterpolate($options.restoredDate)}</time>) to continue to create the fixture? <div class="button-bar right"${_scopeId}><button type="submit" class="discard secondary"${_scopeId}> Discard data </button><button type="submit" class="restore primary"${_scopeId}> Restore to continue work </button></div>`);
      } else {
        return [
          createTextVNode(" Do you want to restore the data (auto-saved "),
          createVNode("time", null, toDisplayString($options.restoredDate), 1),
          createTextVNode(") to continue to create the fixture? "),
          createVNode("div", { class: "button-bar right" }, [
            createVNode("button", {
              type: "submit",
              class: "discard secondary",
              onClick: withModifiers(($event) => $options.discardRestored(), ["prevent"])
            }, " Discard data ", 8, ["onClick"]),
            createVNode("button", {
              type: "submit",
              class: "restore primary",
              onClick: withModifiers(($event) => $options.applyRestored(), ["prevent"])
            }, " Restore to continue work ", 8, ["onClick"])
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/editor/EditorRestoreDialog.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const EditorRestoreDialog = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1]]), { __name: "EditorRestoreDialog" });
const _sfc_main = {
  components: {
    EditorChannelDialog,
    EditorChooseChannelEditModeDialog,
    EditorFixtureInformation,
    EditorManufacturer,
    EditorMode,
    EditorPhysical,
    EditorRestoreDialog,
    EditorSubmitDialog,
    LabeledInput: __nuxt_component_2$3,
    PropertyInputText
  },
  async setup() {
    const { data: manufacturers, error } = await useAsyncData("manufacturers", () => $fetch("/api/v1/manufacturers"));
    if (error.value) {
      throw createError({ statusCode: 500, statusMessage: error.value.message });
    }
    useHead({ title: "Fixture Editor" });
    return { manufacturers: manufacturers.value };
  },
  data() {
    return {
      formstate: getEmptyFormState(),
      readyToAutoSave: false,
      restoredData: void 0,
      fixture: getEmptyFixture(),
      channel: getEmptyChannel(),
      githubUsername: "",
      honeypot: "",
      schemaDefinitions
    };
  },
  watch: {
    fixture: {
      handler() {
        this.autoSave("fixture");
      },
      deep: true
    }
  },
  beforeMount() {
    this.$root._oflRestoreComplete = false;
  },
  async mounted() {
    this.applyQueryPrefillData();
    this.applyStoredPrefillData();
    await this.$nextTick();
    this.restoreAutoSave();
  },
  methods: {
    addNewMode() {
      this.fixture.modes.push(getEmptyMode());
    },
    openChannelEditor(channelData) {
      this.channel = { ...this.channel, ...channelData };
    },
    resetChannel() {
      this.channel = getEmptyChannel();
    },
    /**
     * @param {string} channelUuid The channel's UUID.
     * @returns {string} The channel's name.
     */
    getChannelName(channelUuid) {
      const channel = this.fixture.availableChannels[channelUuid];
      if ("coarseChannelId" in channel) {
        let name = `${this.getChannelName(channel.coarseChannelId)} fine`;
        if (channel.resolution > constants.RESOLUTION_16BIT) {
          name += `^${channel.resolution - 1}`;
        }
        return name;
      }
      return channel.name;
    },
    /**
     * Called from {@link EditorMode}.
     * @public
     * @param {string} channelUuid The channel's UUID.
     * @returns {boolean} True if the channel's name is not used in another channel, too.
     */
    isChannelNameUnique(channelUuid) {
      const channelName = this.getChannelName(channelUuid);
      return Object.keys(this.fixture.availableChannels).every(
        (uuid) => channelName !== this.getChannelName(uuid) || uuid === channelUuid
      );
    },
    /**
     * @param {string} channelUuid The channel's UUID.
     * @param {string | null} [modeUuid] The mode's UUID. If not supplied, remove channel everywhere.
     */
    removeChannel(channelUuid, modeUuid) {
      if (modeUuid) {
        const channelMode = this.fixture.modes.find((mode) => mode.uuid === modeUuid);
        const channelPosition = channelMode.channels.indexOf(channelUuid);
        if (channelPosition !== -1) {
          channelMode.channels.splice(channelPosition, 1);
        }
        return;
      }
      for (const channel of Object.values(this.fixture.availableChannels)) {
        if ("coarseChannelId" in channel && channel.coarseChannelId === channelUuid) {
          this.removeChannel(channel.uuid);
        }
      }
      for (const mode of this.fixture.modes) {
        this.removeChannel(channelUuid, mode.uuid);
      }
      delete this.fixture.availableChannels[channelUuid];
    },
    /**
     * Saves the entered user data to the browser's local storage if available.
     * @param {'fixture' | 'channel'} objectName The object to save.
     */
    autoSave(objectName) {
      if (!this.readyToAutoSave) {
        return;
      }
      localStorage.setItem("autoSave", JSON.stringify([
        {
          fixture: this.fixture,
          channel: this.channel,
          timestamp: Date.now()
        }
      ]));
    },
    clearAutoSave() {
      localStorage.removeItem("autoSave");
    },
    /**
     * Loads auto-saved data from browser's local storage into this component's `restoredData` property, such that a dialog is opened that lets the user choose if they want to apply or discard it.
     */
    restoreAutoSave() {
      try {
        this.restoredData = JSON.parse(localStorage.getItem("autoSave")).pop();
        if (this.restoredData === void 0) {
          throw new Error("this.restoredData is undefined.");
        }
      } catch {
        this.restoredData = void 0;
        this.restoreComplete();
        return;
      }
    },
    /**
     * Called from restore dialog (via an event) after the restored data are either applied or discarded.
     */
    restoreComplete() {
      this.readyToAutoSave = true;
      this.$root._oflRestoreComplete = true;
      (void 0).scrollTo(0, 0);
    },
    applyQueryPrefillData() {
      if (!this.$route.query.prefill) {
        return;
      }
      try {
        const prefillObject = JSON.parse(this.$route.query.prefill);
        for (const key of Object.keys(prefillObject)) {
          if (isPrefillable(prefillObject, key)) {
            this.fixture[key] = prefillObject[key];
          }
        }
      } catch (parseError) {
      }
    },
    applyStoredPrefillData() {
      if (this.fixture.metaAuthor === "") {
        this.fixture.metaAuthor = localStorage.getItem("prefillAuthor") || "";
      }
      if (this.githubUsername === "") {
        this.githubUsername = localStorage.getItem("prefillGithubUsername") || "";
      }
    },
    storePrefillData() {
      localStorage.setItem("prefillAuthor", this.fixture.metaAuthor);
      localStorage.setItem("prefillGithubUsername", this.githubUsername);
    },
    onSubmit() {
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
      this.$refs.submitDialog.validate([this.fixture]);
    },
    onFixtureSubmitted() {
      this.storePrefillData();
      this.clearAutoSave();
    },
    async reset() {
      this.fixture = getEmptyFixture();
      this.channel = getEmptyChannel();
      this.honeypot = "";
      this.applyStoredPrefillData();
      this.$router.push({
        path: this.$route.path,
        query: {}
        // clear prefill query
      });
      await this.$nextTick();
      Object.keys(this.formstate).forEach((key) => {
        delete this.formstate[key];
      });
      this.formstate.$submitted = false;
      this.$refs.existingManufacturerSelect.focus();
      (void 0).scrollTo(0, 0);
    }
  }
};
function isPrefillable(prefillObject, key) {
  const allowedPrefillValues = {
    useExistingManufacturer: "boolean",
    manufacturerKey: "string",
    newManufacturerRdmId: "number",
    rdmModelId: "number"
  };
  return key in allowedPrefillValues && typeof prefillObject[key] === allowedPrefillValues[key];
}
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_NuxtLink = __nuxt_component_0$2;
  const _component_ClientOnly = __nuxt_component_2$2$1;
  _push(`<div${ssrRenderAttrs(mergeProps({ id: "fixture-editor" }, _attrs))} data-v-ae534864><h1 data-v-ae534864>Fixture Editor</h1><section class="card" data-v-ae534864><h2 data-v-ae534864>Import fixture</h2> Instead of creating a new fixture definition in the editor below, you can also `);
  _push(ssrRenderComponent(_component_NuxtLink, { to: "/import-fixture-file" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`import an existing fixture definition file`);
      } else {
        return [
          createTextVNode("import an existing fixture definition file")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`. </section><noscript class="card yellow" data-v-ae534864> Please enable JavaScript to use the Fixture Editor! </noscript>`);
  _push(ssrRenderComponent(_component_ClientOnly, { placeholder: "Fixture editor is loading..." }, {}, _parent));
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fixture-editor.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const fixtureEditor = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-ae534864"]]);

export { fixtureEditor as default };
//# sourceMappingURL=fixture-editor-ChMtsn3g.mjs.map
