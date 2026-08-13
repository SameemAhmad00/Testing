'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, User, Plus } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  title?: string;
}

export function AdminHeader({ onToggleSidebar, title }: AdminHeaderProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully.');
      router.replace('/admin/login');
    } catch {
      toast.error('Sign out failed.');
    }
  };

  return (
    <header style={{
      height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1.5rem', background: 'var(--color-background)',
      borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="sidebar-toggle"
          style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text)', display: 'none' }}
        >
          <Menu size={20} />
        </button>
        {title && <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)' }}>{title}</h1>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link href="/admin/posts/new" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
          <Plus size={16} /> New Post
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={14} style={{ color: '#fff' }} />
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email?.split('@')[0]}
          </span>
        </div>

        <button
          onClick={handleSignOut}
          aria-label="Sign out"
          title="Sign out"
          style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', transition: 'color 150ms' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-error)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'}
        >
          <LogOut size={18} />
        </button>
      </div>

      <style>{`
        @media (max-width: 1023px) { .sidebar-toggle { display: flex !important; } }
      `}</style>
    </header>
  );
}
