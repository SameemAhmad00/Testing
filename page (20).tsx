'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPosts, updatePost, deletePost, Post } from '@/lib/firestore';
import { Plus, Search, Edit, Trash2, Eye, Loader2, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  published: { bg: 'color-mix(in srgb, #16A34A 15%, transparent)', text: '#16A34A' },
  draft: { bg: 'color-mix(in srgb, #D97706 15%, transparent)', text: '#D97706' },
  scheduled: { bg: 'color-mix(in srgb, #2563EB 15%, transparent)', text: '#2563EB' },
  review: { bg: 'color-mix(in srgb, #7c3aed 15%, transparent)', text: '#7c3aed' },
  trash: { bg: 'color-mix(in srgb, #DC2626 15%, transparent)', text: '#DC2626' },
};

function formatDate(ts: unknown): string {
  try {
    const d = (ts as { toDate?: () => Date })?.toDate ? (ts as { toDate: () => Date }).toDate() : new Date(ts as string);
    return formatDistanceToNow(d, { addSuffix: true });
  } catch { return '—'; }
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const p = await getPosts();
      setPosts(p);
    } finally { setLoading(false); }
  }

  const filtered = posts.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.authorName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Move "${title}" to trash?`)) return;
    setDeleting(id);
    try {
      await updatePost(id, { status: 'trash' });
      setPosts(posts.map(p => p.id === id ? { ...p, status: 'trash' } : p));
      toast.success('Post moved to trash.');
    } catch { toast.error('Failed to delete post.'); }
    finally { setDeleting(null); }
  };

  const handlePublish = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      await updatePost(id, { status: newStatus, publishedAt: newStatus === 'published' ? new Date() as unknown as import('firebase/firestore').Timestamp : null });
      setPosts(posts.map(p => p.id === id ? { ...p, status: newStatus } : p));
      toast.success(newStatus === 'published' ? 'Post published!' : 'Post unpublished.');
    } catch { toast.error('Failed to update post.'); }
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Posts</h1>
        <Link href="/admin/posts/new" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-lg)', textDecoration: 'none', fontWeight: 700, fontSize: '0.9375rem' }}>
          <Plus size={18} /> New Post
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..." style={{ width: '100%', padding: '0.625rem 0.875rem 0.625rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)', fontSize: '0.9rem', fontFamily: 'var(--font-ui)', outline: 'none' }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)', fontSize: '0.9rem', fontFamily: 'var(--font-ui)', outline: 'none', cursor: 'pointer' }}>
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="review">In Review</option>
          <option value="scheduled">Scheduled</option>
          <option value="trash">Trash</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-accent)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>No posts found</p>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              {search || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Create your first post to get started.'}
            </p>
            {!search && statusFilter === 'all' && <Link href="/admin/posts/new" style={{ padding: '0.75rem 1.5rem', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 700 }}>Create First Post</Link>}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                  {['Title', 'Author', 'Category', 'Status', 'Date', 'Views', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(post => (
                  <tr key={post.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 150ms' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.875rem 1rem', maxWidth: '280px' }}>
                      <p className="line-clamp-1" style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.2rem' }}>{post.title}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>/blog/{post.slug}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{post.authorName || '—'}</td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{post.categoryName || '—'}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ padding: '0.2rem 0.625rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, ...STATUS_COLORS[post.status] }}>
                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{formatDate(post.createdAt)}</td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--color-text-muted)' }}>{(post.viewCount || 0).toLocaleString()}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Link href={`/admin/posts/${post.id}/edit`} title="Edit" style={{ padding: '0.375rem', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'}
                        ><Edit size={15} /></Link>
                        {post.status === 'published' && (
                          <a href={`/blog/${post.slug}`} target="_blank" rel="noopener" title="View" style={{ padding: '0.375rem', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-success)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'}
                          ><Eye size={15} /></a>
                        )}
                        <button type="button" onClick={() => handleDelete(post.id!, post.title)} title="Delete" disabled={deleting === post.id} style={{ padding: '0.375rem', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-error)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'}
                        >
                          {deleting === post.id ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
        Showing {filtered.length} of {posts.length} posts
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
