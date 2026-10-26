/**
 * Validation rules shared by the vee-validate plugin and the editor form state.
 *
 * Each rule mirrors the pre-Nuxt-4 `vue-form` validator of the same name, so the
 * editor's user-visible behaviour (and message selection) stays identical.
 */
export type ValidationRuleResult = boolean | string;

export interface EntityValidationData {
  hasNumber?: boolean;
  selectedNumber?: string | number | null;
  hasSameUnit?: boolean;
}

export interface ValidationRuleContext {
  entity?: EntityValidationData;
  [key: string]: unknown;
}

export type ValidationRule = (
  value: unknown,
  params?: unknown,
  ctx?: ValidationRuleContext,
) => ValidationRuleResult;

const emailRegExp = /^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*$/i;
const urlRegExp = /^(?:http:\/\/|https:\/\/)(?:.{4,})$/;

export const validationRules: Record<string, ValidationRule> = {
  required(value: unknown): boolean {
    if (value === 0) {
      return true;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (value === false) {
      return false;
    }

    return Boolean(value);
  },

  email(value: unknown): boolean {
    return emailRegExp.test(String(value));
  },

  url(value: unknown): boolean {
    return urlRegExp.test(String(value));
  },

  number(value: unknown): boolean {
    return !Number.isNaN(Number(value));
  },

  minlength(value: unknown, length: unknown): boolean {
    return String(value).length >= Number(length);
  },

  maxlength(value: unknown, length: unknown): boolean {
    return Number(length) >= String(value).length;
  },

  pattern(value: unknown, pattern: unknown): boolean {
    return new RegExp(`^${String(pattern)}$`).test(String(value));
  },

  min(value: unknown, minimum: unknown): boolean {
    return Number(value) >= Number(minimum);
  },

  max(value: unknown, maximum: unknown): boolean {
    return Number(maximum) >= Number(value);
  },

  step(value: unknown, stepValue: unknown): boolean {
    return stepValue === 'any' || Number(value) % Number(stepValue) === 0;
  },

  'data-exclusive-minimum': (value: unknown, exclusiveMinimum: unknown): boolean => {
    return Number(value) > Number(exclusiveMinimum);
  },

  'data-exclusive-maximum': (value: unknown, exclusiveMaximum: unknown): boolean => {
    return Number(value) < Number(exclusiveMaximum);
  },

  'complete-range': (range: unknown): boolean => {
    if (range === null) {
      return true;
    }

    const [start, end] = range as [unknown, unknown];
    return start !== null && end !== null;
  },

  'valid-range': (range: unknown): boolean => {
    if (range === null) {
      return true;
    }

    const [start, end] = range as [number | null, number | null];

    // let complete-range handle incomplete ranges, number handle NaN
    if (start === null || end === null || Number.isNaN(start) || Number.isNaN(end)) {
      return true;
    }

    return start <= end;
  },

  'categories-not-empty': (categories: unknown): boolean => {
    return Array.isArray(categories) && categories.length > 0;
  },

  'complete-dimensions': (dimensions: unknown): boolean => {
    if (dimensions === null) {
      return true;
    }

    const [x, y, z] = dimensions as [unknown, unknown, unknown];
    return x !== null && y !== null && z !== null;
  },

  'start-with-uppercase-or-number': (value: unknown): boolean => {
    return /^[\dA-Z]/.test(String(value));
  },

  'no-mode-name': (value: unknown): boolean => {
    return !/\bmode\b/i.test(String(value));
  },

  'no-fine-channel-name': (value: unknown): boolean => {
    if (/\bfine\b|\d+[\s_-]*bit/i.test(String(value))) {
      return false;
    }

    return !/\bLSB\b|\bMSB\b/.test(String(value));
  },

  'entity-complete': (_value: unknown, _params: unknown, ctx?: ValidationRuleContext): boolean => {
    const entity = ctx?.entity;

    if (!entity || !entity.hasNumber) {
      return true;
    }

    return entity.selectedNumber !== '' && entity.selectedNumber !== null && entity.selectedNumber !== undefined;
  },

  'entities-have-same-units': (_value: unknown, _params: unknown, ctx?: ValidationRuleContext): boolean => {
    return ctx?.entity?.hasSameUnit !== false;
  },

  'valid-color-hex-list': (value: unknown): boolean => {
    return /^\s*#[\da-f]{6}(?:\s*,\s*#[\da-f]{6})*\s*$/i.test(String(value));
  },

  'max-file-size': (file: unknown, attributeValue: unknown): boolean => {
    if (typeof file !== 'object' || file === null) {
      return true;
    }

    const fileSize = (file as { size?: number }).size;
    if (typeof fileSize !== 'number') {
      return true;
    }

    let maxSize = Number.parseInt(String(attributeValue), 10);

    if (String(attributeValue).includes('M')) {
      maxSize *= 1000 * 1000;
    }
    else if (String(attributeValue).includes('k')) {
      maxSize *= 1000;
    }

    return fileSize <= maxSize;
  },
};
