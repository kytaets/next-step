import { RecruiterProfileData } from '@/types/recruiter';
import api from './axios';

export async function createRecruiterProfile(data: RecruiterProfileData) {
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
