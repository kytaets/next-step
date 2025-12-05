import { Suspense } from 'react';
import JobSeekersPage from './JobSeekersPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <JobSeekersPage />
    </Suspense>
  );
}
