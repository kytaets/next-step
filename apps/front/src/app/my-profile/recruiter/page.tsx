export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import RecruiterProfilePage from './RecruiterProfilePage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RecruiterProfilePage />
    </Suspense>
  );
}
