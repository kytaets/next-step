import {
  removeEmpty,
  replaceNulls,
  validateCompanyInfoData,
} from '@/utils/companyProfileValidation'; // ← поправ шлях, якщо інший

describe('removeEmpty', () => {
  it('replaces empty strings with null', () => {
    const input = {
      name: '',
      url: 'http://site.com',
      description: '',
    } as any;

    const result = removeEmpty(input);

    expect(result).toEqual({
      name: null,
      url: 'http://site.com',
      description: null,
    });
  });

  it('keeps non-empty values unchanged', () => {
    const input = {
      name: 'Acme',
      url: '',
    } as any;

    const result = removeEmpty(input);

    expect(result).toEqual({
      name: 'Acme',
      url: null,
    });
  });
});

describe('replaceNulls', () => {
  it('replaces null values with empty strings', () => {
    const input = {
      name: null,
      url: 'https://google.com',
      description: null,
    } as any;

    const result = replaceNulls(input);

    expect(result).toEqual({
      name: '',
      url: 'https://google.com',
      description: '',
    });
  });

  it('does not change non-null values', () => {
    const input = {
      name: 'Company',
      url: null,
    } as any;

    const result = replaceNulls(input);

    expect(result).toEqual({
      name: 'Company',
      url: '',
    });
  });
});

describe('validateCompanyInfoData', () => {
  it('returns error if name is only whitespace', () => {
    const input = {
      name: '   ',
      url: null,
    } as any;

    const errors = validateCompanyInfoData(input);

    expect(errors).toEqual({
      name: 'Company name is required.',
    });
  });

  it('returns error if URL is invalid', () => {
    const input = {
      name: 'Valid',
      url: 'not-a-url',
    } as any;

    const errors = validateCompanyInfoData(input);

    expect(errors).toEqual({
      url: 'Invalid URL format.',
    });
  });

  it('returns no errors for valid data', () => {
    const input = {
      name: 'Valid Name',
      url: 'https://example.com',
    } as any;

    const errors = validateCompanyInfoData(input);

    expect(errors).toEqual({});
  });

  it('returns no errors when name is valid and url is empty', () => {
    const input = {
      name: 'My Company',
      url: '',
    } as any;

    const errors = validateCompanyInfoData(input);

    expect(errors).toEqual({});
  });
});
