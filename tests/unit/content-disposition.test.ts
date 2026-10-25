import { describe, expect, it } from 'vitest';
import { parseContentDispositionFilename } from '../../ui/utils/content-disposition';

describe('parseContentDispositionFilename', () => {
  it('reads a quoted filename', () => {
    expect(parseContentDispositionFilename('attachment; filename="Clay Paky Sharpy.ofld"')).toBe('Clay Paky Sharpy.ofld');
  });

  it('reads a single-quoted filename', () => {
    expect(parseContentDispositionFilename('attachment; filename=\'Clay Paky Sharpy.ofld\'')).toBe('Clay Paky Sharpy.ofld');
  });

  it('reads an unquoted filename', () => {
    expect(parseContentDispositionFilename('attachment; filename=sharpy.ofld')).toBe('sharpy.ofld');
  });

  it('keeps semicolons inside a quoted filename', () => {
    expect(parseContentDispositionFilename('attachment; filename="sharpy;final.ofld"; size=42')).toBe('sharpy;final.ofld');
  });

  it('ignores inline responses and missing headers', () => {
    expect(parseContentDispositionFilename('inline; filename="sharpy.ofld"')).toBe('');
    expect(parseContentDispositionFilename(null)).toBe('');
    expect(parseContentDispositionFilename(undefined)).toBe('');
    expect(parseContentDispositionFilename('')).toBe('');
  });

  it('ignores attachments without a filename', () => {
    expect(parseContentDispositionFilename('attachment')).toBe('');
    expect(parseContentDispositionFilename('attachment; filename=""')).toBe('');
  });
});
