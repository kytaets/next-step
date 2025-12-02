export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import SignUpPage from './SignUpPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SignUpPage />
    </Suspense>
  );
}
