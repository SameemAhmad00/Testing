'use client';

import { useEffect, useState } from 'react';
import { getTags, createTag, deleteTag, Tag, slugify } from '@/lib/firestore';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);
  async function load() { setLoading(true); const t = await getTags(); setTags(t); setLoading(false); }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    setSaving(true);
    try {
      await createTag({ name: newTag.trim(), slug: slugify(newTag.trim()), postCount: 0 });
      setNewTag('');
      toast.success('Tag created!');
      load();
    } catch { toast.error('Failed to create tag.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete tag "${name}"?`)) return;
    try { await deleteTag(id); setTags(t => t.filter(x => x.id !== id)); toast.success('Tag deleted.'); }
    catch { toast.error('Failed to delete.'); }
  };

  return (
    <div style={{ maxWidth: '700px' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '1.5rem' }}>Tags</h1>

      {/* Add form */}
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        <input
          type="text"
          value={newTag}
          onChange={e => setNewTag(e.target.value)}
          placeholder="Tag name..."
          style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)', fontSize: '0.9375rem', fontFamily: 'var(--font-ui)', outline: 'none' }}
        />
        <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.75rem 1.25rem', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
          {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />} Add Tag
        </button>
      </form>

      {/* Tags grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-accent)' }} /></div>
      ) : tags.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)' }}>
          <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No tags yet</p>
          <p>Add your first tag above to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
          {tags.map(tag => (
            <div key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--color-text)' }}>{tag.name}</span>
              {tag.postCount !== undefined && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>({tag.postCount})</span>}
              <button onClick={() => handleDelete(tag.id!, tag.name)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', padding: '0.1rem' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-error)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'}
              ><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
