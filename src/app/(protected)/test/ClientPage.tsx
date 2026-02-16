'use client';

import { PageLayout } from '@/stories';
import { AppHeader } from '../_components/AppHeader';

export default function TestClientPage() {
  return (
    <PageLayout header={<AppHeader />} contentScrollable={true}>
      dan
    </PageLayout>
  );
}
