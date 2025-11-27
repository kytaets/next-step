import {
  RecruiterProfileData,
  RecruiterProfileFormData,
  UpdateRecruiterData,
} from '@/types/recruiter';
import apiRequest from './apiRequest';

export async function createRecruiterProfile(data: RecruiterProfileFormData) {
  return apiRequest<RecruiterProfileFormData>('post', '/recruiters', data);
}

export async function getMyRecruiterProfile() {
  return apiRequest<RecruiterProfileData | null>('get', '/recruiters/me');
}

export async function updateRecruiterProfile(data: UpdateRecruiterData) {
  return apiRequest<void>('patch', '/recruiters/me', data);
}
