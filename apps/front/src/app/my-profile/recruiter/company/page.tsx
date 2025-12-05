export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import CompanyProfilePage from './CompanyProfilePage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CompanyProfilePage />
    </Suspense>
  );
}
