jest.mock('@/services/apiRequest', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

import apiRequest from '@/services/apiRequest';
import api from '@/services/axios';

import {
  getMyCompanyProfile,
  updateCompanyProfile,
  createCompanyProfile,
  getCompanyProfileById,
  sendInvite,
  deleteCompany,
  getMyMembers,
  removeRecruiter,
} from '@/services/companyProfileService';

describe('companyProfile service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getMyCompanyProfile calls apiRequest correctly', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({ id: 1 });

    const result = await getMyCompanyProfile();

    expect(apiRequest).toHaveBeenCalledWith('get', '/companies/my');
    expect(result).toEqual({ id: 1 });
  });

  it('updateCompanyProfile calls apiRequest with data', async () => {
    const dto = { name: 'New Name' };
    (apiRequest as jest.Mock).mockResolvedValue(dto);

    const result = await updateCompanyProfile(dto);

    expect(apiRequest).toHaveBeenCalledWith('patch', '/companies/my', dto);
    expect(result).toEqual(dto);
  });

  it('createCompanyProfile calls apiRequest', async () => {
    const dto = { name: 'Test' };
    (apiRequest as jest.Mock).mockResolvedValue({ id: 5 });

    const result = await createCompanyProfile(dto);

    expect(apiRequest).toHaveBeenCalledWith('post', '/companies', dto);
    expect(result).toEqual({ id: 5 });
  });

  it('sendInvite calls apiRequest with correct payload', async () => {
    (apiRequest as jest.Mock).mockResolvedValue(undefined);

    const dto = { email: 'test@mail.com' };
    const result = await sendInvite(dto);

    expect(apiRequest).toHaveBeenCalledWith('post', '/companies/invite', dto);
    expect(result).toBeUndefined();
  });

  it('deleteCompany calls apiRequest', async () => {
    (apiRequest as jest.Mock).mockResolvedValue(undefined);

    await deleteCompany();

    expect(apiRequest).toHaveBeenCalledWith('delete', '/companies/my');
  });

  it('getMyMembers calls apiRequest with params', async () => {
    (apiRequest as jest.Mock).mockResolvedValue([{ id: 1 }]);

    const members = await getMyMembers('123');

    expect(apiRequest).toHaveBeenCalledWith(
      'get',
      '/recruiters',
      {},
      { companyId: '123' }
    );

    expect(members).toEqual([{ id: 1 }]);
  });

  it('removeRecruiter calls apiRequest with correct recruiterId', async () => {
    (apiRequest as jest.Mock).mockResolvedValue(undefined);

    await removeRecruiter('555');

    expect(apiRequest).toHaveBeenCalledWith(
      'delete',
      '/companies/recruiters/555'
    );
  });

  it('getCompanyProfileById returns res.data on success', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: { id: 10, name: 'Company' },
    });

    const result = await getCompanyProfileById('10');

    expect(api.get).toHaveBeenCalledWith('/companies/10');
    expect(result).toEqual({ id: 10, name: 'Company' });
  });

  it('getCompanyProfileById throws formatted error when API fails', async () => {
    (api.get as jest.Mock).mockRejectedValue({
      response: {
        status: 404,
        data: { message: 'Not found' },
      },
    });

    await expect(getCompanyProfileById('999')).rejects.toEqual({
      status: 404,
      message: 'Not found',
    });
  });

  it('getCompanyProfileById uses fallback error when no message provided', async () => {
    (api.get as jest.Mock).mockRejectedValue({});

    await expect(getCompanyProfileById('999')).rejects.toEqual({
      status: 500,
      message: 'Failed to fetch company profile',
    });
  });
});
