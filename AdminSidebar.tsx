'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileText, FolderOpen, Tag, Image, MessageSquare,
  Users, UserCircle, Mail, BarChart2, Settings, ChevronDown, ChevronRight,
  X, Globe
} from 'lucide-react';

interface NavItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  children?: NavItem[];
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: '',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/posts', label: 'Posts', icon: FileText },
      { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
      { href: '/admin/tags', label: 'Tags', icon: Tag },
      { href: '/admin/media', label: 'Media', icon: Image },
    ],
  },
  {
    label: 'Community',
    items: [
      { href: '/admin/comments', label: 'Comments', icon: MessageSquare },
      { href: '/admin/authors', label: 'Authors', icon: UserCircle },
      { href: '/admin/subscribers', label: 'Subscribers', icon: Mail },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay on mobile */}
      {open && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 49, display: 'none' }}
          className="sidebar-overlay"
        />
      )}

      <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: '1rem' }}>P</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text)' }}>ProBlog</span>
          </Link>
          <button onClick={onClose} aria-label="Close menu" className="sidebar-close-btn" style={{ padding: '0.25rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'none' }}>
            <X size={18} />
          </button>
        </div>

        {/* View site link */}
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)' }}>
          <Link href="/" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)', textDecoration: 'none', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', transition: 'all 150ms', background: 'transparent' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; }}
          >
            <Globe size={14} /> View Site
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '0.75rem 0', flex: 1 }}>
          {navGroups.map((group, gi) => (
            <div key={gi} style={{ marginBottom: '0.5rem' }}>
              {group.label && (
                <p style={{ padding: '0.375rem 1rem 0.25rem', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
                  {group.label}
                </p>
              )}
              {group.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href!}
                  onClick={onClose}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.5625rem 1rem', marginBottom: '0.125rem', borderRadius: 'var(--radius-md)',
                    textDecoration: 'none', fontSize: '0.9rem', fontWeight: isActive(item.href!) ? 600 : 400,
                    color: isActive(item.href!) ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    background: isActive(item.href!) ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'transparent',
                    transition: 'all 150ms ease-out', marginLeft: '0.5rem', marginRight: '0.5rem',
                  }}
                  onMouseEnter={e => { if (!isActive(item.href!)) { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text)'; } }}
                  onMouseLeave={e => { if (!isActive(item.href!)) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; } }}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <style>{`
        @media (max-width: 1023px) {
          .sidebar-overlay { display: block !important; }
          .sidebar-close-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
