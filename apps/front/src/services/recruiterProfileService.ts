import {
  RecruiterProfileData,
  RecruiterProfileFormData,
  UpdateRecruiterData,
} from '@/types/recruiter';
import api from './axios';
import apiRequest from './apiRequest';

export async function createRecruiterProfile(data: RecruiterProfileFormData) {
  return api
    .post('/recruiters', data)
    .then(() => ({ status: 'ok', error: null }))
    .catch((error) => {
      const message =
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.message ||
        'Creating recruiter profile failed';
      return { status: 'error', error: message };
    });
}

export async function getMyRecruiterProfile() {
  return apiRequest<RecruiterProfileData | null>('get', '/recruiters/me');
}

export async function updateRecruiterProfile(data: UpdateRecruiterData) {
  return apiRequest<void>('patch', '/recruiters/me', data);
}
