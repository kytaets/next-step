import api from './axios';
import { AxiosError, Method } from 'axios';

export async function apiRequest<T>(
  method: Method,
  url: string,
  data?: unknown
): Promise<T> {
  try {
    const response = await api.request<T>({
      method,
      url,
      data,
    });

    return response.data;
  } catch (err: unknown) {
    const error = err as AxiosError<{
      message?: string;
      errors?: string[];
    }>;

    const message =
      error?.response?.data?.errors?.[0] ||
      error?.response?.data?.message ||
      'Request failed';

    throw {
      status: error.response?.status ?? 500,
      message,
    };
  }
}

export default apiRequest;
