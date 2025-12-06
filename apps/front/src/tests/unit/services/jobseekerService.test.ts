jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
  },
}));

import api from '@/services/axios';

import {
  createProfile,
  getProfile,
  updatePersonalData,
  getSkills,
  createNewSkill,
  updateSkills,
  getLanguages,
  updateUserLanguages,
  updateUserContacts,
  getProfileById,
} from '@/services/jobseekerService';

describe('profile service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------
  // createProfile
  // -----------------------------

  it('createProfile returns ok on success', async () => {
    (api.post as jest.Mock).mockResolvedValue({});

    const result = await createProfile({} as any);

    expect(api.post).toHaveBeenCalledWith('/job-seekers', {});
    expect(result).toEqual({ status: 'ok', error: null });
  });

  it('createProfile returns error on failure', async () => {
    (api.post as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Bad request' } },
    });

    const result = await createProfile({} as any);

    expect(result).toEqual({
      status: 'error',
      error: 'Bad request',
    });
  });

  // -----------------------------
  // getProfile
  // -----------------------------

  it('getProfile returns res.data', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { id: 1 } });

    const res = await getProfile();

    expect(api.get).toHaveBeenCalledWith('/job-seekers/me');
    expect(res).toEqual({ id: 1 });
  });

  it('getProfile throws formatted error', async () => {
    (api.get as jest.Mock).mockRejectedValue({
      response: { status: 403, data: { message: 'Forbidden' } },
    });

    await expect(getProfile()).rejects.toEqual({
      status: 403,
      message: 'Forbidden',
    });
  });

  // -----------------------------
  // updatePersonalData
  // -----------------------------

  it('updatePersonalData returns ok', async () => {
    (api.patch as jest.Mock).mockResolvedValue({});

    const res = await updatePersonalData({} as any);

    expect(api.patch).toHaveBeenCalledWith('/job-seekers/me', {});
    expect(res).toEqual({ status: 'ok', error: null });
  });

  it('updatePersonalData handles errors', async () => {
    (api.patch as jest.Mock).mockRejectedValue({
      response: { data: { errors: ['Invalid data'] } },
    });

    const res = await updatePersonalData({} as any);

    expect(res).toEqual({
      status: 'error',
      error: 'Invalid data',
    });
  });

  // -----------------------------
  // getSkills
  // -----------------------------

  it('getSkills returns data on success', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: [{ id: 1 }],
    });

    const res = await getSkills();

    expect(api.get).toHaveBeenCalledWith('/skills');
    expect(res).toEqual([{ id: 1 }]);
  });

  it('getSkills throws formatted error', async () => {
    (api.get as jest.Mock).mockRejectedValue({});

    await expect(getSkills()).rejects.toEqual({
      status: 500,
      message: 'Failed to fetch skills',
    });
  });

  // -----------------------------
  // createNewSkill
  // -----------------------------

  it('createNewSkill returns ok with data', async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: { id: 99, name: 'React' },
    });

    const res = await createNewSkill({ name: 'React' });

    expect(api.post).toHaveBeenCalledWith('/skills', { name: 'React' });
    expect(res).toEqual({
      status: 'ok',
      error: null,
      data: { id: 99, name: 'React' },
    });
  });

  it('createNewSkill returns error', async () => {
    (api.post as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Fail' } },
    });

    const res = await createNewSkill({ name: 'JS' });

    expect(res).toEqual({
      status: 'error',
      error: 'Fail',
    });
  });

  // -----------------------------
  // updateSkills
  // -----------------------------

  it('updateSkills returns ok', async () => {
    (api.put as jest.Mock).mockResolvedValue({});

    const res = await updateSkills({} as any);

    expect(api.put).toHaveBeenCalledWith('/job-seekers/me/skills', {});
    expect(res).toEqual({ status: 'ok', error: null });
  });

  it('updateSkills returns error on failure', async () => {
    (api.put as jest.Mock).mockRejectedValue({
      response: { data: { errors: ['Bad'] } },
    });

    const res = await updateSkills({} as any);

    expect(res).toEqual({ status: 'error', error: 'Bad' });
  });

  // -----------------------------
  // getLanguages
  // -----------------------------

  it('getLanguages returns data', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: [{ id: 7 }],
    });

    const res = await getLanguages();

    expect(api.get).toHaveBeenCalledWith('/languages');
    expect(res).toEqual([{ id: 7 }]);
  });

  it('getLanguages throws error', async () => {
    (api.get as jest.Mock).mockRejectedValue({});

    await expect(getLanguages()).rejects.toEqual({
      status: 500,
      message: 'Failed to fetch skills',
    });
  });

  // -----------------------------
  // updateUserLanguages
  // -----------------------------

  it('updateUserLanguages returns ok', async () => {
    (api.put as jest.Mock).mockResolvedValue({});

    const payload = [{ id: 1, level: 'B2' }];

    const res = await updateUserLanguages(payload);

    expect(api.put).toHaveBeenCalledWith('/job-seekers/me/languages', {
      languages: payload,
    });

    expect(res).toEqual({ status: 'ok', error: null });
  });

  it('updateUserLanguages returns error', async () => {
    (api.put as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Wrong' } },
    });

    const res = await updateUserLanguages([{ id: 1 }] as any);

    expect(res).toEqual({ status: 'error', error: 'Wrong' });
  });

  // -----------------------------
  // updateUserContacts
  // -----------------------------

  it('updateUserContacts returns ok', async () => {
    (api.put as jest.Mock).mockResolvedValue({});

    const res = await updateUserContacts({} as any);

    expect(api.put).toHaveBeenCalledWith('/job-seekers/me/contacts', {});
    expect(res).toEqual({ status: 'ok', error: null });
  });

  it('updateUserContacts returns error', async () => {
    (api.put as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Fail!' } },
    });

    const res = await updateUserContacts({} as any);

    expect(res).toEqual({ status: 'error', error: 'Fail!' });
  });

  // -----------------------------
  // getProfileById
  // -----------------------------

  it('getProfileById returns res.data', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: { id: 55 },
    });

    const res = await getProfileById('55');

    expect(api.get).toHaveBeenCalledWith('/job-seekers/55');
    expect(res).toEqual({ id: 55 });
  });

  it('getProfileById throws formatted error', async () => {
    (api.get as jest.Mock).mockRejectedValue({
      response: { status: 404, data: { message: 'Not found' } },
    });

    await expect(getProfileById('10')).rejects.toEqual({
      status: 404,
      message: 'Not found',
    });
  });

  it('getProfileById throws fallback error', async () => {
    (api.get as jest.Mock).mockRejectedValue({});

    await expect(getProfileById('10')).rejects.toEqual({
      status: 500,
      message: 'Failed to fetch profile',
    });
  });
});
