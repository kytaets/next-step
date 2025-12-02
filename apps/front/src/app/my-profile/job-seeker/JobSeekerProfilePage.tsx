'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import MessageBox from '@/components/MessageBox/MessageBox';
import ProfileContainer from '@/components/ProfileItems/ProfileContainer';

import classes from './page.module.css';

import { ProfileData } from '@/types/profile';
import { ApiError } from '@/types/authForm';
import { useModalStore } from '@/store/modalSlice';
import { getProfile } from '@/services/jobseekerService';
import Cookies from 'js-cookie';
import ProfileFormModal from '@/components/ProfileItems/ProfileFormModal';

export default function JobSeekerProfilePage() {
  const router = useRouter();
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);

  const {
    data: profileData,
    isError,
    error,
  } = useQuery<ProfileData | null, ApiError>({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 1000,
    retry: false,
  });

  useEffect(() => {
    if (isError && error?.status === 404) {
      openModal(<ProfileFormModal role="job-seeker" />, true);
    }
    if (profileData) {
      Cookies.set('role', 'JOB_SEEKER');
      closeModal();
    }

    return () => {
      closeModal();
    };
  }, [isError, error, profileData, openModal, closeModal, router]);

  if (isError && error?.status !== 403)
    return (
      <div className={classes['profile-message-box']}>
        <MessageBox type="info">
          <p>Error loading profile: {error?.message || 'Unexpected error'}</p>
        </MessageBox>
      </div>
    );

  if (!profileData) return null;
  else console.log(profileData);

  return (
    <div className="container">
      <ProfileContainer isEditable profileData={profileData} />
    </div>
  );
}
