export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import CompanyPage from './CompanyPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CompanyPage />
    </Suspense>
  );
}
