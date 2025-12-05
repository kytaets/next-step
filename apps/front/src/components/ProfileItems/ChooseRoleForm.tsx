'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import HoveredItem from '../HoveredItem/HoveredItem';

import classes from './Profile.module.css';

import Cookies from 'js-cookie';

export default function ChooseRoleForm() {
  const router = useRouter();

  const stepUpHandler = (role: string) => {
    Cookies.set('role', role);

    if (role === 'JOB_SEEKER') router.push('/my-profile/job-seeker');
    if (role === 'RECRUITER') router.push('/my-profile/recruiter');
  };

  return (
    <div>
      <motion.div
        className={classes['role-form-container']}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 30 }}
        transition={{ duration: 0.4 }}
      >
        <h3>Choose your role</h3>
        <div className={classes['role-form']}>
          <HoveredItem>
            <label className={classes['role-btn']}>
              <input
                type="radio"
                name="role"
                value="JOB_SEEKER"
                onChange={() => stepUpHandler('JOB_SEEKER')}
              />
              <span> Job Seeker</span>
            </label>
          </HoveredItem>
          <HoveredItem>
            <label className={classes['role-btn']}>
              <input
                type="radio"
                name="role"
                value="RECRUITER"
                onChange={() => stepUpHandler('RECRUITER')}
              />
              <span>Recruiter</span>
            </label>
          </HoveredItem>
        </div>
      </motion.div>
    </div>
  );
}
