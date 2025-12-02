export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import ConfirmPage from './ConfirmPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ConfirmPage />
    </Suspense>
  );
}
