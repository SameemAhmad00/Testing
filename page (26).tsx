import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Users — Admin' };
export default function UsersPage() {
  return (
    <div style={{ maxWidth: '900px' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '1rem' }}>Users</h1>
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <p style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Firebase Auth Users</p>
        <p>User management (create, delete, change roles) requires the Firebase Admin SDK running server-side. Configure a Firebase Cloud Function or Next.js API route with the Admin SDK to manage users here.</p>
      </div>
    </div>
  );
}
