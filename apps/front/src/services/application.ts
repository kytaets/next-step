import { ApplicationForm, VacancyApplication } from '@/types/application';
import apiRequest from './apiRequest';

export async function sendApplication(data: ApplicationForm) {
  return apiRequest<VacancyApplication>('post', '/applications', data);
}
