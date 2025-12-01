'use client';

import { useEffect } from 'react';
import { useModalStore } from '@/store/modalSlice';

import ProfileFormModal from '@/components/ProfileItems/ProfileFormModal';
import ChooseRoleForm from './ChooseRoleForm';

interface Props {
  role?: 'job-seeker' | 'recruiter';
}

export default function CreateProfileForm({ role }: Props) {
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);

  useEffect(() => {
    openModal(
      role ? <ProfileFormModal role={role} /> : <ChooseRoleForm />,
      true
    );

    return () => {
      closeModal();
    };
  }, [openModal, closeModal, role]);

  return (
    <div className="container">
      <h1>No profile there yet</h1>
    </div>
  );
}
