jest.mock('@/services/apiRequest', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import apiRequest from '@/services/apiRequest';
import {
  sendApplication,
  getMyApplications,
  getApplication,
  getVacancyApplications,
  updateApplicationStatus,
} from '@/services/application';

describe('application service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sendApplication should call apiRequest with correct params', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({ ok: true });

    const data = { name: 'John', cv: 'link' } as any;

    const result = await sendApplication(data);

    expect(apiRequest).toHaveBeenCalledWith('post', '/applications', data);
    expect(result).toEqual({ ok: true });
  });

  it('getMyApplications should call apiRequest with correct params', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({ list: [] });

    const result = await getMyApplications();

    expect(apiRequest).toHaveBeenCalledWith(
      'get',
      '/applications/job-seekers/my'
    );
    expect(result).toEqual({ list: [] });
  });

  it('getApplication should call apiRequest with correct params', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({ id: '123' });

    const result = await getApplication('123');

    expect(apiRequest).toHaveBeenCalledWith('get', '/applications/123');
    expect(result).toEqual({ id: '123' });
  });

  it('getVacancyApplications should call apiRequest with correct params', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({ items: [] });

    const result = await getVacancyApplications('55');

    expect(apiRequest).toHaveBeenCalledWith(
      'get',
      '/applications/vacancies/55'
    );
    expect(result).toEqual({ items: [] });
  });

  it('updateApplicationStatus should call apiRequest with correct params', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({ success: true });

    const result = await updateApplicationStatus('77', { status: 'approved' });

    expect(apiRequest).toHaveBeenCalledWith('put', '/applications/77/status', {
      status: 'approved',
    });
    expect(result).toEqual({ success: true });
  });
});
