'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authSlice';
import { logoutUser } from '@/services/userService';

import Cookies from 'js-cookie';
import PageSelect from './PageSelect';
import classes from './MainHeader.module.css';

export default function MainHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { isLogged, setIsLogged } = useAuthStore();

  const { mutate: logout } = useMutation({
    mutationFn: logoutUser,
    onSuccess: (data) => {
      if (data.statusCode !== 200 && data.statusCode !== 401) {
        console.error('Logout failed:', data.error);
        return;
      } else {
        router.push('/sign-in');
        Cookies.remove('sid');
        Cookies.remove('company-id');
        queryClient.clear();
        setIsLogged(false);
      }
    },
  });

  const role = Cookies.get('role');

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure?');
    if (confirmLogout) logout();
  };

  return (
    <header className={classes.header}>
      {/* Left block */}
      <div className={classes.left}>
        <Link className={classes['home-link']} href="/">
          <span>Next Step</span>
          <Image src="/icons/stairs.png" alt="stairs" width={50} height={50} />
        </Link>

        <div className={classes.desktopOnly}>
          <PageSelect />
        </div>
      </div>

      {/* Desktop navigation */}
      <nav className={`${classes.right} ${classes.desktopOnly}`}>
        {!isLogged && (
          <>
            <Link className={classes['no-border-btn']} href="/sign-up">
              Sign Up
            </Link>

            <Link className={classes['border-btn']} href="/sign-in">
              Sign In
            </Link>
          </>
        )}

        {isLogged && (
          <>
            <button className={classes['no-border-btn']} onClick={handleLogout}>
              Log Out
            </button>

            {role === 'JOB_SEEKER' && (
              <Link
                className={classes['no-border-btn']}
                href="/my-profile/job-seeker/applications?page=1"
              >
                My Applications
              </Link>
            )}

            <Link
              className={`${classes['border-btn']} ${
                pathname.includes('/my-profile') ? classes.active : ''
              }`}
              href={
                role === 'JOB_SEEKER'
                  ? '/my-profile/job-seeker'
                  : '/my-profile/recruiter'
              }
            >
              Profile
            </Link>
          </>
        )}
      </nav>

      {/* BURGER */}
      <button
        className={classes.burger}
        onClick={() => setMobileOpen((prev) => !prev)}
      >
        <span />
        <span />
        <span />
      </button>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className={classes.mobileMenu}
        >
          <PageSelect />

          {!isLogged && (
            <>
              <Link
                onClick={() => setMobileOpen(false)}
                className={classes['mobile-item']}
                href="/sign-up"
              >
                Sign Up
              </Link>

              <Link
                onClick={() => setMobileOpen(false)}
                className={classes['mobile-item']}
                href="/sign-in"
              >
                Sign In
              </Link>
            </>
          )}

          {isLogged && (
            <>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className={classes['mobile-item']}
              >
                Log Out
              </button>

              {role === 'JOB_SEEKER' && (
                <Link
                  onClick={() => setMobileOpen(false)}
                  className={classes['mobile-item']}
                  href="/my-profile/job-seeker/applications?page=1"
                >
                  My Applications
                </Link>
              )}

              <Link
                onClick={() => setMobileOpen(false)}
                className={classes['mobile-item']}
                href={
                  role === 'JOB_SEEKER'
                    ? '/my-profile/job-seeker'
                    : '/my-profile/recruiter'
                }
              >
                Profile
              </Link>
            </>
          )}
        </motion.div>
      )}
    </header>
  );
}
