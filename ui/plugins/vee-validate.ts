import { defineNuxtPlugin } from '#app';
import { configure, defineRule } from 'vee-validate';

export default defineNuxtPlugin(() => {
  configure({
    generateMessage: ({ field }) => `${field} is invalid`,
  });

  defineRule('step', (value: string, stepValue: string) => {
    return stepValue === 'any' || Number(value) % Number(stepValue) === 0;
  });

  defineRule('exclusive-minimum', (value: number, exclusiveMinimum: number) => {
    return Number(value) > Number(exclusiveMinimum);
  });

  defineRule('exclusive-maximum', (value: number, exclusiveMaximum: number) => {
    return Number(value) < Number(exclusiveMaximum);
  });

  defineRule('complete-range', (range: [number | null, number | null] | null) => {
    return range === null || (range[0] !== null && range[1] !== null);
  });

  defineRule('valid-range', (range: [number | null, number | null] | null) => {
    if (range === null) {
      return true;
    }

    if (range[0] === null || range[1] === null) {
      return true;
    }

    if (Number.isNaN(range[0]) || Number.isNaN(range[1])) {
      return true;
    }

    return range[0] <= range[1];
  });

  defineRule('categories-not-empty', (categories: string[]) => {
    return categories.length > 0;
  });

  defineRule('complete-dimensions', (dimensions: [number | null, number | null, number | null] | null) => {
    return dimensions === null || (dimensions[0] !== null && dimensions[1] !== null && dimensions[2] !== null);
  });

  defineRule('start-with-uppercase-or-number', (value: string) => {
    return /^[\dA-Z]/.test(value);
  });

  defineRule('no-mode-name', (value: string) => {
    return !/\bmode\b/i.test(value);
  });

  defineRule('no-fine-channel-name', (value: string) => {
    if (/\bfine\b|\d+[\s_-]*bit/i.test(value)) {
      return false;
    }
    return !/\bLSB\b|\bMSB\b/.test(value);
  });

  defineRule('valid-color-hex-list', (value: string) => {
    return /^\s*#[\da-f]{6}(?:\s*,\s*#[\da-f]{6})*\s*$/i.test(value);
  });

  defineRule('max-file-size', (file: File, attributeValue: string) => {
    if (typeof file === 'object') {
      let maxSize = Number.parseInt(attributeValue, 10);

      if (attributeValue.includes('M')) {
        maxSize *= 1000 * 1000;
      }
      else if (attributeValue.includes('k')) {
        maxSize *= 1000;
      }

      return file.size <= maxSize;
    }

    return true;
  });
});
