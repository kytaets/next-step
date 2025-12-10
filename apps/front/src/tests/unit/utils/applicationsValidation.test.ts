import { submitApplicationsSearchForm } from '@/utils/applicationsValidation';

describe('submitApplicationsSearchForm', () => {
  it('removes undefined and null fields except page, keeps defined values', () => {
    const onSubmit = jest.fn();

    const input = {
      name: undefined,
      status: undefined,
      page: undefined,
      vacancyId: null,
      recruiterId: '123',
    };

    submitApplicationsSearchForm(input as any, onSubmit);

    expect(onSubmit).toHaveBeenCalledWith({
      page: 1,
      recruiterId: '123',
    });
  });

  it('keeps status when status is defined', () => {
    const onSubmit = jest.fn();

    const input = {
      status: 'approved',
      page: undefined,
    };

    submitApplicationsSearchForm(input as any, onSubmit);

    expect(onSubmit).toHaveBeenCalledWith({
      status: 'approved',
      page: 1,
    });
  });

  it('keeps page when provided', () => {
    const onSubmit = jest.fn();

    const input = {
      page: 5,
      recruiterId: undefined,
    };

    submitApplicationsSearchForm(input as any, onSubmit);

    expect(onSubmit).toHaveBeenCalledWith({
      page: 5,
    });
  });

  it('does not override existing page', () => {
    const onSubmit = jest.fn();

    const input = {
      page: 3,
      name: null,
    };

    submitApplicationsSearchForm(input as any, onSubmit);

    expect(onSubmit).toHaveBeenCalledWith({
      page: 3,
    });
  });

  it('calls onSubmit exactly once with cleaned values', () => {
    const onSubmit = jest.fn();

    submitApplicationsSearchForm({ page: undefined } as any, onSubmit);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ page: 1 });
  });
});
