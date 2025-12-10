jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

jest.mock('@/utils/errorUtils', () => ({
  __esModule: true,
  handleError: jest.fn(),
}));

import api from '@/services/axios';
import { handleError } from '@/utils/errorUtils';

import {
  registerUser,
  checkUserConfirmed,
  loginUser,
  forgetPass,
  resetPass,
  resendEmail,
  logoutUser,
  logoutAll,
} from '@/services/userService';

describe('auth service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registerUser returns ok on success', async () => {
    (api.post as jest.Mock).mockResolvedValue({});

    const result = await registerUser({ email: 'a@b.com', password: '123' });

    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      email: 'a@b.com',
      password: '123',
    });

    expect(result).toEqual({ status: 'ok', error: null });
  });

  it('registerUser calls handleError on failure', async () => {
    (api.post as jest.Mock).mockRejectedValue(new Error('Bad'));

    (handleError as jest.Mock).mockReturnValue({
      status: 'error',
      error: 'Registration failed',
    });

    const res = await registerUser({ email: 'a', password: 'b' });

    expect(handleError).toHaveBeenCalled();
    expect(res).toEqual({ status: 'error', error: 'Registration failed' });
  });

  it('checkUserConfirmed returns true when confirmed', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: { confirmed: true },
    });

    const res = await checkUserConfirmed('token123');

    expect(api.get).toHaveBeenCalledWith('/auth/verify', {
      params: { token: 'token123' },
    });

    expect(res).toBe(true);
  });

  it('checkUserConfirmed throws error when request fails', async () => {
    (api.get as jest.Mock).mockRejectedValue({});

    await expect(checkUserConfirmed('x')).rejects.toThrow(
      'Failed to check confirmation status'
    );
  });

  it('loginUser returns ok on success', async () => {
    (api.post as jest.Mock).mockResolvedValue({});

    const res = await loginUser({ email: 'a', password: 'b' });

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'a',
      password: 'b',
    });

    expect(res).toEqual({ status: 'ok', error: null });
  });

  it('loginUser uses handleError on failure', async () => {
    (api.post as jest.Mock).mockRejectedValue({});

    (handleError as jest.Mock).mockReturnValue({
      status: 'error',
      error: 'Sign In failed',
    });

    const res = await loginUser({ email: 'a', password: 'b' });

    expect(handleError).toHaveBeenCalled();
    expect(res).toEqual({ status: 'error', error: 'Sign In failed' });
  });

  it('forgetPass returns ok on success', async () => {
    (api.post as jest.Mock).mockResolvedValue({});

    const res = await forgetPass({ email: 'a@b.com' });

    expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'a@b.com',
    });

    expect(res).toEqual({ status: 'ok', error: null });
  });

  it('forgetPass uses handleError on failure', async () => {
    (api.post as jest.Mock).mockRejectedValue({});

    (handleError as jest.Mock).mockReturnValue({
      status: 'error',
      error: 'Failed to send reset email',
    });

    const res = await forgetPass({ email: 'a' });

    expect(res).toEqual({
      status: 'error',
      error: 'Failed to send reset email',
    });
  });

  it('resetPass returns true when confirmed', async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: { confirmed: true },
    });

    const res = await resetPass({ token: 't', password: '123' });

    expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
      password: '123',
      token: 't',
    });

    expect(res).toBe(true);
  });

  it('resetPass throws error on failure', async () => {
    (api.post as jest.Mock).mockRejectedValue({});

    await expect(resetPass({ token: 'x', password: 'y' })).rejects.toThrow(
      'Failed to reset password'
    );
  });

  it('resendEmail returns true on success', async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: { confirmed: true },
    });

    const res = await resendEmail({ email: 'a' });

    expect(api.post).toHaveBeenCalledWith('/auth/verify/resend', {
      email: 'a',
    });

    expect(res).toBe(true);
  });

  it('resendEmail throws error on failure', async () => {
    (api.post as jest.Mock).mockRejectedValue({});

    await expect(resendEmail({ email: 'x' })).rejects.toThrow(
      'Failed to resend confirmation email'
    );
  });

  it('logoutUser returns ok on success', async () => {
    (api.post as jest.Mock).mockResolvedValue({});

    const res = await logoutUser();

    expect(api.post).toHaveBeenCalledWith('/auth/logout');
    expect(res).toEqual({
      status: 'ok',
      error: null,
      statusCode: 200,
    });
  });

  it('logoutUser returns error structure on failure', async () => {
    (api.post as jest.Mock).mockRejectedValue({
      response: { status: 400, data: { message: 'Oops' } },
    });

    const res = await logoutUser();

    expect(res).toEqual({
      status: 'error',
      error: 'Oops',
      statusCode: 400,
    });
  });

  it('logoutAll returns response.data on success', async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: { success: true },
    });

    const res = await logoutAll();

    expect(api.post).toHaveBeenCalledWith('/auth/logout-all');
    expect(res).toEqual({ success: true });
  });

  it('logoutAll throws error on failure', async () => {
    (api.post as jest.Mock).mockRejectedValue({});

    await expect(logoutAll()).rejects.toThrow('Logout failed');
  });
});
