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
