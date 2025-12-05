export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import CompanyInvitationPage from './CompanyInvitationPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CompanyInvitationPage />
    </Suspense>
  );
}
