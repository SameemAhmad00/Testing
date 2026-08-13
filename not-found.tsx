import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '404 — Page Not Found', description: 'The page you are looking for could not be found.' };

export default function NotFound() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontSize: '7rem', fontWeight: 900, color: 'var(--color-border)', lineHeight: 1, marginBottom: '1rem', fontFamily: 'var(--font-ui)' }}>404</div>
      <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '0.75rem' }}>Looks like this page got lost.</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '1.0625rem', maxWidth: '420px', lineHeight: 1.65, marginBottom: '2.5rem' }}>
        The article you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{ padding: '0.875rem 1.75rem', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-lg)', textDecoration: 'none', fontWeight: 700, fontSize: '0.9375rem' }}>
          Go Home
        </Link>
        <Link href="/blog" style={{ padding: '0.875rem 1.75rem', background: 'var(--color-surface)', color: 'var(--color-text)', borderRadius: 'var(--radius-lg)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9375rem', border: '1px solid var(--color-border)' }}>
          Browse Articles
        </Link>
      </div>
    </div>
  );
}
