'use client';
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';

import ResetPasswordForm from '@/components/SignUpItems/ResetPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <>
      <Suspense fallback={null}>
        <AnimatePresence>
          <ResetPasswordForm />
        </AnimatePresence>
      </Suspense>
    </>
  );
}
