'use client';

import CompanyMembersContainer from '@/components/CompanyProfileItems/CompanyMembersContainer';
import MessageBox from '@/components/MessageBox/MessageBox';
import { getMyMembers } from '@/services/companyProfileService';
import { ApiError } from '@/types/authForm';
import { RecruiterProfileData } from '@/types/recruiter';
import { useQuery } from '@tanstack/react-query';

import Cookies from 'js-cookie';

export default function CompanyMembers() {
  const companyId = Cookies.get('company-id');

  const {
    data: myMembers,
    isPending,
    error,
    isError,
  } = useQuery<RecruiterProfileData[] | null, ApiError>({
    queryKey: ['company-members', companyId],
    queryFn: () => getMyMembers(companyId),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  console.log('myMembers:', myMembers);

  return (
    <div className="container">
      <h1 className="page-header">Your Company Members</h1>
      {isPending && <MessageBox>Loading your members...</MessageBox>}
      {isError && <MessageBox>{error.message}</MessageBox>}

      <CompanyMembersContainer members={myMembers} />
    </div>
  );
}
