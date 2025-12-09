'use client';
import HoveredItem from '../HoveredItem/HoveredItem';

import classes from './ApplicationItems.module.css';
import { useModalStore } from '@/store/modalSlice';
import { AnimatePresence } from 'framer-motion';
import ApplyFormModal from './ApplyFormModal';

interface Props {
  vacancyId: string | undefined;
}

export default function ApplyBtn({ vacancyId }: Props) {
  const openModal = useModalStore((state) => state.openModal);

  const handleClick = () => {
    openModal(
      <AnimatePresence>
        <ApplyFormModal vacancyId={vacancyId} />
      </AnimatePresence>
    );
  };

  return (
    <button
      className={classes['apply-btn']}
      id="apply-btn"
      onClick={handleClick}
    >
      <HoveredItem>Apply for a job</HoveredItem>
    </button>
  );
}
