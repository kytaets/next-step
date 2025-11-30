import { CompaniesSearchForm } from '@/types/companiesSearch';
import api from './axios';

export async function searchCompanies(params: CompaniesSearchForm) {
  return api
    .get('/companies/search', { params })
    .then((response) => {
      const payload = Array.isArray(response?.data)
        ? response.data
        : (response?.data?.data ?? response?.data ?? []);
      return {
        status: 'ok',
        error: null,
        data: payload ?? [],
      };
    })
    .catch((error) => {
      const message =
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.message ||
        'Search companies failed';
      return { status: 'error', error: message, data: [] };
    });
}

export async function getCompanyVacancies(companyId: string) {
  return api
    .get(`/vacancies/company/${companyId}`)
    .then((res) => {
      // normalize to array to avoid .map on null
      const payload = res?.data?.data ?? res?.data ?? [];
      return payload ?? [];
    })
    .catch((error) => {
      const message =
        error?.response?.data?.message || 'Failed to fetch profile';
      throw {
        status: error?.response?.status || 500,
        message,
      };
    });
}
