import { describe, expect, it } from 'vitest';
import { getManufacturerLoadError } from '../../ui/utils/manufacturer-error';

describe('getManufacturerLoadError', () => {
  it('maps a missing manufacturer without a fetch error to 404', () => {
    expect(getManufacturerLoadError(undefined)).toEqual({
      statusCode: 404,
      statusMessage: 'Manufacturer not found',
      data: undefined,
    });
  });

  it('keeps an HTTP error status, message and response data', () => {
    expect(getManufacturerLoadError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: 'Manufacturer key is invalid' },
    })).toEqual({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: 'Manufacturer key is invalid' },
    });
  });

  it('does not mask API 500 responses as 404', () => {
    expect(getManufacturerLoadError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })).toMatchObject({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  });

  it('maps a response-less fetch failure to 500', () => {
    expect(getManufacturerLoadError({})).toEqual({
      statusCode: 500,
      statusMessage: 'Manufacturer could not be loaded',
      data: undefined,
    });
  });
});
