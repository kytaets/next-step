export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import ApplicationPage from './ApplicationPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ApplicationPage />
    </Suspense>
  );
}
