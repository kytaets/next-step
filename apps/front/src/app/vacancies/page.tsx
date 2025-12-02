export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import VacanciesPage from './VacanciesPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VacanciesPage />
    </Suspense>
  );
}
