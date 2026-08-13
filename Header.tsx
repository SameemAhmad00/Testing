'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X, Sun, Moon, Monitor, Bell } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/categories', label: 'Categories' },
  { href: '/authors', label: 'Authors' },
  { href: '/about', label: 'About' },
];

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const icons = { light: Sun, dark: Moon, system: Monitor };
  const next: Record<string, 'light' | 'dark' | 'system'> = { light: 'dark', dark: 'system', system: 'light' };
  const Icon = icons[theme] || Monitor;
  return (
    <button
      onClick={() => setTheme(next[theme])}
      aria-label={`Switch theme (current: ${theme})`}
      className="p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
      style={{ color: 'var(--color-text-muted)' }}
    >
      <Icon size={18} />
    </button>
  );
}

export function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 100);
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: scrolled ? 'color-mix(in srgb, var(--color-background) 90%, transparent)' : 'var(--color-background)',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: '1px solid var(--color-border)',
          transition: 'all 250ms ease-out',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', height: scrolled ? '56px' : '68px', gap: '1rem', transition: 'height 250ms ease-out' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', fontFamily: 'var(--font-ui)' }}>P</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-text)', fontFamily: 'var(--font-ui)' }}>ProBlog</span>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: '1.5rem', flex: 1 }} className="desktop-nav">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: pathname === link.href ? 600 : 400,
                  color: pathname === link.href ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  textDecoration: 'none',
                  transition: 'all 150ms ease-out',
                  background: pathname === link.href ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'transparent',
                }}
                onMouseEnter={e => { if (pathname !== link.href) (e.currentTarget as HTMLElement).style.color = 'var(--color-text)'; (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'; }}
                onMouseLeave={e => { if (pathname !== link.href) { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}
            >
              <Search size={18} />
            </button>
            <ThemeToggle />
            <Link
              href="/subscribe"
              style={{
                padding: '0.5rem 1rem', background: 'var(--color-accent)', color: '#fff',
                borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 600,
                textDecoration: 'none', marginLeft: '0.5rem', transition: 'background 150ms ease-out',
                whiteSpace: 'nowrap',
              }}
              className="subscribe-btn"
            >
              Subscribe
            </Link>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text)', display: 'none' }}
              className="mobile-menu-btn"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden', borderTop: '1px solid var(--color-border)' }}
            >
              <form onSubmit={handleSearch} style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
                <Search size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                <input
                  ref={searchRef}
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search articles, authors, topics..."
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    fontSize: '1rem', color: 'var(--color-text)', fontFamily: 'var(--font-ui)',
                  }}
                />
                <button type="submit" style={{ padding: '0.375rem 1rem', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'fixed', inset: 0, zIndex: 99,
              background: 'var(--color-background)',
              display: 'flex', flexDirection: 'column',
              padding: '5rem 2rem 2rem',
            }}
          >
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: '0.875rem 1rem', borderRadius: 'var(--radius-lg)',
                    fontSize: '1.125rem', fontWeight: pathname === link.href ? 700 : 500,
                    color: pathname === link.href ? 'var(--color-accent)' : 'var(--color-text)',
                    textDecoration: 'none',
                    background: pathname === link.href ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/contact" style={{ padding: '0.875rem 1rem', fontSize: '1.125rem', color: 'var(--color-text)', textDecoration: 'none', fontWeight: 500, borderRadius: 'var(--radius-lg)' }}>Contact</Link>
            </nav>
            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ThemeToggle />
              <Link href="/subscribe" style={{ flex: 1, padding: '0.875rem', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-lg)', fontSize: '1rem', fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
                Subscribe to Newsletter
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 1023px) {
          .desktop-nav { display: none !important; }
          .subscribe-btn { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
