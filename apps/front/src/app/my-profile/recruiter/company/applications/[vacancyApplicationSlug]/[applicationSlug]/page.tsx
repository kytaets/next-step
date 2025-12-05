export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import VacancyApplicationPage from './VacancyApplicationPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VacancyApplicationPage />
    </Suspense>
  );
}
