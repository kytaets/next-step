jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

import api from '@/services/axios';
import { searchJobSeekers } from '@/services/jobSeekerSearchService'; // 👈 шлях підкоригуй під себе

describe('searchJobSeekers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns response.data on success', async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: [{ id: 1, name: 'John' }],
    });

    const dto = { fullname: 'John' } as any;

    const result = await searchJobSeekers(dto);

    expect(api.post).toHaveBeenCalledWith('/job-seekers/search', dto);
    expect(result).toEqual([{ id: 1, name: 'John' }]);
  });

  it('throws formatted error when API returns error message', async () => {
    (api.post as jest.Mock).mockRejectedValue({
      response: {
        status: 400,
        data: {
          message: 'Bad request',
        },
      },
    });

    await expect(searchJobSeekers({} as any)).rejects.toEqual({
      status: 400,
      message: 'Bad request',
    });
  });

  it('throws error using errors[0] if available', async () => {
    (api.post as jest.Mock).mockRejectedValue({
      response: {
        status: 422,
        data: {
          errors: ['Invalid search'],
        },
      },
    });

    await expect(searchJobSeekers({} as any)).rejects.toEqual({
      status: 422,
      message: 'Invalid search',
    });
  });

  it('throws fallback error when no details are provided', async () => {
    (api.post as jest.Mock).mockRejectedValue({});

    await expect(searchJobSeekers({} as any)).rejects.toEqual({
      status: 500,
      message: 'Searching job seekers failed',
    });
  });
});
