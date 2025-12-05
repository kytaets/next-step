export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import ProfilePage from './ProfilePage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProfilePage />
    </Suspense>
  );
}
