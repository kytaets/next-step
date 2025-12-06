jest.mock('@/services/apiRequest', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

import apiRequest from '@/services/apiRequest';
import api from '@/services/axios';

import {
  createRecruiterProfile,
  getMyRecruiterProfile,
  updateRecruiterProfile,
  leaveCompany,
  acceptInvite,
} from '@/services/recruiterProfileService';

describe('recruiter service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------
  // apiRequest-based functions
  // -----------------------------

  it('createRecruiterProfile calls apiRequest correctly', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({ id: 1 });

    const dto = { name: 'John' } as any;

    const result = await createRecruiterProfile(dto);

    expect(apiRequest).toHaveBeenCalledWith('post', '/recruiters', dto);

    expect(result).toEqual({ id: 1 });
  });

  it('getMyRecruiterProfile calls apiRequest', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({ id: 22 });

    const result = await getMyRecruiterProfile();

    expect(apiRequest).toHaveBeenCalledWith('get', '/recruiters/me');

    expect(result).toEqual({ id: 22 });
  });

  it('updateRecruiterProfile calls apiRequest with correct data', async () => {
    (apiRequest as jest.Mock).mockResolvedValue(undefined);

    const dto = { phone: '+123' } as any;

    const result = await updateRecruiterProfile(dto);

    expect(apiRequest).toHaveBeenCalledWith('patch', '/recruiters/me', dto);

    expect(result).toBeUndefined();
  });

  it('leaveCompany calls apiRequest', async () => {
    (apiRequest as jest.Mock).mockResolvedValue(undefined);

    await leaveCompany();

    expect(apiRequest).toHaveBeenCalledWith('delete', '/recruiters/me/company');
  });

  // -----------------------------
  // acceptInvite
  // -----------------------------

  it('acceptInvite returns true when confirmed = true', async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: { confirmed: true },
    });

    const result = await acceptInvite('abc123');

    expect(api.post).toHaveBeenCalledWith(
      '/recruiters/invite/accept',
      {},
      { params: { token: 'abc123' } }
    );

    expect(result).toBe(true);
  });

  it('acceptInvite returns false when confirmed = false', async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: { confirmed: false },
    });

    const result = await acceptInvite('abc123');

    expect(result).toBe(false);
  });

  it('acceptInvite throws formatted error on failure', async () => {
    (api.post as jest.Mock).mockRejectedValue({
      response: {
        status: 404,
        data: { message: 'Token expired' },
      },
    });

    await expect(acceptInvite('badtoken')).rejects.toEqual({
      status: 404,
      message: 'Token expired',
    });
  });

  it('acceptInvite throws fallback error on failure with no message', async () => {
    (api.post as jest.Mock).mockRejectedValue({});

    await expect(acceptInvite(null)).rejects.toEqual({
      status: 500,
      message: 'Invite confirmation failed',
    });
  });
});
