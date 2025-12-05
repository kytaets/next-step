import {
  RecruiterProfileData,
  RecruiterProfileFormData,
  UpdateRecruiterData,
} from '@/types/recruiter';
import apiRequest from './apiRequest';
import api from './axios';

export async function createRecruiterProfile(data: RecruiterProfileFormData) {
  return apiRequest<RecruiterProfileFormData>('post', '/recruiters', data);
}

export async function getMyRecruiterProfile() {
  return apiRequest<RecruiterProfileData | null>('get', '/recruiters/me');
}

export async function updateRecruiterProfile(data: UpdateRecruiterData) {
  return apiRequest<void>('patch', '/recruiters/me', data);
}

export async function leaveCompany() {
  return apiRequest<void>('delete', '/recruiters/me/company');
}

export async function acceptInvite(token: string | null) {
  try {
    const response = await api.post(
      `/recruiters/invite/accept`,
      {},
      { params: { token } }
    );

    return !!response.data.confirmed;
  } catch (error: any) {
    const status = error?.response?.status ?? 500;
    const message =
      error?.response?.data?.message ?? 'Invite confirmation failed';

    throw { status, message };
  }
}
