import {
  CompanyProfileData,
  MainInfoData,
  UpdCompanyProfileData,
} from '@/types/companyProfile';
import api from './axios';
import apiRequest from './apiRequest';
import { RecruiterProfileData } from '@/types/recruiter';

export async function getMyCompanyProfile() {
  return apiRequest<CompanyProfileData | null>('get', '/companies/my');
}

export async function updateCompanyProfile(data: UpdCompanyProfileData) {
  return apiRequest<UpdCompanyProfileData | null>(
    'patch',
    '/companies/my',
    data
  );
}

export async function createCompanyProfile(data: MainInfoData) {
  return apiRequest<CompanyProfileData | null>('post', '/companies', data);
}

export async function getCompanyProfileById(id: string) {
  return api
    .get(`/companies/${id}`)
    .then((res) => res.data)
    .catch((error) => {
      const message =
        error?.response?.data?.message || 'Failed to fetch company profile';
      throw {
        status: error?.response?.status || 500,
        message,
      };
    });
}

export async function sendInvite(data: { email: string | null }) {
  return apiRequest<void>('post', '/companies/invite', data);
}

export async function deleteCompany() {
  return apiRequest<void>('delete', '/companies/my');
}

export async function getMyMembers(companyId: string | undefined) {
  return apiRequest<RecruiterProfileData[] | null>(
    'get',
    '/recruiters',
    {},
    { companyId }
  );
}

export async function removeRecruiter(recruiterId: string) {
  return apiRequest<void>('delete', `/companies/recruiters/${recruiterId}`);
}
