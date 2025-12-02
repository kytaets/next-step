export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import CompanyMembers from './CompanyMembers';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CompanyMembers />
    </Suspense>
  );
}
