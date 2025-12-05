import { VacancyFormValues } from '@/types/vacancy';
import api from './axios';
import { UpdatedUserLanguages } from '@/types/profile';
import { VacanciesResponse, VacancySearchForm } from '@/types/vacancies';
import apiRequest from './apiRequest';

export async function getMyVacancies(companyId: string | null) {
  return apiRequest<VacanciesResponse>('post', '/vacancies/search', {
    companyId,
  });
}

export async function createVacancy(data: VacancyFormValues) {
  return api
    .post('/vacancies', data)
    .then((response) => {
      return {
        status: 'ok',
        error: null,
        data: response.data,
      };
    })
    .catch((error) => {
      const message =
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.message ||
        'Creating vacancy failed';
      return { status: 'error', error: message, data: null };
    });
}

export async function getVacancyById(id: string) {
  return api
    .get(`/vacancies/${id}`)
    .then((res) => res.data)
    .catch((error) => {
      const message =
        error?.response?.data?.message || 'Failed to fetch profile';
      throw {
        status: error?.response?.status || 500,
        message,
      };
    });
}

export async function deleteVacancy(id: string | undefined) {
  return api
    .delete(`/vacancies/${id}`)
    .then(() => ({ status: 'ok', error: null }))
    .catch((error) => {
      const message =
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.message ||
        'Creating profile failed';
      return { status: 'error', error: message };
    });
}

export async function updateVacancyLanguages({
  id,
  data,
}: {
  id: string;
  data: UpdatedUserLanguages[];
}) {
  return api
    .put(`/vacancies/${id}/languages`, { requiredLanguages: data })
    .then(() => ({ status: 'ok', error: null }))
    .catch((error) => {
      const message =
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.message ||
        'Updating languages failed';
      return { status: 'error', error: message };
    });
}

export async function updateVacancySkills({
  id,
  data,
}: {
  id: string;
  data: string[];
}) {
  return api
    .put(`/vacancies/${id}/skills`, { requiredSkillIds: data })
    .then(() => ({ status: 'ok', error: null }))
    .catch((error) => {
      const message =
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.message ||
        'Updating languages failed';
      return { status: 'error', error: message };
    });
}

export async function editVacancy({
  id,
  data,
}: {
  id: string;
  data: VacancyFormValues;
}) {
  return api
    .patch(`/vacancies/${id}`, data)
    .then((response) => {
      return {
        status: 'ok',
        error: null,
        data: response.data,
      };
    })
    .catch((error) => {
      const message =
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.message ||
        'Creating vacancy failed';
      return { status: 'error', error: message, data: null };
    });
}

export async function searchVacancies(data: VacancySearchForm) {
  try {
    const response = await api.post('/vacancies/search', data);
    return response.data;
  } catch (error: any) {
    throw {
      status: error?.response?.status ?? 500,
      message:
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.message ||
        'Searching vacancies failed',
    };
  }
}
