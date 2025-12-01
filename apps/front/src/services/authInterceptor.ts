import { AxiosError } from 'axios';

const AUTH_COOKIES = ['company-id', 'sid', 'recruiter-role'] as const;

export const clearAuthCookies = (): void => {
  AUTH_COOKIES.forEach((cookieName) => {
    document.cookie = `${cookieName}=; Max-Age=0; path=/;`;
  });
};

export const redirectToSignIn = (): void => {
  if (typeof window !== 'undefined') {
    window.location.href = '/sign-in';
  }
};

export const handleUnauthorizedError = (): void => {
  clearAuthCookies();
  redirectToSignIn();
};

export const handleResponseError = (error: AxiosError): Promise<AxiosError> => {
  const status = error?.response?.status;

  if (status === 401) {
    handleUnauthorizedError();
  }

  return Promise.reject(error);
};
