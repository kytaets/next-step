export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import CompaniesPage from './CompaniesPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CompaniesPage />
    </Suspense>
  );
}
