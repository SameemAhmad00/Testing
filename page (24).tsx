'use client';

import { useEffect, useState } from 'react';
import { getSubscribers, deleteSubscriber, Subscriber } from '@/lib/firestore';
import { Trash2, Search, Download, Loader2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

function formatDate(ts: unknown): string {
  try {
    const d = (ts as { toDate?: () => Date })?.toDate ? (ts as { toDate: () => Date }).toDate() : new Date(ts as string);
    return formatDistanceToNow(d, { addSuffix: true });
  } catch { return '—'; }
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);
  async function load() { setLoading(true); const s = await getSubscribers(); setSubscribers(s); setLoading(false); }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this subscriber?')) return;
    try { await deleteSubscriber(id); setSubscribers(s => s.filter(x => x.id !== id)); toast.success('Subscriber removed.'); }
    catch { toast.error('Failed to remove.'); }
  };

  const exportCSV = () => {
    const header = 'Email,Name,Status,Source,Subscribed\n';
    const rows = subscribers.map(s => `${s.email},${s.name || ''},${s.status},${s.source || ''},${(s.subscribedAt as { toDate?: () => Date })?.toDate?.()?.toISOString() || ''}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'subscribers.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported!');
  };

  const filtered = subscribers.filter(s => !search || s.email.toLowerCase().includes(search.toLowerCase()) || s.name?.toLowerCase().includes(search.toLowerCase()));
  const active = subscribers.filter(s => s.status === 'active').length;

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Subscribers</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{active.toLocaleString()} active of {subscribers.length.toLocaleString()} total</p>
        </div>
        <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)' }}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '1.25rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
        <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subscribers..." style={{ width: '100%', padding: '0.625rem 0.875rem 0.625rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)', fontSize: '0.9rem', fontFamily: 'var(--font-ui)', outline: 'none' }} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[{ label: 'Total', value: subscribers.length }, { label: 'Active', value: active }, { label: 'Unsubscribed', value: subscribers.length - active }].map(({ label, value }) => (
          <div key={label} style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.75rem', fontWeight: 900 }}>{value.toLocaleString()}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-accent)' }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Users size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <p>No subscribers found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead><tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                {['Email', 'Name', 'Status', 'Source', 'Subscribed', 'Action'].map(h => <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map(sub => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid var(--color-border)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{sub.email}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>{sub.name || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ padding: '0.2rem 0.625rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, background: sub.status === 'active' ? 'color-mix(in srgb, #16A34A 15%, transparent)' : 'var(--color-surface)', color: sub.status === 'active' ? '#16A34A' : 'var(--color-text-muted)' }}>
                        {sub.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>{sub.source || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{formatDate(sub.subscribedAt)}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <button onClick={() => handleDelete(sub.id!)} style={{ padding: '0.375rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-error)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'}
                      ><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
