'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import ProfileFormModal from '@/components/ProfileItems/ProfileFormModal';
import MessageBox from '@/components/MessageBox/MessageBox';
import RecruiterProfileContainer from '@/components/RecruiterProfileItems/RecruiterProfileContainer';

import classes from './page.module.css';

import { RecruiterProfileData } from '@/types/recruiter';
import { ApiError } from '@/types/authForm';
import { getMyRecruiterProfile } from '@/services/recruiterProfileService';
import { useModalStore } from '@/store/modalSlice';
import Cookies from 'js-cookie';

export default function RecruiterProfilePage() {
  const router = useRouter();
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);

  const {
    data: recruiterData,
    isError,
    error,
  } = useQuery<RecruiterProfileData | null, ApiError>({
    queryKey: ['recruiter-profile'],
    queryFn: getMyRecruiterProfile,
    staleTime: 1000,
    retry: false,
  });

  useEffect(() => {
    if (isError && error?.status === 401) {
      router.push('/sign-in');
    }
    if (isError && error?.status === 404) {
      openModal(<ProfileFormModal role="recruiter" />, true);
    }
    if (recruiterData) {
      Cookies.set('role', 'RECRUITER');
      closeModal();
    }
  }, [isError, error, recruiterData, openModal, closeModal, router]);

  if (isError && error?.status !== 403)
    return (
      <div className={classes['profile-message-box']}>
        <MessageBox type="error">
          <p>Error loading profile: {error?.message || 'Unexpected error'}</p>
        </MessageBox>
      </div>
    );

  if (!recruiterData) return null;
  else console.log(recruiterData);

  return (
    <div className="container">
      <RecruiterProfileContainer isEditable recruiterData={recruiterData} />
    </div>
  );
}
