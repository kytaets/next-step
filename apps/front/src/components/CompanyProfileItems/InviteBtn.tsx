'use client';
import HoveredItem from '../HoveredItem/HoveredItem';

import classes from './CompanyProfile.module.css';
import { useModalStore } from '@/store/modalSlice';
import InvitationModal from './InvitationModal';

export default function InviteBtn() {
  const openModal = useModalStore((state) => state.openModal);

  return (
    <>
      <button
        className={classes['invite-btn']}
        onClick={() => openModal(<InvitationModal />)}
      >
        <HoveredItem>Invite + </HoveredItem>
      </button>
    </>
  );
}
