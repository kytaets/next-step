export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import CompanyVacanciesPage from './CompanyVacanciesPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CompanyVacanciesPage />
    </Suspense>
  );
}
