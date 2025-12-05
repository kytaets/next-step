export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import EditVacancy from './EditVacancyPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <EditVacancy />
    </Suspense>
  );
}
