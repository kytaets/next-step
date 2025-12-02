export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import VacancyApplicationsPage from './VacancyApplicationsPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VacancyApplicationsPage />
    </Suspense>
  );
}
