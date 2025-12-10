jest.mock('@/services/apiRequest', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
  },
}));

import api from '@/services/axios';
import apiRequest from '@/services/apiRequest';

import {
  getMyVacancies,
  createVacancy,
  getVacancyById,
  deleteVacancy,
  updateVacancyLanguages,
  updateVacancySkills,
  editVacancy,
  searchVacancies,
} from '@/services/vacanciesService';

describe('vacancies service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getMyVacancies calls apiRequest correctly', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({ items: [] });

    const res = await getMyVacancies('company123');

    expect(apiRequest).toHaveBeenCalledWith('post', '/vacancies/search', {
      companyId: 'company123',
    });

    expect(res).toEqual({ items: [] });
  });

  it('createVacancy returns ok with data', async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: { id: 77, title: 'Dev' },
    });

    const dto = { title: 'Dev' } as any;
    const res = await createVacancy(dto);

    expect(api.post).toHaveBeenCalledWith('/vacancies', dto);

    expect(res).toEqual({
      status: 'ok',
      error: null,
      data: { id: 77, title: 'Dev' },
    });
  });

  it('createVacancy returns error on failure', async () => {
    (api.post as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Bad data' } },
    });

    const res = await createVacancy({} as any);

    expect(res).toEqual({
      status: 'error',
      error: 'Bad data',
      data: null,
    });
  });

  it('getVacancyById returns data', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: { id: 10 },
    });

    const res = await getVacancyById('10');

    expect(api.get).toHaveBeenCalledWith('/vacancies/10');
    expect(res).toEqual({ id: 10 });
  });

  it('getVacancyById throws formatted error', async () => {
    (api.get as jest.Mock).mockRejectedValue({
      response: { status: 404, data: { message: 'Not found' } },
    });

    await expect(getVacancyById('xx')).rejects.toEqual({
      status: 404,
      message: 'Not found',
    });
  });

  it('getVacancyById throws fallback error', async () => {
    (api.get as jest.Mock).mockRejectedValue({});

    await expect(getVacancyById('xx')).rejects.toEqual({
      status: 500,
      message: 'Failed to fetch profile',
    });
  });

  it('deleteVacancy returns ok', async () => {
    (api.delete as jest.Mock).mockResolvedValue({});

    const res = await deleteVacancy('51');

    expect(api.delete).toHaveBeenCalledWith('/vacancies/51');

    expect(res).toEqual({ status: 'ok', error: null });
  });

  it('deleteVacancy returns error on fail', async () => {
    (api.delete as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Cannot delete' } },
    });

    const res = await deleteVacancy('51');

    expect(res).toEqual({
      status: 'error',
      error: 'Cannot delete',
    });
  });

  it('updateVacancyLanguages returns ok', async () => {
    (api.put as jest.Mock).mockResolvedValue({});

    const res = await updateVacancyLanguages({
      id: '1',
      data: [{ id: 1, level: 'B2' }],
    });

    expect(api.put).toHaveBeenCalledWith('/vacancies/1/languages', {
      requiredLanguages: [{ id: 1, level: 'B2' }],
    });

    expect(res).toEqual({ status: 'ok', error: null });
  });

  it('updateVacancyLanguages returns error', async () => {
    (api.put as jest.Mock).mockRejectedValue({
      response: { data: { errors: ['Error!'] } },
    });

    const res = await updateVacancyLanguages({
      id: '1',
      data: [],
    });

    expect(res).toEqual({
      status: 'error',
      error: 'Error!',
    });
  });

  it('updateVacancySkills returns ok', async () => {
    (api.put as jest.Mock).mockResolvedValue({});

    const res = await updateVacancySkills({
      id: '1',
      data: ['1', '2'],
    });

    expect(api.put).toHaveBeenCalledWith('/vacancies/1/skills', {
      requiredSkillIds: ['1', '2'],
    });

    expect(res).toEqual({ status: 'ok', error: null });
  });

  it('updateVacancySkills returns error', async () => {
    (api.put as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Bad skills' } },
    });

    const res = await updateVacancySkills({
      id: '1',
      data: ['x'],
    });

    expect(res).toEqual({
      status: 'error',
      error: 'Bad skills',
    });
  });

  it('editVacancy returns ok with response.data', async () => {
    (api.patch as jest.Mock).mockResolvedValue({
      data: { id: 5, title: 'Updated' },
    });

    const res = await editVacancy({
      id: '5',
      data: { title: 'Updated' } as any,
    });

    expect(api.patch).toHaveBeenCalledWith('/vacancies/5', {
      title: 'Updated',
    });

    expect(res).toEqual({
      status: 'ok',
      error: null,
      data: { id: 5, title: 'Updated' },
    });
  });

  it('editVacancy returns error on failure', async () => {
    (api.patch as jest.Mock).mockRejectedValue({
      response: { data: { errors: ['Oops!'] } },
    });

    const res = await editVacancy({
      id: '5',
      data: {} as any,
    });

    expect(res).toEqual({
      status: 'error',
      error: 'Oops!',
      data: null,
    });
  });

  it('searchVacancies returns data on success', async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: [{ id: 1 }],
    });

    const res = await searchVacancies({ q: 'React' } as any);

    expect(api.post).toHaveBeenCalledWith('/vacancies/search', { q: 'React' });
    expect(res).toEqual([{ id: 1 }]);
  });

  it('searchVacancies throws formatted error on fail', async () => {
    (api.post as jest.Mock).mockRejectedValue({
      response: { status: 404, data: { message: 'No results' } },
    });

    await expect(searchVacancies({} as any)).rejects.toEqual({
      status: 404,
      message: 'No results',
    });
  });

  it('searchVacancies throws fallback error', async () => {
    (api.post as jest.Mock).mockRejectedValue({});

    await expect(searchVacancies({} as any)).rejects.toEqual({
      status: 500,
      message: 'Searching vacancies failed',
    });
  });
});
