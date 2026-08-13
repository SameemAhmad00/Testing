'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/admin/AuthGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-background)' }}>
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="admin-content" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main style={{ flex: 1, padding: '1.5rem 2rem', overflowX: 'hidden' }}>
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
