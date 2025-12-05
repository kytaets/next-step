import { JobSeekerSearchForm } from '@/types/jobSeekerSearch';
import api from './axios';

export async function searchJobSeekers(data: JobSeekerSearchForm) {
  try {
    const response = await api.post('/job-seekers/search', data);
    return response.data;
  } catch (error: any) {
    throw {
      status: error?.response?.status ?? 500,
      message:
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.message ||
        'Searching job seekers failed',
    };
  }
}
