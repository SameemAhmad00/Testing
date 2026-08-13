'use client';

import { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory, Category, slugify } from '@/lib/firestore';
import { Plus, Edit, Trash2, X, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const blank: Omit<Category, 'id'> = { name: '', slug: '', description: '', seoTitle: '', seoDescription: '' };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<Omit<Category, 'id'>>(blank);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { load(); }, []);
  async function load() { setLoading(true); const c = await getCategories(); setCategories(c); setLoading(false); }

  const openNew = () => { setEditing(null); setForm(blank); setShowForm(true); };
  const openEdit = (cat: Category) => { setEditing(cat); setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', seoTitle: cat.seoTitle || '', seoDescription: cat.seoDescription || '' }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required.'); return; }
    setSaving(true);
    try {
      const data = { ...form, slug: form.slug || slugify(form.name) };
      if (editing?.id) { await updateCategory(editing.id, data); toast.success('Category updated!'); }
      else { await createCategory(data); toast.success('Category created!'); }
      setShowForm(false);
      load();
    } catch { toast.error('Failed to save category.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try { await deleteCategory(id); setCategories(c => c.filter(x => x.id !== id)); toast.success('Category deleted.'); }
    catch { toast.error('Failed to delete.'); }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)', fontSize: '0.9rem', fontFamily: 'var(--font-ui)', outline: 'none' };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Categories</h1>
        <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9375rem' }}>
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.0625rem' }}>{editing ? 'Edit Category' : 'New Category'}</h2>
            <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={18} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>Name *</label>
              <input type="text" value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) })); }} style={inputStyle} placeholder="Technology" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>Slug</label>
              <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} style={inputStyle} placeholder="technology" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Short description..." />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>SEO Title</label>
              <input type="text" value={form.seoTitle} onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>Meta Description</label>
              <input type="text" value={form.seoDescription} onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value }))} style={inputStyle} />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.5rem', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
            {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />Saving...</> : <><Check size={14} />{editing ? 'Update' : 'Create'}</>}
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-accent)' }} /></div>
        ) : categories.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No categories yet</p>
            <button onClick={openNew} style={{ padding: '0.75rem 1.5rem', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Create First Category</button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                {['Name', 'Slug', 'Description', 'Posts', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 150ms' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>{cat.name}</td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--color-text-muted)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{cat.slug}</td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--color-text-muted)', maxWidth: '200px' }} className="line-clamp-1">{cat.description || '—'}</td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--color-text-muted)' }}>{cat.postCount || 0}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button onClick={() => openEdit(cat)} style={{ padding: '0.375rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-sm)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'}
                      ><Edit size={15} /></button>
                      <button onClick={() => handleDelete(cat.id!, cat.name)} style={{ padding: '0.375rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-sm)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-error)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'}
                      ><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
