import {
  searchCompaniesFormValidate,
  submitCompaniesSearchForm,
  mapQueryToCompaniesForm,
} from '@/utils/companiesSearchValidation';

describe('searchCompaniesFormValidate', () => {
  it('returns error when name is shorter than 10 chars', () => {
    const errors = searchCompaniesFormValidate({ name: 'short' } as any);

    expect(errors).toEqual({
      name: 'Name must be at least 10 characters',
    });
  });

  it('returns no errors when name is long enough', () => {
    const errors = searchCompaniesFormValidate({
      name: 'Long Company Name',
    } as any);

    expect(errors).toEqual({});
  });

  it('returns no errors when name is empty', () => {
    const errors = searchCompaniesFormValidate({ name: '' } as any);

    expect(errors).toEqual({});
  });
});

describe('submitCompaniesSearchForm', () => {
  it('calls onSubmit with provided values', () => {
    const onSubmit = jest.fn();
    const values = { name: 'Apple', page: 2 } as any;

    submitCompaniesSearchForm(values, onSubmit);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(values);
  });
});

describe('mapQueryToCompaniesForm', () => {
  it('maps name and page correctly', () => {
    const result = mapQueryToCompaniesForm({
      name: 'Google',
      page: '5',
    });

    expect(result).toEqual({
      name: 'Google',
      page: 5,
    });
  });

  it('maps name only when page not provided', () => {
    const result = mapQueryToCompaniesForm({
      name: 'Microsoft',
    });

    expect(result).toEqual({
      name: 'Microsoft',
    });
  });

  it('maps page only when name not provided', () => {
    const result = mapQueryToCompaniesForm({
      page: '10',
    });

    expect(result).toEqual({
      page: 10,
    });
  });

  it('returns empty object when query is empty', () => {
    const result = mapQueryToCompaniesForm({});

    expect(result).toEqual({});
  });
});
