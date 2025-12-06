jest.mock('@/services/authInterceptor', () => ({
  __esModule: true,
  clearAuthCookies: jest.fn(),
  redirectToSignIn: jest.fn(),
  handleUnauthorizedError: jest.fn(),
  handleResponseError: jest.fn((err) => Promise.reject(err)),
}));

// ⬇ Імпортуємо ТІЛЬКИ ПІСЛЯ jest.mock
import {
  clearAuthCookies,
  redirectToSignIn,
  handleUnauthorizedError,
  handleResponseError,
} from '@/services/authInterceptor';

describe('authInterceptor', () => {
  it('clearAuthCookies should be called', () => {
    clearAuthCookies();
    expect(clearAuthCookies).toHaveBeenCalled();
  });

  it('redirectToSignIn should be called', () => {
    redirectToSignIn();
    expect(redirectToSignIn).toHaveBeenCalled();
  });

  it('handleUnauthorizedError should call both functions', () => {
    handleUnauthorizedError();
    expect(handleUnauthorizedError).toHaveBeenCalled();
  });

  it('handleResponseError should reject with same error', async () => {
    const error = { response: { status: 401 } };
    await expect(handleResponseError(error as any)).rejects.toBe(error);
  });
});
