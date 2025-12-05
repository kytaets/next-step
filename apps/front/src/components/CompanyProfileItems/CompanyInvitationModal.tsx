'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import classes from './CompanyProfile.module.css';

interface Props {
  status: 'success' | 'loading' | 'error';
}

export default function CompanyInvitationModal({ status }: Props) {
  let message = '';
  let imageUrl = '/images/';

  if (status === 'success') {
    imageUrl += 'check-arrow.png';
    message = 'Your invitation was successfully accepted!';
  }

  if (status === 'loading') {
    imageUrl += 'loading-spin.gif';
    message = 'Wait while we are verifying your invitation...';
  }

  if (status === 'error') {
    imageUrl += 'black-on-white-cross.png';
    message = 'Sorry! We were unable to accept your invitation.';
  }

  return (
    <motion.div
      className={classes['check-box']}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.4 }}
    >
      <div className={classes['image-container']}>
        <Image
          src={imageUrl}
          alt="verification result"
          width={300}
          height={200}
          priority
        />
      </div>

      <h2>{message}</h2>
      {status === 'success' && (
        <h3>
          You can now go to{' '}
          <Link href="/my-profile/recruiter/company">your company page</Link>
        </h3>
      )}
    </motion.div>
  );
}
