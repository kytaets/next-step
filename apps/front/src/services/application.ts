import {
  ApplicationForm,
  VacancyApplication,
  VacancyApplicationResponse,
} from '@/types/application';
import apiRequest from './apiRequest';

export async function sendApplication(data: ApplicationForm) {
  return apiRequest<VacancyApplication>('post', '/applications', data);
}

export async function getMyApplications() {
  return apiRequest<VacancyApplicationResponse>(
    'get',
    '/applications/job-seekers/my'
  );
}

export async function getApplication(vacancyId: string) {
  return apiRequest<VacancyApplication | null>(
    'get',
    `/applications/${vacancyId}`
  );
}

export async function getVacancyApplications(vacancyId: string) {
  return apiRequest<VacancyApplicationResponse | null>(
    'get',
    `/applications/vacancies/${vacancyId}`
  );
}
