import { handleError } from '@/utils/errorUtils';

describe('handleError', () => {
  it('returns fallback message when error has no response.data', () => {
    const result = handleError({}, 'Fallback message');

    expect(result).toEqual({
      status: 'error',
      error: 'Fallback message',
    });
  });

  it('returns first error from response.data.errors', () => {
    const error = {
      response: {
        data: {
          errors: ['First error', 'Second error'],
        },
      },
    };

    const result = handleError(error, 'Fallback');

    expect(result).toEqual({
      status: 'error',
      error: 'First error',
    });
  });

  it('returns data.message when no errors array exists', () => {
    const error = {
      response: {
        data: {
          message: 'Something went wrong',
        },
      },
    };

    const result = handleError(error, 'Fallback');

    expect(result).toEqual({
      status: 'error',
      error: 'Something went wrong',
    });
  });

  it('returns fallback when errors is empty and no message exists', () => {
    const error = {
      response: {
        data: {
          errors: [],
        },
      },
    };

    const result = handleError(error, 'Fallback message');

    expect(result).toEqual({
      status: 'error',
      error: 'Fallback message',
    });
  });

  it('ignores malformed axios errors and returns fallback message', () => {
    const malformedError = {
      response: {
        data: null,
      },
    };

    const result = handleError(malformedError, 'Default');

    expect(result).toEqual({
      status: 'error',
      error: 'Default',
    });
  });
});

describe('isAxiosErrorWithData', () => {
  // We import it USING require since it is not exported directly
  const { isAxiosErrorWithData } = require('@/utils/errorUtils');

  it('returns true for valid axios-style error', () => {
    const error = {
      response: {
        data: {
          message: 'Hi',
        },
      },
    };

    expect(isAxiosErrorWithData(error)).toBe(true);
  });

  it('returns false when error is null', () => {
    expect(isAxiosErrorWithData(null)).toBe(false);
  });

  it('returns false when error is not an object', () => {
    expect(isAxiosErrorWithData('string')).toBe(false);
  });

  it('returns false when response missing', () => {
    expect(isAxiosErrorWithData({})).toBe(false);
  });

  it('returns false when data missing', () => {
    expect(
      isAxiosErrorWithData({
        response: {},
      })
    ).toBe(false);
  });

  it('returns false when data is not an object', () => {
    expect(
      isAxiosErrorWithData({
        response: { data: 123 },
      })
    ).toBe(false);
  });
});
