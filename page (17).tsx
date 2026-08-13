'use client';

import { useEffect, useState } from 'react';
import { getComments, updateComment, deleteComment, Comment } from '@/lib/firestore';
import { Check, X, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: 'color-mix(in srgb, #D97706 15%, transparent)', text: '#D97706' },
  approved: { label: 'Approved', bg: 'color-mix(in srgb, #16A34A 15%, transparent)', text: '#16A34A' },
  spam: { label: 'Spam', bg: 'color-mix(in srgb, #DC2626 15%, transparent)', text: '#DC2626' },
  trash: { label: 'Trash', bg: 'color-mix(in srgb, #6B7280 15%, transparent)', text: '#6B7280' },
};

function formatDate(ts: unknown): string {
  try {
    const d = (ts as { toDate?: () => Date })?.toDate ? (ts as { toDate: () => Date }).toDate() : new Date(ts as string);
    return formatDistanceToNow(d, { addSuffix: true });
  } catch { return '—'; }
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  async function load() { setLoading(true); const c = await getComments(); setComments(c); setLoading(false); }

  const setStatus = async (id: string, status: Comment['status']) => {
    setUpdating(id);
    try {
      await updateComment(id, { status });
      setComments(c => c.map(x => x.id === id ? { ...x, status } : x));
      toast.success(`Comment ${status}.`);
    } catch { toast.error('Failed to update.'); }
    finally { setUpdating(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this comment permanently?')) return;
    try {
      await deleteComment(id);
      setComments(c => c.filter(x => x.id !== id));
      toast.success('Comment deleted.');
    } catch { toast.error('Failed to delete.'); }
  };

  const filtered = comments.filter(c => filter === 'all' || c.status === filter);
  const counts = { all: comments.length, pending: comments.filter(c => c.status === 'pending').length, approved: comments.filter(c => c.status === 'approved').length, spam: comments.filter(c => c.status === 'spam').length };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Comments</h1>
        {counts.pending > 0 && <span style={{ padding: '0.375rem 0.875rem', background: 'color-mix(in srgb, #D97706 15%, transparent)', color: '#D97706', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', fontWeight: 700 }}>{counts.pending} pending review</span>}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
        {(['all', 'pending', 'approved', 'spam', 'trash'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.375rem 0.875rem', borderRadius: 'var(--radius-md)', background: filter === f ? 'var(--color-accent)' : 'transparent', color: filter === f ? '#fff' : 'var(--color-text-muted)', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, textTransform: 'capitalize' }}>
            {f} {f === 'all' ? `(${counts.all})` : f === 'pending' ? `(${counts.pending})` : f === 'approved' ? `(${counts.approved})` : f === 'spam' ? `(${counts.spam})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-accent)' }} /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)' }}>
          <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No comments</p>
          <p>{filter === 'pending' ? 'No comments awaiting review.' : `No ${filter} comments found.`}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(comment => (
            <div key={comment.id} style={{ background: 'var(--color-background)', border: `1px solid ${comment.status === 'pending' ? 'var(--color-warning)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{comment.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{comment.email}</span>
                    <span style={{ ...STATUS_STYLES[comment.status], padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>
                      {STATUS_STYLES[comment.status]?.label}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{formatDate(comment.createdAt)}</span>
                  </div>
                  <p style={{ color: 'var(--color-text)', lineHeight: 1.6, marginBottom: '0.5rem' }}>{comment.content}</p>
                  {comment.postTitle && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>On: <em>{comment.postTitle}</em></p>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
                  {comment.status !== 'approved' && <button onClick={() => setStatus(comment.id!, 'approved')} disabled={updating === comment.id} title="Approve" style={{ padding: '0.5rem', background: 'color-mix(in srgb, #16A34A 12%, transparent)', border: '1px solid #16A34A', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: '#16A34A', display: 'flex', alignItems: 'center' }}><Check size={15} /></button>}
                  {comment.status !== 'spam' && <button onClick={() => setStatus(comment.id!, 'spam')} disabled={updating === comment.id} title="Mark spam" style={{ padding: '0.5rem', background: 'color-mix(in srgb, #DC2626 12%, transparent)', border: '1px solid #DC2626', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: '#DC2626', display: 'flex', alignItems: 'center' }}><AlertTriangle size={15} /></button>}
                  {comment.status !== 'trash' && <button onClick={() => setStatus(comment.id!, 'trash')} disabled={updating === comment.id} title="Trash" style={{ padding: '0.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}><X size={15} /></button>}
                  <button onClick={() => handleDelete(comment.id!)} title="Delete permanently" style={{ padding: '0.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-error)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'}
                  ><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
