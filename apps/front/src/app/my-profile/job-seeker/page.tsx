export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import JobSeekerProfilePage from './JobSeekerProfilePage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <JobSeekerProfilePage />
    </Suspense>
  );
}
