jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

import api from '@/services/axios';
import {
  searchCompanies,
  getCompanyVacancies,
} from '@/services/companiesSearchService';

describe('companies service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------
  // searchCompanies
  // -----------------------

  it('searchCompanies: returns normalized array when API returns array', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: [{ id: 1 }, { id: 2 }],
    });

    const result = await searchCompanies({ name: 'Test' } as any);

    expect(api.get).toHaveBeenCalledWith('/companies', {
      params: { name: 'Test' },
    });

    expect(result).toEqual({
      status: 'ok',
      error: null,
      data: [{ id: 1 }, { id: 2 }],
    });
  });

  it('searchCompanies: normalizes data.data → data', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: {
        data: [{ id: 5 }],
      },
    });

    const result = await searchCompanies({ name: 'Nike' } as any);

    expect(result).toEqual({
      status: 'ok',
      error: null,
      data: [{ id: 5 }],
    });
  });

  it('searchCompanies: returns error structure on failure', async () => {
    (api.get as jest.Mock).mockRejectedValue({
      response: {
        data: { message: 'Bad request' },
      },
    });

    const result = await searchCompanies({} as any);

    expect(result).toEqual({
      status: 'error',
      error: 'Bad request',
      data: [],
    });
  });

  it('searchCompanies: fallback error message when no error provided', async () => {
    (api.get as jest.Mock).mockRejectedValue({});

    const result = await searchCompanies({} as any);

    expect(result).toEqual({
      status: 'error',
      error: 'Search companies failed',
      data: [],
    });
  });

  // -----------------------
  // getCompanyVacancies
  // -----------------------

  it('getCompanyVacancies: normalizes data.data → array', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: {
        data: [{ id: 11 }],
      },
    });

    const result = await getCompanyVacancies('123');

    expect(api.get).toHaveBeenCalledWith('/vacancies/company/123');
    expect(result).toEqual([{ id: 11 }]);
  });

  it('getCompanyVacancies: returns empty array when API returns null', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: null,
    });

    const result = await getCompanyVacancies('456');

    expect(result).toEqual([]);
  });

  it('getCompanyVacancies: throws formatted error on failure', async () => {
    (api.get as jest.Mock).mockRejectedValue({
      response: {
        status: 404,
        data: { message: 'Company not found' },
      },
    });

    await expect(getCompanyVacancies('999')).rejects.toEqual({
      status: 404,
      message: 'Company not found',
    });
  });

  it('getCompanyVacancies: fallback error message when no details present', async () => {
    (api.get as jest.Mock).mockRejectedValue({});

    await expect(getCompanyVacancies('999')).rejects.toEqual({
      status: 500,
      message: 'Failed to fetch profile',
    });
  });
});
