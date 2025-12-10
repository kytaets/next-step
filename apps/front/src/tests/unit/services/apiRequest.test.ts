jest.mock('@/services/authInterceptor', () => ({
  handleResponseError: jest.fn((err) => Promise.reject(err)),
}));

jest.mock('@/services/axios'); 

import api from '@/services/axios';
import apiRequest from '@/services/apiRequest';

describe('apiRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return data on success', async () => {
    (api.request as jest.Mock).mockResolvedValue({
      data: { ok: true },
    });

    const result = await apiRequest('GET', '/test');
    expect(result).toEqual({ ok: true });
  });

  it('should throw formatted error when errors array exists', async () => {
    (api.request as jest.Mock).mockRejectedValue({
      response: {
        status: 400,
        data: { errors: ['First error'] },
      },
    });

    await expect(apiRequest('POST', '/error')).rejects.toEqual({
      status: 400,
      message: 'First error',
    });
  });

  it('should throw formatted error when only message exists', async () => {
    (api.request as jest.Mock).mockRejectedValue({
      response: {
        status: 404,
        data: { message: 'Not found' },
      },
    });

    await expect(apiRequest('GET', '/not-found')).rejects.toEqual({
      status: 404,
      message: 'Not found',
    });
  });

  it('should throw default error when no response data', async () => {
    (api.request as jest.Mock).mockRejectedValue({});

    await expect(apiRequest('GET', '/unknown')).rejects.toEqual({
      status: 500,
      message: 'Request failed',
    });
  });
});
