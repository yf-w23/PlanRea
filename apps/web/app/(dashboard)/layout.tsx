import { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Providers } from '../providers';

export const metadata = {
  title: 'Dashboard - PlanRea',
  description: '智能时间管理与规划仪表盘',
};

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
