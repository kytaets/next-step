export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import CompanyVacancies from './CompanyVacancies';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CompanyVacancies />
    </Suspense>
  );
}
