'use client';

import { useEffect, useState } from 'react';
import { getAuthors, createAuthor, updateAuthor, deleteAuthor, Author, slugify } from '@/lib/firestore';
import { Plus, Edit, Trash2, X, Loader2, Check, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

const blankAuthor: Omit<Author, 'id'> = { name: '', slug: '', email: '', bio: '', jobTitle: '', website: '', twitter: '', linkedin: '', instagram: '', role: 'Author', status: 'active' };

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Author | null>(null);
  const [form, setForm] = useState<Omit<Author, 'id'>>(blankAuthor);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);
  async function load() { setLoading(true); const a = await getAuthors(); setAuthors(a); setLoading(false); }

  const openNew = () => { setEditing(null); setForm(blankAuthor); setShowForm(true); };
  const openEdit = (a: Author) => {
    setEditing(a);
    setForm({ name: a.name, slug: a.slug, email: a.email || '', bio: a.bio || '', jobTitle: a.jobTitle || '', website: a.website || '', twitter: a.twitter || '', linkedin: a.linkedin || '', instagram: a.instagram || '', role: a.role || 'Author', status: a.status || 'active', avatar: a.avatar });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required.'); return; }
    setSaving(true);
    try {
      const data = { ...form, slug: form.slug || slugify(form.name) };
      if (editing?.id) { await updateAuthor(editing.id, data); toast.success('Author updated!'); }
      else { await createAuthor(data); toast.success('Author created!'); }
      setShowForm(false);
      load();
    } catch { toast.error('Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete author "${name}"?`)) return;
    try { await deleteAuthor(id); setAuthors(a => a.filter(x => x.id !== id)); toast.success('Author deleted.'); }
    catch { toast.error('Failed to delete.'); }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)', fontSize: '0.9rem', fontFamily: 'var(--font-ui)', outline: 'none' };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Authors</h1>
        <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9375rem' }}>
          <Plus size={18} /> Add Author
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.0625rem' }}>{editing ? 'Edit Author' : 'New Author'}</h2>
            <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={18} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>Full Name *</label><input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} style={inputStyle} placeholder="Jane Doe" /></div>
            <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>Slug</label><input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} style={inputStyle} placeholder="jane-doe" /></div>
            <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} placeholder="jane@example.com" /></div>
            <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>Job Title</label><input type="text" value={form.jobTitle} onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))} style={inputStyle} placeholder="Senior Writer" /></div>
            <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>Twitter Handle</label><input type="text" value={form.twitter} onChange={e => setForm(f => ({ ...f, twitter: e.target.value }))} style={inputStyle} placeholder="@handle" /></div>
            <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>LinkedIn</label><input type="text" value={form.linkedin} onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))} style={inputStyle} placeholder="linkedin.com/in/jane" /></div>
            <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>Website</label><input type="url" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} style={inputStyle} placeholder="https://janedoe.com" /></div>
            <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>Role</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={inputStyle}>
                {['Super Admin', 'Admin', 'Editor', 'Author', 'Contributor'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>Bio</label><textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Short biography..." /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>Avatar URL</label><input type="url" value={form.avatar || ''} onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))} style={inputStyle} placeholder="https://..." /></div>
          </div>
          <button onClick={handleSave} disabled={saving} style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.5rem', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
            {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />Saving...</> : <><Check size={14} />{editing ? 'Update' : 'Create'}</>}
          </button>
        </div>
      )}

      {/* Author cards */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-accent)' }} /></div>
      ) : authors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', color: 'var(--color-text-muted)' }}>
          <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No authors yet</p>
          <button onClick={openNew} style={{ padding: '0.75rem 1.5rem', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Add First Author</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {authors.map(author => (
            <div key={author.id} style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', background: 'var(--color-surface-2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {author.avatar ? <Image src={author.avatar} alt={author.name} width={48} height={48} style={{ objectFit: 'cover' }} /> : <User size={20} style={{ color: 'var(--color-text-muted)' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{author.name}</p>
                {author.jobTitle && <p style={{ fontSize: '0.8125rem', color: 'var(--color-accent)', fontWeight: 600 }}>{author.jobTitle}</p>}
                {author.bio && <p className="line-clamp-2" style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.375rem', lineHeight: 1.5 }}>{author.bio}</p>}
                <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.75rem' }}>
                  <span style={{ padding: '0.2rem 0.5rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>{author.role || 'Author'}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem' }}>
                  <button onClick={() => openEdit(author)} style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-accent)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Edit size={13} /> Edit</button>
                  <button onClick={() => handleDelete(author.id!, author.name)} style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-error)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Trash2 size={13} /> Delete</button>
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
