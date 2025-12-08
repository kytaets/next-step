'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import CompanyInvitationModal from '@/components/CompanyProfileItems/CompanyInvitationModal';
import { useModalStore } from '@/store/modalSlice';
import { acceptInvite } from '@/services/recruiterProfileService';

export default function CompanyInvitationPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);

  const { isSuccess, isLoading, isError, error } = useQuery({
    queryKey: ['company-invitation', token],
    queryFn: ({ queryKey }) => acceptInvite(queryKey[1]),
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (!token) return;

    if (isSuccess) {
      router.replace('/my-profile/recruiter/company');
      return;
    }

    if (isError && (error as any)?.status === 403) {
      router.replace('/my-profile/recruiter');
      return;
    }

    let status: 'success' | 'loading' | 'error' = 'loading';

    if (isLoading) status = 'loading';
    if (isSuccess) status = 'success';
    if (isError) status = 'error';

    openModal(<CompanyInvitationModal status={status} />, true);

    return () => closeModal();
  }, [isSuccess, isLoading, isError, error, openModal, closeModal, router]);

  return null;
}
