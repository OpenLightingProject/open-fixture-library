import { describe, expect, it } from 'vitest';
// The rules live in a plain module so they can be tested without booting the
// Nuxt plugin. `ui/plugins/vee-validate.ts` registers exactly this object.
import { validationRules } from '~/utils/validation-rules';

const REQUIRED_RULE_NAMES = [
  'step',
  'data-exclusive-minimum',
  'data-exclusive-maximum',
  'complete-range',
  'valid-range',
  'categories-not-empty',
  'complete-dimensions',
  'start-with-uppercase-or-number',
  'no-mode-name',
  'no-fine-channel-name',
  'entity-complete',
  'entities-have-same-units',
  'valid-color-hex-list',
  'max-file-size',
];

describe('vee-validate rule names', () => {
  it.each(REQUIRED_RULE_NAMES)('registers %s', (ruleName) => {
    expect(validationRules).toHaveProperty(ruleName);
    expect(validationRules[ruleName]).toBeTypeOf('function');
  });
});

describe('step', () => {
  it('accepts any step', () => {
    expect(validationRules.step('5', 'any')).toBe(true);
  });

  it('accepts multiples', () => {
    expect(validationRules.step('10', '2')).toBe(true);
    expect(validationRules.step('9', '3')).toBe(true);
  });

  it('rejects non-multiples', () => {
    expect(validationRules.step('5', '2')).toBe(false);
  });
});

describe('data-exclusive-minimum / data-exclusive-maximum', () => {
  it('accepts values greater than the exclusive minimum', () => {
    expect(validationRules['data-exclusive-minimum']('5', '3')).toBe(true);
  });

  it('rejects values equal to or below the exclusive minimum', () => {
    expect(validationRules['data-exclusive-minimum']('3', '3')).toBe(false);
    expect(validationRules['data-exclusive-minimum']('2', '3')).toBe(false);
  });

  it('accepts values below the exclusive maximum', () => {
    expect(validationRules['data-exclusive-maximum']('2', '3')).toBe(true);
  });

  it('rejects values equal to or above the exclusive maximum', () => {
    expect(validationRules['data-exclusive-maximum']('3', '3')).toBe(false);
    expect(validationRules['data-exclusive-maximum']('4', '3')).toBe(false);
  });
});

describe('complete-range / valid-range', () => {
  it('accepts null (allowed range)', () => {
    expect(validationRules['complete-range'](null)).toBe(true);
    expect(validationRules['valid-range'](null)).toBe(true);
  });

  it('requires both range ends', () => {
    expect(validationRules['complete-range']([1, 2])).toBe(true);
    expect(validationRules['complete-range']([1, null])).toBe(false);
    expect(validationRules['complete-range']([null, 2])).toBe(false);
    expect(validationRules['complete-range']([null, null])).toBe(false);
  });

  it('requires start <= end, but lets other rules handle incomplete ranges', () => {
    expect(validationRules['valid-range']([1, 2])).toBe(true);
    expect(validationRules['valid-range']([2, 2])).toBe(true);
    expect(validationRules['valid-range']([2, 1])).toBe(false);
    expect(validationRules['valid-range']([2, null])).toBe(true);
    expect(validationRules['valid-range']([Number.NaN, 2])).toBe(true);
  });
});

describe('categories-not-empty', () => {
  it('requires at least one category', () => {
    expect(validationRules['categories-not-empty'](['Dimmer'])).toBe(true);
    expect(validationRules['categories-not-empty']([])).toBe(false);
  });
});

describe('complete-dimensions', () => {
  it('accepts null (no dimensions)', () => {
    expect(validationRules['complete-dimensions'](null)).toBe(true);
  });

  it('requires all three dimensions', () => {
    expect(validationRules['complete-dimensions']([1, 2, 3])).toBe(true);
    expect(validationRules['complete-dimensions']([1, null, 3])).toBe(false);
    expect(validationRules['complete-dimensions']([null, null, null])).toBe(false);
  });
});

describe('name rules', () => {
  it('start-with-uppercase-or-number', () => {
    expect(validationRules['start-with-uppercase-or-number']('Intensity')).toBe(true);
    expect(validationRules['start-with-uppercase-or-number']('16 bit')).toBe(true);
    expect(validationRules['start-with-uppercase-or-number']('intensity')).toBe(false);
    expect(validationRules['start-with-uppercase-or-number']('_Intensity')).toBe(false);
  });

  it('no-mode-name', () => {
    expect(validationRules['no-mode-name']('Extended')).toBe(true);
    expect(validationRules['no-mode-name']('Mode 1')).toBe(false);
    expect(validationRules['no-mode-name']('extended mode')).toBe(false);
  });

  it('no-fine-channel-name', () => {
    expect(validationRules['no-fine-channel-name']('Intensity')).toBe(true);
    expect(validationRules['no-fine-channel-name']('Intensity fine')).toBe(false);
    expect(validationRules['no-fine-channel-name']('16bit')).toBe(false);
    expect(validationRules['no-fine-channel-name']('LSB')).toBe(false);
    expect(validationRules['no-fine-channel-name']('MSB')).toBe(false);
  });
});

describe('entity rules (driven by field registration data)', () => {
  it('entity-complete', () => {
    expect(validationRules['entity-complete']('', undefined, {
      entity: { hasNumber: false, selectedNumber: '', hasSameUnit: true },
    })).toBe(true);

    expect(validationRules['entity-complete']('', undefined, {
      entity: { hasNumber: true, selectedNumber: '', hasSameUnit: true },
    })).toBe(false);

    expect(validationRules['entity-complete']('2m', undefined, {
      entity: { hasNumber: true, selectedNumber: 2, hasSameUnit: true },
    })).toBe(true);
  });

  it('entities-have-same-units', () => {
    expect(validationRules['entities-have-same-units']('2m', undefined, {
      entity: { hasNumber: true, selectedNumber: 2, hasSameUnit: true },
    })).toBe(true);

    expect(validationRules['entities-have-same-units']('2m', undefined, {
      entity: { hasNumber: true, selectedNumber: 2, hasSameUnit: false },
    })).toBe(false);
  });
});

describe('valid-color-hex-list', () => {
  it('accepts comma-separated #rrggbb values', () => {
    expect(validationRules['valid-color-hex-list']('#ff0000')).toBe(true);
    expect(validationRules['valid-color-hex-list']('  #FF0000, #00ff00  ')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(validationRules['valid-color-hex-list']('#f00')).toBe(false);
    expect(validationRules['valid-color-hex-list']('#ff0000, red')).toBe(false);
    expect(validationRules['valid-color-hex-list']('')).toBe(false);
  });
});

describe('max-file-size', () => {
  it('accepts files up to the configured size', () => {
    expect(validationRules['max-file-size']({ size: 50_000_000 }, '50MB')).toBe(true);
    expect(validationRules['max-file-size']({ size: 1_000 }, '1k')).toBe(true);
    expect(validationRules['max-file-size']({ size: 999 }, '1000')).toBe(true);
  });

  it('rejects larger files', () => {
    expect(validationRules['max-file-size']({ size: 50_000_001 }, '50MB')).toBe(false);
    expect(validationRules['max-file-size']({ size: 1_001 }, '1k')).toBe(false);
  });
});
