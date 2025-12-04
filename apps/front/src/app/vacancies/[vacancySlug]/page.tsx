export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import VacancyPage from './VacancyPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VacancyPage />
    </Suspense>
  );
}
