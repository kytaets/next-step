export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import MyApplicationsPage from './MyApplicationsPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MyApplicationsPage />
    </Suspense>
  );
}
